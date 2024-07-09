import './Dashbroad.css'
// import TopBar from '../../components/topbar/topBar';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import StraightIcon from '@mui/icons-material/Straight';
import SouthIcon from '@mui/icons-material/South';
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import { useAuth } from '../../components/context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { updateStockName } = useAuth();
    const [attention, setAttention] = useState([]);
    const [priceBoard, setPriceBoard] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [stockName, setStockName] = useState('VNINDEX');
    // const [hoveredData, setHoveredData] = useState(null);
    const token = localStorage.getItem('token');
    // const [messages, setMessages] = useState([]);
    // const [ws, setWs] = useState(null);



    const fetchAttentionData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/attention/check_attention', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setAttention(response.data);
            } else {
                throw new Error('Failed to fetch');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchPriceBoardData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/infor/price_board',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.status === 200) {
                setPriceBoard(response.data);
            } else {
                throw new Error('Failed to fetch');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchStockData = useCallback(async (ticker) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/stock/stock_data?name=${ticker}`);
            if (response.status === 200) {
                setStockData(response.data);
            } else {
                throw new Error("Failed to fetch");
            }
        } catch (error) {
            console.error('Error fetching stock data:', error);
        }
    }, []);

    useEffect(() => {
        const currentTime = new Date();
        const currentDay = currentTime.getDay();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
    
        const isInTimeRange = () => {
            if (currentDay >= 1 && currentDay <= 5) {  // Kiểm tra từ thứ 2 đến thứ 6
                const inMorningRange = (currentHour === 9 && currentMinute >= 0 && currentMinute <= 59) ||
                                       (currentHour === 10 && currentMinute >= 0 && currentMinute <= 59) ||
                                       (currentHour === 11 && currentMinute >= 0 && currentMinute <= 29);
                
                const inAfternoonRange = (currentHour === 13 && currentMinute >= 0 && currentMinute <= 59) ||
                                         (currentHour === 14 && currentMinute >= 0 && currentMinute <= 59) ||
                                         (currentHour === 15 && currentMinute >= 0 && currentMinute <= 0);  // Kết thúc lúc 15h00
                
                if (inMorningRange || inAfternoonRange) {
                    return true;
                }
            }
            return false;
        };

        fetchStockData(stockName);
        fetchAttentionData();
        fetchPriceBoardData();
    
        const fetchStockDataInterval = setInterval(() => {
            if (isInTimeRange()) {
                fetchStockData(stockName);
            }
        }, 5 * 60 * 1000);

        const fetchAttentionDataInterval = setInterval(() => {
            if (isInTimeRange()) {
                fetchAttentionData();
            }
        }, 60 * 1000);

        return () => {
            clearInterval(fetchStockDataInterval);
            clearInterval(fetchAttentionDataInterval);
        };
    }, []);
    

    

    // Chuẩn bị dữ liệu cho biểu đồ
    const labels = stockData.map(item => item.time);
    const closeData = stockData.map(item => item.close);
    const volumeData = stockData.map(item => item.volume);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Close Price',
                data: closeData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                yAxisID: 'y'
            },
            {
                label: 'Volume',
                data: volumeData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                type: 'bar',
                yAxisID: 'y1'
            }
        ]
    };

    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        scales: {
            x: {
                display: false, // Ẩn trục x
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    const translateSignal = (signal) => {
        switch (signal) {
          case 'Neutral':
            return 'Trung lập';
          case 'Strong Sell':
            return 'Bán mạnh';
          case 'Strong Buy':
            return 'Mua mạnh';
          case 'Sell':
            return 'Bán';
          case 'Buy':
            return 'Mua';
          default:
            return signal;
        }
      };
    

    const handleClick = (newStockName) => {
        updateStockName(newStockName); // Cập nhật stockName khi người dùng click vào Mã CP
    };
    

    return (
        <div className='Container'>
            <div className="dashboard grid wide">
                <div className='' style={{display:'flex'}}>
                    <div className='c-8'>
                    <div>
                    <div className='chart'>
                        <h2>Chỉ số chứng khoán</h2>
                        <div style={{ height: '300px', width: '600px' }}>
                            <Line data={data} options={options} />
                        </div>
                        <div>
                        {stockData.length > 0 && (
                            <>
                                <div className='chart_bottom'>
                                    <div className={`chart_bottom_item ${stockData[stockData.length - 1].Change > 0 ? 'positive-change' : 'negative-change'}`} style={{marginLeft: '5px'}}>
                                        {stockData[stockData.length - 1].close}
                                    </div>
                                    <div className={`chart_bottom_item ${stockData[stockData.length - 1].Change > 0 ? 'positive-change' : 'negative-change'}`} style={{marginLeft: '5px'}}>
                                        {stockData[stockData.length - 1].Change > 0 ? <StraightIcon sx={{ color: 'green', fontSize:'14px' }} /> : <SouthIcon sx={{ color: 'red', fontSize:'14px' }} />}
                                        {stockData[stockData.length - 1].Change.toFixed(2)}
                                    </div>
                                    <div className={`chart_bottom_item ${stockData[stockData.length - 1].Change > 0 ? 'positive-change' : 'negative-change'}`} style={{marginLeft: '5px'}}>
                                    ({stockData[stockData.length - 1]['% Change'].toFixed(2)}%)
                                    </div>
                                    <div className='chart_bottom_item' style={{marginLeft: '5px'}}>
                                        {stockData[stockData.length - 1].volume} CP
                                    </div>
                                </div>
                            </>


                            )}
                        </div>
                    </div>
                    </div>
                        <div className="price-board">
                            <h2>Danh mục của bạn</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã CP</th>
                                        <th>Giá</th>
                                        <th>KLBD/TB5D</th>
                                        <th>T.độ GD</th>
                                        {/* <th>KLGD ròng(CM)</th> */}
                                        <th>RSI</th>
                                        <th>MACD Hist</th>
                                        <th>MACD Signal</th>
                                        <th>Tín hiệu KT</th>
                                        <th>Tín hiệu TB động</th>
                                        <th>MA20</th>
                                        <th>MA50</th>
                                        <th>MA100</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {priceBoard.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                            <Link to={`/stock/ticker=${item['Mã CP']}`} onClick={() => handleClick(item['Mã CP'])}>
                                                {item['Mã CP']}
                                            </Link>
                                            </td>
                                            <td>{item['Giá']}</td>
                                            <td>{item['KLBD/TB5D']}</td>
                                            <td>{item['T.độ GD']}</td>
                                            {/* <td>{item['KLGD ròng(CM)']}</td> */}
                                            <td>{item['RSI'] != null ? item['RSI'].toFixed(2) : ''}</td>
                                            <td>{item['MACD Hist']}</td>
                                            <td>{translateSignal(item['MACD Signal'])}</td>
                                            <td>{translateSignal(item['Tín hiệu KT'])}</td>
                                            <td>{translateSignal(item['Tín hiệu TB động'])}</td>
                                            <td>{item['MA20']}</td>
                                            <td>{item['MA50']}</td>
                                            <td>{item['MA100']}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='attention c-4'>
                        <div style={{fontWeight:'bold', fontSize:'20px'}}>Cảnh báo</div>
                        {attention.map((item) => (
                            <div className="attention-item" key={item.id}>
                                <div className='attention_top-item'>
                                    <div>
                                    Mã:
                                    <Link to={`/stock/ticker=${item.ticker}`} onClick={() => handleClick(item.ticker)}>
                                    {item.ticker}
                                    </Link>
                                        </div>
                                    <div style={{ marginLeft:'10px', color:'#7c7272'}}>{format(new Date(item.time), 'HH:mm dd/MM')}</div>
                                </div>
                                <div>
                                    {item.type_id === 1 && (
                                        <div style={{display:'flex'}}>
                                            <div><strong>Khối lượng đột biến:</strong> Khối lượng cao hơn 2 lần trung bình 5 phiên </div>
                                            {/* <div style={{marginLeft:'5px'}}>Khối lượng cao hơn 2 lần trung bình 5 phiên</div> */}
                                        </div>
                                    )}
                                    {item.type_id === 2 && (
                                        <div style={{display:'flex'}}>
                                            <div>Tăng ngắn hạn: </div>
                                            <div style={{marginLeft:'5px'}}>Giá cắt lên đường SMA(5)</div>
                                        </div>
                                    )}
                                    {item.type_id === 3 && (
                                        <div style={{display:'flex'}}>
                                            <div>Giảm ngắn hạn:</div>
                                            <div style={{marginLeft:'5px'}}>Giá cắt xuống đường SMA(5)</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

