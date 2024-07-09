import './Tracking.css'
import { useState, useCallback,useEffect } from 'react'
import axios from 'axios'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';

const Tracking = () => {

    const [companyProfile, setCompanyProfile] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [name, setName] = useState('VNM');
    const [cashHistory, setCashHistory] = useState([]);
    const [news, setNews] = useState([]);
    const [events, setEvents ] = useState([]);
    const [selectedSection, setSelectedSection] = useState('Tổng quan');
    const [shareholders, setShareholders] = useState([]);
    // const [insiderDeals, setInsiderDeals] = useState([]);
    const [leadership, setLeadership] = useState([]);
    const [subsidiaries, setSubsidiaries] = useState([]);
    const [companiesData, setCompaniesData] = useState([]);
    const [showListTracking, setShowListTracking] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [listTracking, setListTracking] = useState([]);
    const [showAddTracking, setShowAddTracking] = useState(false);
    const [trackingDetail, setTrackingDetail] = useState([]);
    const [groupTracking, setGroupTracking] = useState([]);
    // const [addTrackingCode, setAddTrackingCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showDeleteGroup, setShowDeleteGroup] = useState(false);
    const [itemToChange, setItemToChange] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showGroupAdd, setShowGroupAdd] = useState(false);
    const [showGroupChange, setShowGroupChange] = useState(false);
    const [showNewsDetail, setShowNewsDetail] = useState(false);
    const [showEventDetail, setShowEventDetail] = useState(false);
    const [newsDetail, setNewsDetail] = useState([]);
    const [eventsDetail, setEventDetail] = useState([]);
    const [nameGroup, setNameGroup] = useState('');

    const token = localStorage.getItem('token');

    const checkTicker = (ticker) => {
        const found = companiesData.find(company => company.ticker === ticker);
        if (found) {
          return true;
        }
        return false;
    };
    
    const fetchData = useCallback( async (ticker) => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/infor/company_profile?name=${ticker}`);
          if (response.status !== 200) {
            throw new Error("Failed to fetch");
          }
          const data = response.data;
          
          setCompanyProfile({
            'Tên công ty': data.companyName[0],
            'Hồ sơ công ty': data.companyProfile[0],
            'Lịch sử': data.historyDev[0],
            'Hướng phát triển': data.keyDevelopments[0],
            'Mã': data.ticker[0],
            'Lời hứa': data.companyPromise[0],
            'Rủi ro': data.businessRisk[0],
            'Chiến lược kinh doanh': data.businessStrategies[0]
          });
          
        } catch (error) {
          console.error('Lỗi khi gửi yêu cầu:', error);
        }
      },[name])

      const fetchCashHistory = useCallback(async (ticker) => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/infor/dividend_history?name=${ticker}`);
            if (response.status !== 200) {
                throw new Error("Failed to fetch");
                }
            const data = response.data;
            if (Array.isArray(data) && data.length > 0) {
                const dividendData = [];
                data.forEach(item => {
                    dividendData.push({
                        exerciseDate: item.exerciseDate,
                        cashYear: item.cashYear,
                        cashDividendPercentage: item.cashDividendPercentage,
                        issueMethod: item.issueMethod,
                    });
                });
                setCashHistory(dividendData);
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
        }
        },[name])


        const fetchData3 = useCallback(async (ticker) => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/infor/company_news?name=${ticker}`);
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
                const data = response.data;
                if (Array.isArray(data) && data.length > 0) {
                    const newsData = [];
                    data.forEach(item => {
                        newsData.push({
                            title: item.title,
                            date: item.publishDate,
                            price: item.price,
                            id: item.id,
                            priceChange: item.priceChange,
                            priceChangeRatio: item.priceChangeRatio,
                            priceChangeRatio1W: item.priceChangeRatio1W,
                            priceChangeRatio1M: item.priceChangeRatio1M,
                        });
                    });
                    setNews(newsData);
                }


            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        },[name])

        const fetchData4 = useCallback(async (ticker) => {  
            try {
                const response = await axios.get(`http://127.0.0.1:8000/infor/leadership?name=${ticker}`);
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
                const data = response.data;
                setLeadership(data);
                console.log("leader",leadership);
            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        },[name])


        const fetchData5 = useCallback(async (ticker) => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/infor/subsidiaries?name=${ticker}`);    
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
                const data = response.data;
                setSubsidiaries(data);
                console.log("subsidiaries",subsidiaries);
            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        },[name])


        const fetchData6 = useCallback(async (ticker) => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/infor/company_events?name=${ticker}`);
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
                const data = response.data;
                if (Array.isArray(data) && data.length > 0) {
                    const eventsData = [];
                    data.forEach(item => {
                        eventsData.push({
                            eventName: item.eventName,
                            date: item.notifyDate,
                            ticker: item.ticker,
                            price: item.price,
                            exerDate: item.exerDate, // thời gian thực hiện
                            regFinalDate: item.regFinalDate, // thời gian đăng ký cuối cùng
                            exRigthDate: item.exRigthDate, // thời gian chốt quyền
                            peventDesc: item.eventDesc, // mô tả sự kiện
                        });
                    });
                    setEvents(eventsData);
                }


            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        },[name])


        const fetchData7 = useCallback(async (ticker) => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/infor/shareholders?name=${ticker}`);
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
                const data = response.data;
                setShareholders(data);
                console.log("shareholders",shareholders);
            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        },[name])

        const fetchData8 = async () => {
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

        const fetchData9 = async () =>{
            try {
                const response = await axios.get('http://127.0.0.1:8000/tracking/group_tracking', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
        
                const data = response.data;
                setListTracking(data);
                console.log("listTracking",listTracking);
                return data;
            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }    
        }

        const fetchData10 = async (ticker) => {

            try {
                const response = await axios.get(`http://127.0.0.1:8000/tracking/tracking/group/${ticker}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }

                const data = response.data;
                setTrackingDetail(data);
                // Tìm phần tử có id phù hợp trong mảng listTracking
                const selectedTracking = listTracking.find(item => item.id === ticker);
                
                // Kiểm tra nếu phần tử được tìm thấy
                if (selectedTracking) {
                    // Gán giá trị name từ selectedTracking vào setTrackingName
                    setGroupTracking(selectedTracking)
                } else {
                    console.log("Không tìm thấy phần tử có id phù hợp trong listTracking.");
                }

            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        };

        const fetchData11 = async (ticker) => {
            let check = checkTicker(ticker);
            if (check === false) {
                console.log("Không tìm thấy mã cổ phiếu trong danh sách.");
            }
            else {
            try {
                const response = await axios.post(`http://127.0.0.1:8000/tracking/tracking`, {
                    code: ticker,
                    group_id: groupTracking.id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                console.log(data);
                fetchData10(groupTracking.id);

            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        }};

        const fetchData12 = async (ticker) => {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/tracking/tracking/${ticker}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                  const data = response.data;
                    console.log(data);
                    fetchData10(groupTracking.id);
            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        };
        
        const fetchData13 = async (name) =>{
            try {
                const response = await axios.post('http://127.0.0.1:8000/tracking/group_tracking', {
                    name: name,
                    group_id: groupTracking.id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
        
                const data = response.data;
                console.log(data);
                fetchData9();
            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }    
        }

        const fetchData14 = async (name) =>{
            try {
                const response = await axios.put(`http://127.0.0.1:8000/tracking/group_tracking/${itemToChange.id}`,
                {
                    name: name
                }, {  
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                console.log(data);
                if(itemToChange.id === groupTracking.id){
                    setGroupTracking(data);                
                }

                fetchData9();
            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        }

        const fetchData15 = async (ticker) => {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/tracking/group_tracking/${ticker}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                  const data = response.data;
                    console.log(data);
                    fetchData9();
            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        };

        const fetchData16 = async (ticker) => {
            try{
                const response = await axios.get(`http://127.0.0.1:8000/infor/news_detail?id=${ticker}`);
                if (response.status !== 200) {
                    throw new Error("Failed to fetch");
                }
                const data = response.data;
                setNewsDetail(data);
                setShowNewsDetail(true);

            }
            catch (error) {
                console.error('Lỗi khi gửi yêu cầu:', error);
            }
        };
            


        useEffect(() => {
            const fetchDataFirst = async () => {
                try {
                    // Gọi fetchData9 để lấy danh sách các nhóm
                    const list = await fetchData9();
        
                    // Nếu danh sách không rỗng, lấy nhóm đầu tiên và gọi fetchData10
                    if (list.length > 0) {
                        const firstGroup = list[0];
                        await fetchData10(firstGroup.id);
                        setGroupTracking(firstGroup);
                        // Tiếp tục thực hiện các hàm khác tại đây nếu cần
                    }
                } catch (error) {
                    console.error('Lỗi khi gửi yêu cầu:', error);
                }
            };
        
            fetchDataFirst();
            fetchData8();
            fetchData(name);
            fetchCashHistory(name);
            fetchData3(name);
            fetchData4(name);
            fetchData5(name);
            fetchData6(name);
            fetchData7(name);
        }, []);

const handleCompanyChange = (value) => {
    fetchData(value);
    fetchCashHistory(value);
    fetchData3(value);
    fetchData4(value);
    fetchData5(value);
    fetchData6(value);
    fetchData7(value);
}

const handleFetchData = (ticker) => {
    fetchData11(ticker);
    setShowAddTracking(false);
    setSearchTerm('');
}

const handleTrackingChange = (value) => {
    fetchData10(value);
    setShowListTracking(false);
    setIsExpanded(!isExpanded);
}

const renderProfileContent = () => {
    switch (selectedSection) {
        case 'Tổng quan':
            return (
              <table className='company-profile'>
                <tbody>
                  {Object.entries(companyProfile).map(([key, value]) => {
                    if (key !== 'Mã' && key !== 'Tên công ty') {
                      return (
                        <tr className='company-profile-item' key={key}>
                          <td className='c-3'>{key}</td>
                          <td className='profile-content c-9'>
                            {typeof value === 'string' && value.trim() !== '' ? ( // kiểm tra xem chuỗi có giá trị không
                              key === 'Lịch sử' || key === 'Hướng phát triển' ? (
                                value.split(';').map((item, index) => (
                                  <div key={index}>
                                    {index > 0 && <br />}
                                    {item.trim() && <span> - {item.trim()} </span>} 
                                  </div>
                                ))
                              ) : (
                                value.split(';').map((item, index) => (
                                  <span key={index}>
                                    {index > 0 && <br />}
                                    {item.trim()}
                                  </span>
                                ))
                              )
                            ) : (
                              // Handle case where value is not a string or empty
                              <span>{value}</span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            );
          
      case 'Ban lãnh đạo':
        // Replace with actual content for 'Ban lãnh đạo'
        return (
            <table className='company-profile'>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên </th>
                        <th>Chức vụ</th>
                        <th>Tỷ lệ sở hữu (%)</th>
                    </tr>
                </thead>                
                <tbody>
                {Object.keys(leadership.ticker).map((index) => (
                        <tr key={index}>
                            <td>{parseInt(index) + 1}</td>
                            <td>{leadership.officerName[index]}</td>
                            <td>{leadership.officerPosition[index]}</td>
                            <td>{(leadership.officerOwnPercent[index] * 100).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
      case 'Cổ đông lớn':
        // Replace with actual content for 'Cổ đông lớn'
        return (
            <table className='company-profile'>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên cổ đông</th>
                        <th>Tỷ lệ sở hữu (%)</th>
                    </tr>
                </thead>                
                <tbody>
                {Object.keys(shareholders.ticker).map((index) => (
                        <tr key={index}>
                            <td>{parseInt(index) + 1}</td>
                            <td>{shareholders.shareHolder[index]}</td>
                            <td>{(shareholders.shareOwnPercent[index] * 100).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
      case 'Công ty con, liên kết':
        // Replace with actual content for 'Công ty con, liên kết'
        return (
            <table className='company-profile'>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên công ty</th>
                        <th>Tỷ lệ sở hữu (%)</th>
                    </tr>
                </thead>                
                <tbody>
                {Object.keys(subsidiaries.ticker).map((index) => (
                        <tr key={index}>
                            <td>{parseInt(index) + 1}</td>
                            <td>{subsidiaries.subCompanyName[index]}</td>
                            <td>{(subsidiaries.subOwnPercent[index] * 100).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
      case 'Cổ tức':
        // Replace with actual content for 'Cổ tức'
        return (
            <table className='company-profile'>
                <thead>
                    <tr>
                        <th>Ngày thực hiện</th>
                        <th>Năm</th>
                        <th>Tỷ lệ cổ tức (%) </th>
                        <th>Phương thức</th>
                    </tr>
                </thead>
                <tbody>
                    {cashHistory.map((item, index) => (
                        <tr key={index}>
                            <td>{item.exerciseDate}</td>
                            <td>{item.cashYear}</td>
                            <td>{(item.cashDividendPercentage * 100).toFixed(2)}</td>
                            <td>{item.issueMethod === 'cash' ? 'Tiền mặt' : 'Cổ phiếu'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
      case 'Khác':
        // Replace with actual content for 'Khác'
        return (
          <tbody>
            <tr>
              <td>Chưa có thông tin phần này!</td>
            </tr>
          </tbody>
        );
      default:
        return null;
    }
  };



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

    const handleShowListTracking = () => {
        setShowListTracking(!showListTracking);
        setIsExpanded(!isExpanded);
        }

    const handleShowAddTracking = () => {
        setShowAddTracking(!showAddTracking);
        }
    
    const handleSearchChange = (e) => {
        const upperCaseValue = e.target.value.toUpperCase();
        setSearchTerm(upperCaseValue);
      };

      const handleSelectCompany = (selectedCompany) => {
        // setName(selectedCompany.ticker);
      
        handleFetchData(selectedCompany.ticker);
        handleShowAddTracking();
      
      };
      const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          fetchData11(searchTerm);
          setShowAddTracking(false);
          setSearchTerm('');
        }
      }

    const handleShowDeleteConfirmation = (item) => {
        setItemToDelete(item);
        setShowDeleteConfirmation(true);
    };

    const handleCloseDeleteConfirmation = () => {
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            fetchData12(itemToDelete.id);
            handleCloseDeleteConfirmation();
        }
    };

    const handleShowGroupAdd = () => {
        setShowGroupAdd(true);
    };

    const handleCloseGroupAdd = () => {
        setShowGroupAdd(false);
        setNameGroup('');
    };

    const handleNameGroupChange = (event) => {
        setNameGroup(event.target.value);
    };

    const handleAddNewGroup = () => {
        if (nameGroup) {
            fetchData13(nameGroup);
            handleCloseGroupAdd();
        }
    };


    const handleShowGroupChange = (item) => {
        setItemToChange(item);
        setShowGroupChange(true);
    }

    const handleCloseGroupChange = () => {
        setShowGroupChange(false);
        setNameGroup('');
        setItemToChange(null);
    };

    const handleChangeNameGroup = () => {
        if (itemToChange) {
            fetchData14(nameGroup);
            handleCloseGroupChange();
        }
    };


    const handleShowDeleteGroup = (item) => {
        setItemToDelete(item);
        setShowDeleteGroup(true);
    };

    const handleCloseDeleteGroup = () => {
        setShowDeleteGroup(false);
        setItemToDelete(null);
    };

    const handleConfirmDeleteGroup = () => {
        if (itemToDelete) {
            fetchData15(itemToDelete.id);
            handleCloseDeleteGroup();
        }
    };

    const handleShowNewsDetail = (item) => {
        fetchData16(item.id);

    };

    const handleCloseNewsDetail = () => {
        setShowNewsDetail(false);
        setNewsDetail(null);
    };

    const handleShowEventDetail = (item) => {
        setEventDetail(item);
        setShowEventDetail(true);
    };

    // Thêm sự kiện để mở liên kết trong tab mới 
    useEffect(() => {
        if (showNewsDetail) {
            const links = document.querySelectorAll('.news_detail-main a');
            links.forEach(link => {
                link.setAttribute('target', '_blank');
            });
        }
    }, [showNewsDetail, newsDetail]);

    return (
        <>
        <div className='Container' >
        <div className="tracking-container">
            {showDeleteConfirmation && (
                <div className='overlay'>
                    <div className='delete_tracking'>
                        <p>Bạn đã chọn : {itemToDelete.code}</p>
                        <p>Bạn có chắc chắn muốn xóa mục này?</p>
                        <button className='delete_button' onClick={handleConfirmDelete}>Xóa</button>
                        <button className='cancel_button' onClick={handleCloseDeleteConfirmation}>Hủy</button>
                    </div>
                </div>
            )}
            {showDeleteGroup && (
                <div className='overlay'>
                    <div className='delete_tracking'>
                        <p>Bạn đã chọn : {itemToDelete.name}</p>
                        <p>Bạn có chắc chắn muốn xóa mục này?</p>
                        <button className='delete_button' onClick={handleConfirmDeleteGroup}>Xóa</button>
                        <button className='cancel_button' onClick={handleCloseDeleteGroup}>Hủy</button>
                    </div>
                </div>
            )}

            {showGroupAdd && (
                <div className='overlay'>
                    <div className='add_group'>
                        <input
                            type='text'
                            placeholder='Nhập thông tin'
                            value={nameGroup}
                            onChange={handleNameGroupChange}
                        />
                        <button className='add_button' onClick={handleAddNewGroup}>Thêm</button>
                        <button className='cancel_button' onClick={handleCloseGroupAdd}>Hủy</button>                        

                    </div>
                </div>
            )}
            {showGroupChange && (
                <div className='overlay'>
                    <div className='add_group'>
                        <input
                            type='text'
                            placeholder='Nhập tên mới'
                            value={nameGroup}
                            onChange={handleNameGroupChange}
                        />

                        <button className='add_button' onClick={handleChangeNameGroup}>Đồng ý</button>
                        <button className='cancel_button' onClick={handleCloseGroupChange}>Hủy</button>
                    </div>
                </div>
            )}
            {showNewsDetail && (
                <div className='overlay'>
                    <div className='news_detail'>
                        <div className='news_detail-header'>
                            <div className='news_detail-header-top'>
                                <h3>{newsDetail[0].title}</h3>
                                <button onClick={handleCloseNewsDetail}>Đóng</button>
                            </div>
                            <div className='news_detail-header-detail'>
                                <div style={{paddingRight:'10px'}}> Mã: {newsDetail[0].ticker} </div>
                                <div style={{borderLeft: '1px solid black', padding:'0 10px'}}> {newsDetail[0].publishDate }</div>
                                <div style={{borderLeft: '1px solid black', padding:'0 10px'}}> Theo: {newsDetail[0].source}</div>
                            </div>
                        </div>
                        <div className='separator'></div>
                        <div className='news_detail-main'>
                            {/* chèn đoạn mã HTML trong content vào thẻ div */}
                            <div dangerouslySetInnerHTML={{ __html: newsDetail[0].content }}></div>
                            <div style={{marginLeft:'10px'}}>Tác giả: {newsDetail[0].authorFull}</div>
                        </div>

                    </div>
                </div>
            )}
            {showEventDetail && (
                <div className='overlay'>
                    <div className='news_detail'>
                        <div className='news_detail-header'>
                            <div className='news_detail-header-top'>
                                <h3>{eventsDetail.eventName}</h3>
                                <button onClick={() => setShowEventDetail(false)}>Đóng</button>
                            </div>
                            <div className='news_detail-header-detail'>
                                <div style={{paddingRight:'10px'}}> Mã: {eventsDetail.ticker} </div>
                                <div style={{borderLeft: '1px solid black', padding:'0 10px'}}> {eventsDetail.date }</div>
                            </div>
                        </div>
                        <div className='separator'></div>
                        <div className='news_detail-main'>
                            <div>
                                <div dangerouslySetInnerHTML={{ __html: eventsDetail.peventDesc }}></div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
                <div className='side_bar-container c-2'>
                    <div className='top-side_bar'>
                        <div className='side_bar-title'>
                            <div className='title_name'>
                                <div>{groupTracking.name}</div>
                                <div 
                                style={{cursor:'pointer'}} onClick={handleShowListTracking}>
                                    {isExpanded ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                                </div>
                            </div>
                            <div className='add' style={{cursor:'pointer'}} onClick={handleShowAddTracking}><AddCircleOutlineIcon/></div>
                            {showListTracking && (
                            <div className='tracking_list'>
                                {listTracking.map((item, index) => (
                                    <div className='tracking_list-item' key={index}>
                                        <div className='c-8'  style={{cursor:'pointer', paddingLeft:'25px'}}  onClick={() => handleTrackingChange(item.id)}>
                                            {item.name}
                                        </div>
                                        <div className='c-2' style={{display:'flex', cursor:'pointer'}}>
                                            <EditIcon sx={{color:'blue'}} onClick={() => handleShowGroupChange(item)}/>
                                        </div>
                                        <div className='c-2' style={{display:'flex', cursor:'pointer'}} >
                                            <DeleteIcon sx={{color:'red'}} onClick={() => handleShowDeleteGroup(item)}/>
                                        </div>

                                    </div>
                                ))}
                                <div className='separator'></div>
                                <div style={{display:'flex', cursor:'pointer'}}>
                                    <CreateNewFolderIcon/>
                                    <span onClick={handleShowGroupAdd}> Tạo danh mục mới </span>
                                </div>
                            </div>
                            )}
                            {showAddTracking && (
                                <div className='add_tracking'>
                                    <input
                                        type='text'
                                        placeholder='Nhập mã cổ phiếu'
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleKeyPress}
                                        
                                    />
                                    <button onClick={() => handleFetchData(searchTerm)}>Thêm</button>

                                    {suggestions.length > 0 && (
                                        <ul className="add_suggestions" onWheel={(e) => e.stopPropagation()} >
                                        {suggestions.map(company => (
                                            <li key={company.id}  >
                                            <div className="company-info" onClick={() => handleSelectCompany(company)}>
                                                <div className="ticker">{company.ticker}-{company.group}</div>
                                                <div className="name">{company.name}</div>
                                            </div>
                                            </li>
                                        ))}
                                        </ul>
                                    )}
                                </div>
                            )}


                        </div>
                        <div className='separator'></div>
                    </div>
                        <div className='mid-side_bar'>
                        {trackingDetail.map((item, index) => (
                <div key={index} className='side_bar-item'>
                    <div className='name c-8' style={{ cursor: 'pointer' }} onClick={() => handleCompanyChange(item.code)}>
                        {item.code}
                    </div>
                    <div className='action c-4' style={{ cursor: 'pointer', borderLeft:'1px solid black' }} onClick={() => handleShowDeleteConfirmation(item)}>
                        <DeleteIcon  />
                    </div>
                </div>
            ))}

                </div>
                </div>

                <div className='main-container c-10'>
                    <div className='company-profile-container'>
                        <div>
                            <div className='profile_name'> {companyProfile['Tên công ty']} ({companyProfile['Mã']}) </div>
                            <div style={{ display: 'flex', marginLeft:'10px' }}>
                                <span className='tracking_item c-2' onClick={() => setSelectedSection('Tổng quan')}>
                                    Tổng quan
                                </span>
                                <span className='tracking_item c-2' onClick={() => setSelectedSection('Ban lãnh đạo')}>
                                    Ban lãnh đạo
                                </span>
                                <span className='tracking_item c-2' onClick={() => setSelectedSection('Cổ đông lớn')}>
                                    Cổ đông lớn
                                </span>
                                <span className='tracking_item c-3' onClick={() => setSelectedSection('Công ty con, liên kết')}>
                                    Công ty con, liên kết
                                </span>
                                <span className='tracking_item c-2' onClick={() => setSelectedSection('Cổ tức')}>
                                    Cổ tức
                                </span>
                            </div>
                        </div>
                        <div className='separator'></div>
                        <div>

                            {renderProfileContent()}

                        </div>

                    </div>

                    <div className='tracking-right-container c-4'>
                        <div className='company_dividend'>
                            <div className='company_dividend-header'>
                                <h3>Sự kiện</h3>
                            </div>
                            <div className='separator'></div>
                            <table className='company_dividend-main'>
                                <thead>
                                    <tr>
                                        <th>Nội dung</th>
                                        <th>Ngày đăng</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((item, index) => (
                                        <tr key={index}>
                                            <td onClick={() => handleShowEventDetail(item)} >{item.eventName}</td>
                                            <td>{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                        <div className='company_news'>
                            <div className='company_news-header'>
                                    <h3>Tin tức</h3>
                            </div>
                            <div className='separator'></div>
                            <table className='company_news-main'>
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Ngày đăng</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {news.map((item, index) => (
                                        <tr key={index}>
                                            <td onClick={() => handleShowNewsDetail(item)}>{item.title}</td>
                                            <td>{format(new Date(item.date), 'dd/MM/yyyy HH:mm ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div> 
                </div>
            </div>
        </div>

        </>
    )
}
export default Tracking