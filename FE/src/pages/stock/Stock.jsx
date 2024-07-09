import { useEffect, useRef,useState,useCallback } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
// import TopBar from "../../components/topbar/topBar";
import axios from 'axios';
import {getStartDate, removeDuplicates,getStartWeek } from '../../components/untils';
import { calculateMovingAverageSeriesData,calculateRSISeriesData, calculateMACDSeriesData } from '../../components/indicator';
import StraightenIcon from '@mui/icons-material/Straighten';
import EditIcon from '@mui/icons-material/Edit';
import './Stock.css';
import { useAuth } from '../../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StockChart = () => {
  const { stockName, updateGuide } = useAuth();
  console.log("stockName",stockName);
  const chartContainerRef = useRef();
  const chart = useRef();
  const rsiContainerRef = useRef();
  const rsiChart = useRef();
  const macdChart = useRef();
  const macdContainerRef = useRef();
  const [priceData, setPriceData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [name,setName] = useState('TCB')
  const [nameCompany,setNameCompany] = useState('')
  const [detailData, setDetailData] = useState({});
  const [companiesData,setCompaniesData] = useState([]);
  const [revolution, setRevolution] = useState('D')
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const navigate = useNavigate();


  const fetchData = useCallback(async (ticker,revolution) => {
    let startDate = '';
    const currentDate = new Date();
    const endDate = currentDate.toISOString().split('T')[0];
    if(revolution === 'D'|| revolution === ''){
        startDate = '2023-06-01';
    }
    if(revolution === 'W'){
        startDate = '2022-01-01';
    }
    if(revolution === 'M'){
        startDate = '2000-01-01';
    }
    try {
        const response = await axios.get(`http://localhost:8000/stock/stock_data3/?name=${name}&start_date=${startDate}&end_date=${endDate}&revolution=${revolution}`);

        if (response.status !== 200) {
            throw new Error("Failed to fetch");
        }



        // Lấy dữ liệu từ phản hồi
        const data = removeDuplicates(response.data);

        if (Array.isArray(data) && data.length > 0) {
            // Tạo mảng priceData để lưu trữ dữ liệu
            const priceData = [];
            const volumeData = [];
              
            const downColor = '#ff4976'; // Màu của nến giảm
            const upColor = '#4bffb5'; // Màu của nến tăng

            // Lặp qua mỗi phần tử của mảng dữ liệu và thêm vào priceData
            data.forEach(item => {
                priceData.push({
                  open: item.open,
                  high: item.high,
                  low: item.low,
                  close: item.close,
                  time: item.time,
                });
            });
            data.forEach(item => {
              const color = item.close > item.open ? upColor : downColor;
                volumeData.push({
                  value: item.volume,
                  color: color,
                  time: item.time,
                });
            });

            // Cập nhật state với mảng priceData đã được tạo
            setPriceData(priceData);
            setVolumeData(volumeData);
            setNameCompany(ticker)
        } else {
            throw new Error("Invalid data format or empty response");
        }
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Lỗi khi gửi yêu cầu:', error);
    }
}, [name]);

const fetchData2 = async (ticker) => {
    try {
        const response = await axios.get(`http://localhost:8000/stock/analysis?name=${ticker}`);
        if (response.status !== 200) {
            throw new Error("Failed to fetch");
        }

        // Lấy dữ liệu từ phản hồi
        const data = response.data[ticker];
        setDetailData(data);
        console.log("detail Data", detailData);
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Lỗi khi gửi yêu cầu:', error);
    }   
}

const fetchData3 = useCallback ( async (startDate,endDate,revolution) => {
  try {
      const response = await axios.get(`http://localhost:8000/stock/stock_data3/?name=${name}&start_date=${startDate}&end_date=${endDate}&revolution=${revolution}`);
      if (response.status !== 200) {
          throw new Error("Failed to fetch");
      }
      return removeDuplicates(response.data);
  } catch (error) {
      // Xử lý lỗi nếu có
      console.error('Lỗi khi gửi yêu cầu:', error);
  }
}, [name])




const fetchData4 = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/infor/companies-data');
    if (response.status !== 200) {
        throw new Error("Failed to fetch");
    }

    // Lấy dữ liệu từ phản hồi
    const data = response.data;
    setCompaniesData(data);
} catch (error) {
    // Xử lý lỗi nếu có
    console.error('Lỗi khi gửi yêu cầu:', error);
}   
}


useEffect(() => {
  const effectiveStockName = stockName || 'TCB';
  fetchData(effectiveStockName, 'D');
  fetchData2(effectiveStockName);
  fetchData4();
}, [stockName]);




  useEffect(() => {
    const initChart = (container,showTimeScale = true) => {
      return createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        grid: {
          vertLines: {
            color: '#334158',
          },
          horzLines: {
            color: '#334158',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        priceScale: {
          borderColor: '#485c7b',
        },
        timeScale: showTimeScale?  {
          borderColor: '#485c7b',}
          :{
          visible: false
          },
      });
    };
    chart.current = initChart(chartContainerRef.current,false);
    rsiChart.current = initChart(rsiContainerRef.current,false);
    macdChart.current = initChart(macdContainerRef.current);



    const maData20 = calculateMovingAverageSeriesData(priceData, 20);

    const maData50 = calculateMovingAverageSeriesData(priceData, 50);

    const maSeries20 = chart.current.addLineSeries({ color: '#2962FF', lineWidth: 1 });
    maSeries20.setData(maData20);

    const maSeries50 = chart.current.addLineSeries({ color: 'red', lineWidth: 1 });
    maSeries50.setData(maData50);

    const candleSeries = chart.current.addCandlestickSeries({
      upColor: '#4bffb5',
      downColor: '#ff4976',
      borderDownColor: '#ff4976',
      borderUpColor: '#4bffb5',
      wickDownColor: '#838ca1',
      wickUpColor: '#838ca1',
    });

    
    candleSeries.priceScale().applyOptions({
        scaleMargins: {
            // positioning the price scale for the area series
            top: 0.1,
            bottom: 0.25,
        },
        minimumWidth: 60,
    });

    console.log("priceData",priceData);
    candleSeries.setData(removeDuplicates(priceData));

    const volumeSeries = chart.current.addHistogramSeries({
        priceFormat: {
            type: 'volume',
        },
        lastValueVisible: false, // vô hiệu hóa giá cuối
        priceLineVisible: false, // vô hiệu hóa giá cuối
        priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });
    volumeSeries.priceScale().applyOptions({
        // set the positioning of the volume series
        scaleMargins: {
            top: 0.8, // highest point of the series will be 70% away from the top
            bottom: 0,
        },
    });

    console.log("volumeData",volumeData);
    volumeSeries.setData(removeDuplicates(volumeData));

    const symbolName = 'Chi tiết : ';
    const volumeName = 'Khối lượng : '

    // hàm định dạng số
    function formatVolume(value) {
      const suffixes = ["", "K", "M", "B", "T"];
      const index = Math.floor(Math.log10(Math.abs(value)) / 3);
      const scaledValue = value / Math.pow(10, index * 3);
      const suffix = suffixes[index];
      return scaledValue.toFixed(2) + suffix;
    }
  
    // tạo chú giải cho chart
    const container = chartContainerRef.current;

    const legend = document.createElement('div');
    legend.className = 'legend';
    container.appendChild(legend);

    const firstRow = document.createElement('div');
    firstRow.innerHTML = symbolName;
    firstRow.style.color = 'black';

    const secondRow = document.createElement('div');
    secondRow.innerHTML = volumeName;
    secondRow.style.color = 'black';
    
    legend.appendChild(firstRow);
    legend.appendChild(secondRow);




      const rsiData = calculateRSISeriesData(priceData, 14);
      
      const rsiSeries = rsiChart.current.addLineSeries({ 
        color: "blue",
        lineWidth: 1,
        lastValueVisible: false, // vô hiệu hóa giá cuối
        priceLineVisible: false, 
        crosshairMarkerVisible: false,
      });
      rsiSeries.setData(rsiData);

      rsiSeries.priceScale().applyOptions({
        minimumWidth: 60,
      });

const areaRsiData = (rsiData,value) =>{
  let data = rsiData.map(item => ({
    time: item.time,
    value: value
  }))
  return data
}

  const areaSeries70 = rsiChart.current.addAreaSeries({
      topColor: 'rgba(0, 255, 0, 0.5)',
      bottomColor: 'rgba(0, 255, 0, 0.05)',
      lineColor: 'rgba(14, 1, 1, 0.5)',
      lineWidth: 1,
      lineStyle: 3, // nét đứt 
      lastValueVisible: false, // hide the last value marker for this series
      crosshairMarkerVisible: false, // hide the crosshair marker for this series
  });
  areaSeries70.setData(areaRsiData(rsiData,70));

  const areaSeries30 =  rsiChart.current.addAreaSeries({
      topColor: 'transparent',
      bottomColor: 'rgba(255, 0, 0, 0.2)',
      lineColor: 'rgba(14, 1, 1, 0.5)',
      lineWidth: 1,
      lineStyle: 3, 
      lastValueVisible: false, // hide the last value marker for this series
      crosshairMarkerVisible: false, // hide the crosshair marker for this series
  });
  areaSeries30.setData(areaRsiData(rsiData,30));

    // tạo chú giải cho rsiChart
    const rsiContainer = rsiContainerRef.current;

    const legend2 = document.createElement('div');

    legend2.className = 'legend';
    rsiContainer.appendChild(legend2);

    const rsiRow = document.createElement('div');
    rsiRow.style.color = 'black';

    
    legend2.appendChild(rsiRow);
      

      
      const macdData = calculateMACDSeriesData(priceData, 12, 26, 9);
      const macdLineData = macdData.map(item => ({ time: item.time, value: item.MACD }));
      const signalLineData = macdData.map(item => ({ time: item.time, value: item.SignalLine }));
      const histogramData = macdData.map(item => ({ time: item.time, value: item.Histogram }));

      const macdSeries = macdChart.current.addLineSeries({
        color: "blue",
        lineWidth: 1,
        lastValueVisible: false, // vô hiệu hóa giá cuối
        priceLineVisible: false, 
      });
      macdSeries.setData(macdLineData);

      macdSeries.priceScale().applyOptions({
        minimumWidth: 60,
      });

      // console.log("macd", macdLineData);

      const signalSeries = macdChart.current.addLineSeries({
        color: "red",
        lineWidth: 1,
        lastValueVisible: false, // vô hiệu hóa giá cuối
        priceLineVisible: false, 
      });
      signalSeries.setData(signalLineData);

// Giả sử rằng histogramData là một mảng chứa các đối tượng với thuộc tính time và value.
const preparedHistogramData = histogramData.map(bar => ({
    ...bar,
    color: bar.value >= 0 ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
}));

const histogramSeries = macdChart.current.addHistogramSeries({
    lineWidth: 1,
    priceFormat: {
        type: 'volume',
    },
    lastValueVisible: false,
    priceLineVisible: false,
});

histogramSeries.setData(preparedHistogramData);

    // tạo chú giải cho chart
    const macdContainer = macdContainerRef.current;
    const legend3 = document.createElement('div');
    legend3.className = 'legend';
    macdContainer.appendChild(legend3);

    const macdRow = document.createElement('div');
    macdRow.style.color = 'black';    

    legend3.appendChild(macdRow);



          // console.log("macd" , macdData)
      // đồng bộ trục thời gian giữa các biểu đồ
      const syncTimeScale = (source, target) => {
        source.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
          target.timeScale().setVisibleLogicalRange(logicalRange);
        });
      };
      
      syncTimeScale(chart.current, rsiChart.current);
      syncTimeScale(rsiChart.current, chart.current);
      syncTimeScale(chart.current, macdChart.current);
      syncTimeScale(macdChart.current, chart.current);
      syncTimeScale(rsiChart.current, macdChart.current);
      syncTimeScale(macdChart.current, rsiChart.current);
    


function updateChart(param) {
  if (param.time) {
      const candleData = param.seriesData.get(candleSeries);
      const rsiData = param.seriesData.get(rsiSeries);
      const volumeData = param.seriesData.get(volumeSeries);
      const macdData = param.seriesData.get(macdSeries);
      const signalData = param.seriesData.get(signalSeries);
      const hisData = param.seriesData.get(histogramSeries);      
      if (candleData) {
          const { open, high, low, close } = candleData;
          const openFormatted = open.toFixed(2);
          const highFormatted = high.toFixed(2);
          const lowFormatted = low.toFixed(2);
          const closeFormatted = close.toFixed(2);
          
          // Cập nhật giao diện người dùng với các giá trị mới
          // Ví dụ: bạn có thể cập nhật các thẻ HTML để hiển thị các giá trị này
          firstRow.innerHTML = `${symbolName} <span> O </span> <strong>${openFormatted}</strong>  <span> H </span> <strong>${highFormatted}</strong> <span> L </span> <strong>${lowFormatted}</strong> <span> C </span> <strong>${closeFormatted}</strong>`;
      }
      if(rsiData){
        const rsiFormatted = rsiData.value.toFixed(2);
  
        rsiRow.innerHTML = ` RSI : <strong> ${rsiFormatted} </strong>`;
      }
      if (volumeData) {
        const  volumeFormatted = formatVolume(volumeData.value);

          secondRow.innerHTML = `Khối lượng : <strong> ${volumeFormatted} </strong>`;
      }

      if (macdData && signalData && hisData) {
          const macdFormatted = macdData.value.toFixed(2);
          const signalFormatted = signalData.value.toFixed(2);
          const histogramFormatted = hisData.value.toFixed(2);

          macdRow.innerHTML = ` MACD : <strong> ${macdFormatted} </strong> Signal <strong> ${signalFormatted} </strong> Histogram <strong> ${histogramFormatted} </strong>`;
          
        }
  }
}



// Hàm lấy điểm dữ liệu tương ứng với con trỏ chéo
function getCrosshairDataPoint(series, param) {
  if (!param.time) {
      return null;
  }
  const dataPoint = param.seriesData.get(series);
  return dataPoint ? { ...dataPoint, time: param.time } : null;
}

// Hàm đồng bộ hóa con trỏ chéo
function syncCrosshair(chart, series, dataPoint) {
  if (dataPoint) {
      chart.current.setCrosshairPosition(dataPoint.value, dataPoint.time, series);
  } else {
      chart.current.clearCrosshairPosition();
  }
}

// const rows = [firstRow, secondRow, rsiRow, macdRow];

// Hàm đăng ký sự kiện con trỏ chéo
function subscribeCrosshairMove(sourceChart, sourceSeries, targetCharts) {
  sourceChart.current.subscribeCrosshairMove(param => {
      const dataPoint = getCrosshairDataPoint(sourceSeries, param);
      targetCharts.forEach(({ chart, series }) => {
          syncCrosshair(chart, series, dataPoint);
      });
  });
  sourceChart.current.subscribeCrosshairMove(updateChart);
}
console.log("chart",chart.current);

// Đăng ký sự kiện con trỏ chéo cho các biểu đồ
subscribeCrosshairMove(chart, candleSeries, [
  { chart: rsiChart, series: rsiSeries },
  { chart: macdChart, series: macdSeries }
]);

subscribeCrosshairMove(rsiChart, rsiSeries, [
  { chart: chart, series: candleSeries },
  { chart: macdChart, series: macdSeries }
]);

subscribeCrosshairMove(macdChart, macdSeries, [
  { chart: chart, series: candleSeries },
  { chart: rsiChart, series: rsiSeries }
]);


      let isFetchingData = false;

      chart.current.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
          if (logicalRange.from < 10 && !isFetchingData) {
              isFetchingData = true;
              let endDateString = '';
              let startDate = '';
              let PriceData = [];
              let VolumeData = [];
              PriceData = candleSeries.data();
              VolumeData = volumeSeries.data();
              // console.log("Data",PriceData);
              console.log(revolution);
              
              if (PriceData.length > 0) {
                  endDateString = PriceData[0].time;
                  const endDate = new Date(endDateString);
                  if(revolution === 'D'){
                  
                      startDate = getStartDate(endDate);
                  }

                  if(revolution === 'W'){
                      startDate = getStartWeek(endDate);
                  }
                  
                  if(revolution === 'M'){
                    return 0;
                  }
                  
                  // Gọi fetchData3 và xử lý dữ liệu mới trong phần xử lý của promise
                  fetchData3(startDate, endDateString, revolution)
                  .then(data => {
                      if (Array.isArray(data) && data.length > 0) {
                          const downColor = '#ff4976';
                          const upColor = '#4bffb5';
                          const newPriceData = [];
                          const newVolumeData = [];
                          
                          data.forEach(item => {
                              newPriceData.push({
                                open: item.open,
                                high: item.high,
                                low: item.low,
                                close: item.close,
                                time: item.time,
                              });
                          });
      
                          data.forEach(item => {
                              const color = item.close > item.open ? upColor : downColor;
                              newVolumeData.push({
                                value: item.volume,
                                color: color,
                                time: item.time,
                              });
                          });
                          // Loại bỏ phần tử cuối cùng từ newPriceData
                          newPriceData.pop();
                          console.log("newPrice", newPriceData);
                                                
                          // Loại bỏ phần tử cuối cùng từ newVolumeData
                          newVolumeData.pop();                     
                          
                          const updatedPriceData =  [...newPriceData, ...PriceData];
                          const updatedVolumeData = [...newVolumeData, ...VolumeData];
                          let rsiData = calculateRSISeriesData(updatedPriceData, 14);
                          
                          candleSeries.setData(updatedPriceData);
                          volumeSeries.setData(updatedVolumeData);
                          // cập nhật lại dữ liệu MA
                          maSeries20.setData(calculateMovingAverageSeriesData(updatedPriceData, 20));
                          maSeries50.setData(calculateMovingAverageSeriesData(updatedPriceData, 50));
                          // cập nhật lại dữ liệu RSI
                          rsiSeries.setData(rsiData);
                          areaSeries70.setData(areaRsiData(rsiData,70));
                          areaSeries30.setData(areaRsiData(rsiData,30));
                          // cập nhật lại dữ liệu MACD
                          const updatedMACDData = calculateMACDSeriesData(updatedPriceData, 12, 26, 9);
                          const updatedMACDLineData = updatedMACDData.map(item => ({ time: item.time, value: item.MACD }));
                          const updatedSignalLineData = updatedMACDData.map(item => ({ time: item.time, value: item.SignalLine }));
                          const updatedHistogramData = updatedMACDData.map(item => ({ time: item.time, value: item.Histogram }));
                          macdSeries.setData(updatedMACDLineData);
                          signalSeries.setData(updatedSignalLineData);
                          // histogramSeries.setData(updatedHistogramData);
                          const updatedPreparedHistogramData = updatedHistogramData.map(bar => ({
                            ...bar,
                            color: bar.value >= 0 ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
                          }));
                          histogramSeries.setData(updatedPreparedHistogramData);
                        
                      

                      }
                  })
                  .catch(error => {
                      console.error(error);
                  })
                  .finally(() => {
                      isFetchingData = false;
                  });
              }
          }
      });
      
    

    return () =>{
        chart.current.remove();
        rsiChart.current.remove();
        macdChart.current.remove();
        container.removeChild(legend);
        rsiContainer.removeChild(legend2);
        macdContainer.removeChild(legend3);
        chart.current.unsubscribeCrosshairMove();
        chart.current.timeScale().unsubscribeVisibleLogicalRangeChange();
    } 
  }, [priceData, volumeData]);


  
  const handleFetchData = (ticker) => {
    const companyExists = companiesData.some(company => company.ticker === ticker);
    if (!companyExists) {
        alert("Không tìm thấy mã này! Bạn đã nhập đúng?");
        setSearchTerm('');
        return;
    }
    fetchData(ticker, 'D');
    fetchData2(ticker);
    setSearchTerm('');
}

useEffect(() => {
  if (searchTerm === '') {
    setSuggestions([]);
  } else {
    const filteredSuggestions = companiesData.filter(company =>
      company.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  }
}, [searchTerm, companiesData]);

const handleSearchChange = (e) => {
  const upperCaseValue = e.target.value.toUpperCase();
  setSearchTerm(upperCaseValue);
  setName(upperCaseValue);
};

const handleSelectCompany = (selectedCompany) => {
  setName(selectedCompany.ticker);

  handleFetchData(selectedCompany.ticker);
  handleShowOverlay();

};

const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleFetchData(name);
    handleShowOverlay();
  }
}

// Lọc dữ liệu công ty có name tương ứng
const filteredCompanies = companiesData.filter(company => company.ticker === nameCompany);

const handleShowOverlay = () => {
  setShowOverlay(!showOverlay);
}


const handleChangeRevolution = ( revo ) => {
  setRevolution(revo);
  fetchData(name,revo);
}

const handleClick = (newGuide) => {
  updateGuide(newGuide);
  navigate('/guide');
};

  return (
    <>
      {showOverlay && ( 
        <div className='overlay' >

          <div className='overlay-container' onMouseDown={(e) => e.stopPropagation()}>
            <div className='search'>
              <div> <h2>Tìm kiếm mã giao dịch</h2></div>
              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Tìm kiếm ở đây"
                />
              </div>
              <div style={{display:'flex', textAlign:'start', marginTop:'10px',paddingLeft:'10px' }}>
                <span className='c-2'> Mã </span>
                <span className='c-8'> Thông tin</span>
                <span className='c-2'> Sàn </span>
              </div>
              {suggestions.length > 0 && (
                <ul className="suggestions" onWheel={(e) => e.stopPropagation()} >
                  {suggestions.map(company => (
                    <li key={company.id}  >
                      <div className="company-info" onClick={() => handleSelectCompany(company)}>
                        <div className="company-info-item c-2">{company.ticker}</div>
                        <div className="company-info-item c-8">{company.name}</div>
                        <div className="company-info-item c-2">{company.group}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='overlay-background' onClick={handleShowOverlay}>

          </div>
        </div>
      )}

    <div className='Container'>
      <div className='stock'>
        <div className='container'>
            <div className='chart-container'>
              <div className='view-chart'>
                <div className='top-chart'>
                <div className='top-chart-bar ' style={{backgroundColor:'white', height:'100%'}}>
                <div className='top-ticker c-2' onClick={handleShowOverlay} >
                  <span>{nameCompany}</span>
                </div>
                {/* <div className='divider'></div> */}
                  <div className='top-detail c-6'>
                    <div>
                    {filteredCompanies.map(company => (
                      <div key={company.ticker}>
                      {company.name}
                      </div>
                    ))}
                    </div>
                  </div>
                  <div className='top-select c-4' style={{display:'flex'}}>
                    <span className='c-4' onClick={() => handleChangeRevolution('D')}> D</span>
                    <span className='c-4' onClick={() => handleChangeRevolution('W')} > W</span>
                    <span className='c-4' onClick={() => handleChangeRevolution('M')} > M</span>
                  </div>
                </div>
                </div>
                <div className='left-chart'>
                  <div style={{backgroundColor:'white', height:'100%'}}>
                    <div className='icon-chart'>
                      <StraightenIcon sx={{fontSize: 30}}/>
                    </div>
                    <div className='icon-chart'>
                      <EditIcon sx={{fontSize: 30}}/>
                    </div>
                  </div>
                </div>
                <div className='main-chart'>
                    <div  ref={chartContainerRef}style={{height:'360px', position:"relative"}} />
                    <div className="separator"></div>
                    <div ref={rsiContainerRef} style={{height:'125px',position: "relative"}} />
                    <div className="separator"></div>
                    <div ref={macdContainerRef} style={{height:'150px', position:"relative"}} />
                </div>

              </div>

            </div>
        </div>
        <div className='right-container'>
            <div className='right-infor' style={{ height: '90vh', overflowY: 'auto' }}>
              {/* <table className='stock-table'>
                <tbody>
                  {Object.entries(detailData).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table> */}
            <table className='stock-table'>
            <thead>
              <tr>
                <th>Thông tin</th>
                <th>Giá trị</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Giá</td>
                <td>{detailData['Giá']}</td>
              </tr>
              <tr>
                <td>Vốn hóa (tỷ)</td>
                <td>{detailData['Vốn hóa (tỷ)']}</td>
              </tr>
              <tr>
                <td>Số phiên tăng/giảm liên tiếp</td>
                <td>{detailData['Số phiên tăng/giảm liên tiếp']}</td>
              </tr>
              <tr>
                <td onClick={() => handleClick("P/E")} 
                  className='item_name_guide'>
                    P/E
                </td>
                <td>{detailData['P/E']}</td>
              </tr>
              <tr>
                <td>PEG</td>
                <td>{detailData['PEG']}</td>
              </tr>
              <tr>
                <td onClick={() => handleClick("P/B")} 
                  className='item_name_guide'>
                    P/B
                </td>
                <td>{detailData['P/B']}</td>
              </tr>
              <tr>
                <td>Cổ tức</td>
                <td>{detailData['Cổ tức']}</td>
              </tr>
              <tr>
                <td onClick={() => handleClick("ROE")} 
                  className='item_name_guide'>
                    ROE
                </td>
                <td>{detailData['ROE']}</td>
              </tr>
              <tr>
                <td onClick={() => handleClick("ROA")} 
                  className='item_name_guide'>
                    ROA
                </td>
                <td>{detailData['ROA']}</td>
              </tr>
              <tr>
                <td>Nợ/Vốn CSH</td>
                <td>{detailData['Nợ/Vốn CSH']}</td>
              </tr>
              <tr>
                <td>LNST 5 năm</td>
                <td>{detailData['LNST 5 năm']}</td>
              </tr>
              <tr>
                <td>Doanh thu 5 năm</td>
                <td>{detailData['Doanh thu 5 năm']}</td>
              </tr>
              <tr>
                <td>LNST quý gần nhất</td>
                <td>{detailData['LNST quý gần nhất']}</td>
              </tr>
              <tr>
                <td>Doanh thu quý gần nhất</td>
                <td>{detailData['Doanh thu quý gần nhất']}</td>
              </tr>
              <tr>
                <td>LNST năm tới</td>
                <td>{detailData['LNST năm tới']}</td>
              </tr>
              <tr>
                <td>Doanh thu năm tới</td>
                <td>{detailData['Doanh thu năm tới']}</td>
              </tr>
              <tr>
                <td onClick={() => handleClick("RSI")} 
                  className='item_name_guide'>
                    RSI
                </td>
                <td>{detailData['RSI'] != null ? detailData['RSI'].toFixed(2) : ''}</td>
              </tr>
              <tr>
                <td>RS</td>
                <td>{detailData['RS']}</td>
              </tr>
            </tbody>
          </table>
            </div>


        </div>
      </div>
    </div>

    </>
  );
}


export default StockChart;
