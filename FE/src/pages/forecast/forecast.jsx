import './forecast.css'
import axios from 'axios';
import { useEffect, useState, useRef, useCallback } from 'react';
import StraightenIcon from '@mui/icons-material/Straighten';
import EditIcon from '@mui/icons-material/Edit';
import { CrosshairMode, createChart } from 'lightweight-charts';
import {getStartDate, removeDuplicates } from '../../components/untils';
import { calculateMovingAverageSeriesData,calculateMACDSeriesData,calculateRSISeriesData } from '../../components/indicator';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';


const Forecast = () => {
    const mainChartContainerRef = useRef();
    const mainChart = useRef();
    const rsiChartContainerRef = useRef();
    const rsiChart = useRef();
    const macdChart = useRef();
    const macdChartContainerRef = useRef();
    const [priceData, setPriceData] = useState([]);
    const [volumeData, setVolumeData] = useState([]);
    const [name, setName] = useState('MSN');
    const [rsiMarker, setRsiMarker] = useState([]);
    const [macdMarker,setMacdMarker] = useState([]);



    const fetchData = useCallback(async (ticker) => {
      const currentDate = new Date();
      const endDate = currentDate.toISOString().split('T')[0];
      const startDate = ('2023-06-11')
        try {
            const response = await axios.get(`http://127.0.0.1:8000/forecast/stock_data2?name=${ticker}&start_date=${startDate}&end_date=${endDate}`);
    
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
                        change: item.change,
                        perChange: item.perChange
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
                // setNameCompany(ticker)
            } else {
                throw new Error("Invalid data format or empty response");
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Lỗi khi gửi yêu cầu:', error);
        }
    }, [name]);

    const fetchData2 = async (ticker) => {
      const currentDate = new Date();
      const endDate = currentDate.toISOString().split('T')[0];
      const startDate = ('2023-06-11')
      try {
        const response = await axios.get(`http://127.0.0.1:8000/forecast/test_rsi?name=${ticker}&start_date=${startDate}&end_date=${endDate}`);
        if (response.status !== 200) {
            throw new Error("Failed to fetch");
        }
    
        // Lấy dữ liệu từ phản hồi
        const data = response.data;
        setRsiMarker(data);


    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Lỗi khi gửi yêu cầu:', error);
    }   
    }

    const fetchData4 = async (ticker) => {
      const currentDate = new Date();
      const endDate = currentDate.toISOString().split('T')[0];
      const startDate = ('2023-06-11')
      try {
        const response = await axios.get(`http://127.0.0.1:8000/forecast/test_macd?name=${ticker}&start_date=${startDate}&end_date=${endDate}`);
        if (response.status !== 200) {
            throw new Error("Failed to fetch");
        }
    
        // Lấy dữ liệu từ phản hồi
        const data = response.data;
        setMacdMarker(data);


    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Lỗi khi gửi yêu cầu:', error);
    }   
    }

    const fetchData3 = useCallback ( async (startDate,endDate) => {
      try {
          const response = await axios.get(`http://127.0.0.1:8000/forecast/stock_data2?name=${name}&start_date=${startDate}&end_date=${endDate}`);
          if (response.status !== 200) {
              throw new Error("Failed to fetch");
          }
          return removeDuplicates(response.data);
      } catch (error) {
          // Xử lý lỗi nếu có
          console.error('Lỗi khi gửi yêu cầu:', error);
      }
    }, [name])
    
    useEffect(() => {
        fetchData(name);
        fetchData2(name);
        fetchData4(name);
    }, []);

const selectName = [
  {
    ticker: "VN30",
    detail: "chỉ số VN30"
  },
  {
    ticker: "MSN",
    detail: "Tập đoàn Masan"
  },
  {
    ticker: "MWG",
    detail: "Công ty Thế giới di động"
  }
]


    useEffect(() => {
        const initChart = (container,showTimeScale = true) => {
          return createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight,
            // layout: {
            //   textColor: 'rgba(255, 255, 255, 0.9)',
            // },
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
    
        mainChart.current = initChart(mainChartContainerRef.current,false);
        rsiChart.current = initChart(rsiChartContainerRef.current,false);
        macdChart.current = initChart(macdChartContainerRef.current);
    
        const maData20 = calculateMovingAverageSeriesData(priceData, 20);
        const maData50 = calculateMovingAverageSeriesData(priceData, 50);
    
        const maSeries20 = mainChart.current.addLineSeries({ color: '#2962FF', lineWidth: 1 });
        maSeries20.setData(maData20);
    
        const maSeries50 = mainChart.current.addLineSeries({ color: 'red', lineWidth: 1 });
        maSeries50.setData(maData50);
    
        const candleSeries = mainChart.current.addCandlestickSeries({
          upColor: '#4bffb5',
          downColor: '#ff4976',
          borderDownColor: '#ff4976',
          borderUpColor: '#4bffb5',
          wickDownColor: '#838ca1',
          wickUpColor: '#838ca1',
        });
    
        candleSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.1,
            bottom: 0.25,
          },
        });
        
        console.log('price',priceData);
        candleSeries.setData(removeDuplicates(priceData));
        console.log("candleData", candleSeries.data());

    
        const volumeSeries = mainChart.current.addHistogramSeries({
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
        });
    
        volumeSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
    
        volumeSeries.setData(removeDuplicates(volumeData));

        const markers = [];
        if (rsiMarker !== undefined && rsiMarker.length > 0) {
          rsiMarker.forEach(item => {
            if (item.type === 'peak') {
              markers.push({
                time: item.time,
                position: 'aboveBar',
                color: '#e91e63',
                shape: 'arrowDown',
                text: 'RSI',
              });
            } else {
            markers.push({
                time: item.time,
                position: 'belowBar',
                color: '#2196F3',
                shape: 'arrowUp',
                text: 'RSI',
            });
          }})
        } else {
            console.error("priceData does not have enough elements to access element at index 200");
        }
        if (macdMarker !== undefined && macdMarker.length > 0) {
          macdMarker.forEach(item => {
            if (item.type === 'peak') {
              markers.push({
                time: item.time,
                position: 'aboveBar',
                color: '#800080',
                shape: 'circle',
                text: 'MACD',
              });
            } else {
            markers.push({
                time: item.time,
                position: 'belowBar',
                color: '#FFA500',
                shape: 'circle',
                text: 'MACD',
            });
          }})
        } else {
            console.error("priceData does not have enough elements to access element at index 200");
        }

        // Sắp xếp dữ liệu theo thứ tự tăng dần theo thời gian
        markers.sort((a, b) => new Date(a.time) - new Date(b.time));

        // Thêm markers vào series
        candleSeries.setMarkers(markers);

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
        const container = mainChartContainerRef.current;
    
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
            minimumWidth: 70,
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
        const rsiContainer = rsiChartContainerRef.current;
    
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
            minimumWidth: 70,
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
        const macdContainer = macdChartContainerRef.current;
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
          
          syncTimeScale(mainChart.current, rsiChart.current);
          syncTimeScale(rsiChart.current, mainChart.current);
          syncTimeScale(mainChart.current, macdChart.current);
          syncTimeScale(macdChart.current, mainChart.current);
          syncTimeScale(rsiChart.current, macdChart.current);
          syncTimeScale(macdChart.current, rsiChart.current);
        
    function updateChart(param) {
      if (param.time) {
          const candleData = param.seriesData.get(candleSeries);
          // console.log("candleData", candleData);
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
              // const changeformated = change.toFixed(2);
              // const perChangeformated = perChange.toFixed(2);

              // console.log("change", changeformated);
              // console.log("perChange", perChange);
              
              // Cập nhật giao diện người dùng với các giá trị mới
              // Ví dụ: bạn có thể cập nhật các thẻ HTML để hiển thị các giá trị này
              firstRow.innerHTML = `${symbolName} <span> O </span> <strong>${openFormatted}</strong>  <span> H </span> <strong>${highFormatted}</strong> <span> L </span> <strong>${lowFormatted}</strong> <span> C </span> <strong>${closeFormatted}</strong> `;
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
    console.log("chart",mainChart.current);
    
    // Đăng ký sự kiện con trỏ chéo cho các biểu đồ
    subscribeCrosshairMove(mainChart, candleSeries, [
      { chart: rsiChart, series: rsiSeries },
      { chart: macdChart, series: macdSeries }
    ]);
    
    subscribeCrosshairMove(rsiChart, rsiSeries, [
      { chart: mainChart, series: candleSeries },
      { chart: macdChart, series: macdSeries }
    ]);
    
    subscribeCrosshairMove(macdChart, macdSeries, [
      { chart: mainChart, series: candleSeries },
      { chart: rsiChart, series: rsiSeries }
    ]);
      
        let isFetchingData = false;

        mainChart.current.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
            if (logicalRange.from < 10 && !isFetchingData) {
                isFetchingData = true;
                let endDateString = '';
                let startDate = '';
                let PriceData = [];
                let VolumeData = [];
                PriceData = candleSeries.data();
                VolumeData = volumeSeries.data();
                // console.log("Data",PriceData);
                endDateString = PriceData[0].time;
                const endDate = new Date(endDateString);
                startDate = getStartDate(endDate);
                    // Gọi fetchData3 và xử lý dữ liệu mới trong phần xử lý của promise
                    fetchData3(startDate, endDateString)
                    .then(data => {
                        if (Array.isArray(data) && data.length > 0) {
                            const downColor = '#ff4976';
                            const upColor = '#4bffb5';
                            const newPriceData = [];
                            const newVolumeData = [];
                            
                            // Lặp qua mỗi phần tử của mảng dữ liệu và thêm vào priceData
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
                            histogramSeries.setData(updatedHistogramData);
  
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
                    .finally(() => {
                        isFetchingData = false;
                    });
                
            }
        });
    
        return () => {
          mainChart.current.remove();
          rsiChart.current.remove();
          macdChart.current.remove();
          container.removeChild(legend);
          mainChart.current.unsubscribeCrosshairMove();
          mainChart.current.timeScale().unsubscribeVisibleLogicalRangeChange();
        };
      }, [priceData, volumeData, rsiMarker, macdMarker]);

      const handleFetchData = (ticker) => {
        fetchData(ticker);
        fetchData2(ticker);
        fetchData4(ticker);
    }

      const handleSelect = (selected) => {
        if (selected) {
          setMacdMarker([]);
          setRsiMarker([]);
        }
        setName(selected);
        handleFetchData(selected);
      
      };

    return (
        <>
          <div className='Container'>
            <div className="forecast-container">
                <div>
                <div className='chart-container'>
                  <div className='view-chart'>
                    <div className='top-chart'>
                    <div className='top-chart-bar ' style={{backgroundColor:'white', height:'100%'}}>
                    <div className='top-ticker c-2'  style={{cursor:'pointer'}}>
                    <Box
                        component="form"
                        sx={{
                          '& .MuiTextField-root': { width: '25ch',height: '35px' },
                        }}
                        noValidate
                        autoComplete="off"
                      >
                              <div>
                          <TextField
                            id="outlined-select-currency-native"
                            select
                            defaultValue={name}
                          >
                            {selectName.map((option) => (
                              <MenuItem key={option.ticker} value={option.ticker} onClick={() => handleSelect(option.ticker)} >
                                {option.detail}
                              </MenuItem>
                            ))}
                          </TextField>
                        </div>
                      </Box>
                    </div>
                    <div className='divider'></div>
                      <div className='top-detail c-6'>
                      </div>
                      <div className='top-select c-4' style={{display:'flex'}}>
                        <span className='c-4'> D</span>
                        <span className='c-4' > W</span>
                        <span className='c-4' > M</span>
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
                        <div  ref={mainChartContainerRef}style={{height:'360px', position:"relative"}} />
                        <div className="separator"></div>
                        <div ref={rsiChartContainerRef} style={{height:'125px',position: "relative"}} />
                        <div className="separator"></div>
                        <div ref={macdChartContainerRef} style={{height:'150px', position:"relative"}} />
                    </div>

                  </div>

                </div>
                </div>
            </div>
          </div>  
        </>
    )
}

export default Forecast;