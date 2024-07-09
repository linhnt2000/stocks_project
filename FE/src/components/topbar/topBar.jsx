import "./topBar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import toasts from "../toasts/Toasts";
import { ToastContainer } from "react-toastify";
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from "axios";
import { calculateTimeAgo } from "../untils";
import ClearIcon from '@mui/icons-material/Clear';
import FeedIcon from '@mui/icons-material/Feed';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';


const TopBar = () => {
    const { logout } = useAuth();
    const {stockName} = useAuth();
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    const [notifications,setNotifications] = useState([])
    const [expanded, setExpanded] = useState(false);
    const [showNewsDetail, setShowNewsDetail] = useState(false);
    const [newsDetail, setNewsDetail] = useState({});
    const [pendingOrSentCount, setPendingOrSentCount] = useState(0);
    // const [ws, setWs] = useState(null);
    const [showWs, setShowWs] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true);
    


    
    const token = localStorage.getItem("token") 
    const isNoti = localStorage.getItem("isNoti")


    const handleLogout = () => {
        localStorage.removeItem("token");
        toasts.successTopCenter("Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!");
        
        setTimeout(function () {
            logout();
            navigate("/");
        }, 2000);
    };

    const handleOpenNotification = () => {
        setShowNotification(!showNotification);
    }
    const fetchData = async () =>{
        try {
            const response = await axios.get('http://127.0.0.1:8000/notification/get_news', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.status !== 200) {
                throw new Error("Failed to fetch");
            }
    
            const data = response.data.map(item => {
                item.message = JSON.parse(item.message);
                return item;
            });
            setNotifications(data);
            console.log("noti", notifications);
            localStorage.setItem("isNoti", "true");
        }
        catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
        }    
    }

    const fetchData3 = async () =>{
        try {
            const response = await axios.get('http://127.0.0.1:8000/notification/news', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.status !== 200) {
                throw new Error("Failed to fetch");
            }
    
            const data = response.data.map(item => {
                item.message = JSON.parse(item.message);
                return item;
            });
            setNotifications(data);
            console.log("noti", notifications);
        }
        catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
        }    
    }

    const fetchData2 = async (ticker) => {
        try{
            const response = await axios.get(`http://127.0.0.1:8000/infor/news_detail?id=${ticker}`);
            if (response.status !== 200) {
                throw new Error("Failed to fetch");
            }
            const data = response.data;
            setNewsDetail(data);
            setShowNewsDetail(true);
            setShowNotification(false);

        }
        catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
        }
    };

    const fetchChangeStatus = async (id, status) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/notification/update_status', {
                notification_id: id,
                status: status
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status !== 200) {
                throw new Error("Failed to fetch");
            }
            setNotifications(notifications.map(notification => {
                if (notification.id === id) {
                    return {
                        ...notification,
                        status: status
                    };
                }
                return notification;
            }));
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
        }
    };
    


    useEffect( () => {
        console.log("isNoti", isNoti);
        if(isNoti === "true"){
            fetchData3();
        }
        else{
            fetchData();
        }
    },[])

    useEffect(() => {
        const websocket = new WebSocket(`ws://localhost:8000/ws/${token}`);
    
        websocket.onopen = () => {
            console.log('WebSocket connection established');
            // setWs(websocket);
        };
    
        websocket.onmessage = (event) => {
            console.log('Message from server:', event.data);
            // setWs(event.data);
            setShowWs(true);
            fetchData3();
        };
    
        websocket.onerror = (event) => {
            console.error('WebSocket error:', event);
        };
    
        websocket.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
            // Optionally, handle closed connection and attempt to reconnect
        };
    
        return () => {
            if (websocket) {
                websocket.close();
            }
        };
    }, [token]);

    const toggleExpand = (index) => {
        setExpanded((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const handleDashbroads = () => {
        navigate("/dashbroad");
    }

    const handleNewsDetail = (item) => {
        fetchData2(item.id);
    }

    const handleCloseNewsDetail = () => {
        setShowNewsDetail(false);
    }

    const handleCloseWs= () => {
        setShowWs(false);
    }


    // Cập nhật số lượng thông báo khi danh sách thông báo thay đổi
    useEffect(() => {
        const countPendingOrSentNotifications = () => {
            return notifications.filter(notification => 
                notification.status === 'pending' || notification.status === 'sent').length;
        };

        setPendingOrSentCount(countPendingOrSentNotifications());
    }, [notifications]);

    const handleChangeStatus = (item) =>  {
        if (item.status === 'pending'|| item.status === 'sent') {
            fetchChangeStatus(item.id, 'read');
        }
    }

    const handleShowOverlay = () => {
        setShowOverlay(false);
    }

    return (
        <>
            {showOverlay && (
                <div className='overlay'>
                <div className='overlay-container'>
                    <h3>
                    Chào mừng bạn đến với Website của chúng tôi
                    </h3>
                    <p>Các dữ liệu trong ứng dụng được hỗ trợ bởi <span> </span> 
                        <a href="https://vnstocks.com/" target='_blank' rel='noopener noreferrer'>
                        vnstock
                        </a>
                    </p>

                    <p>Về vnstock tham khảo ở: <a href="https://vnstocks.com/" target='_blank' rel='noopener noreferrer'>
                    đây</a>
                    </p>
                    <strong>
                    Lưu ý:
                    </strong>
                    <p>
                    Sản phẩm này là công cụ hỗ trợ đầu tư 
                    </p>
                    <p>Bạn chịu trách nhiệm về quyết định đầu tư của mình.</p>
                    <button onClick={handleShowOverlay}>Đã hiểu</button>
                </div>
                </div>
            )}
            {showWs && (
                <div className="ws_container">
                    <div onClick={handleCloseWs} className="clear_notification-ws">
                        <ClearIcon />
                    </div>
                    <div className="ws_content">
                        <NotificationsIcon className="Noti_icon" />
                        <div>
                        Có thông báo mới!
                        </div>
                    </div>
                </div>
            )}
            {showNotification && (
                <div className='notification_overlay'>
                    <div className={`notification_wrapper ${showNotification ? 'show' : ''}`}>
                        <div className="notification">
                            <div className="top_notification">
                                <div onClick={handleOpenNotification} className="clear_notification c-1">
                                    <ClearIcon />
                                </div>
                            </div>
                            <div className="notification_main">
                                <div className="notification_scrollable">
                                    {notifications && notifications.map((notification, index) => (
                                        <div 
                                        key={index} 
                                        className={`notification_item ${notification.status}`} 
                                        onClick={() => handleChangeStatus(notification)}
                                    >
                                            {notification.type_id === 1 && (
                                                <>
                                                    <div style={{display:'flex'}}>
                                                        <FeedIcon />
                                                        <div>Tin tức dành cho bạn</div>
                                                    </div>
                                                    <div style={{ paddingLeft: '20px' }}>
                                                        {Object.keys(notification.message).map((type, idx) => (
                                                            (expanded[index] || idx === 0) && (
                                                                <div key={idx} style={{ marginTop: '20px' }}>
                                                                    <div className="notification_type">{type}</div>
                                                                    {notification.message[type].map((item, itemIdx) => (
                                                                        (expanded[index] || (idx === 0 && itemIdx === 0)) && (
                                                                            <div key={itemIdx} className="notification_item_mini">
                                                                                <div className="notification_item_title"
                                                                                style={{ cursor: 'pointer' }} 
                                                                                onClick={() => handleNewsDetail(item)}>
                                                                                    {item.title}
                                                                                </div>
                                                                                <div className="notification_item_source">Nguồn: {item.source}</div>
                                                                            </div>
                                                                        )
                                                                    ))}
                                                                </div>
                                                            )
                                                        ))}
                                                    <div className="notification_created_date">{calculateTimeAgo(notification.created_date)}</div>
                                                        {Object.values(notification.message).some(item => item.length > 1) && (
                                                            <div className="notification_expanded" style={{ cursor: 'pointer' }} onClick={() => toggleExpand(index)}>
                                                                {expanded[index] ? 'Thu gọn' : 'Xem thêm'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            {notification.type_id === 2 && (
                                                <>
                                                    <div style={{display:'flex'}}>
                                                        <EventIcon />
                                                        <div>Sự kiện có thể bạn quan tâm</div>
                                                    </div>
                                                    <div style={{ paddingLeft: '20px' }}>

                                                        {Object.keys(notification.message).map((type, idx) => (
                                                            (expanded[index] || idx === 0) && (
                                                                <div key={idx} style={{ marginTop: '20px' }}>
                                                                    <div className="notification_type">{type}</div>
                                                                    {notification.message[type].map((item, itemIdx) => (
                                                                        (expanded[index] || (idx === 0 && itemIdx === 0)) && (
                                                                            <div key={itemIdx} className="notification_item_mini">
                                                                                <div className="notification_item_title" onClick={() => handleNewsDetail(item)}>{item.eventName}</div>
                                                                                <div dangerouslySetInnerHTML={{ __html: item.eventDesc }}></div>
                                                                            </div>
                                                                        )
                                                                    ))}
                                                                </div>
                                                            )
                                                        ))}
                                                    <div className="notification_created_date">{calculateTimeAgo(notification.created_date)}</div>
                                                        {Object.values(notification.message).some(item => item.length > 1) && (
                                                            <div className="notification_expanded" style={{ cursor: 'pointer' }} onClick={() => toggleExpand(index)}>
                                                                {expanded[index] ? 'Thu gọn' : 'Xem thêm'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            {notification.type_id === 4 && (
                                                <>
                                                    <div style={{display:'flex'}}>
                                                        <EventIcon />
                                                        <div> Từ chúng tôi </div>
                                                    </div>
                                                    <div style={{ paddingLeft: '20px' }}>

                                                                <div style={{ marginTop: '20px' }}>
                                                                    <div className="notification_type"></div>
                                                                            <div className="notification_item_mini">
                                                                                <div className="notification_item_title">
                                                                                    {notification.message}
                                                                                </div>
                                                    
                                                                            </div>
                                                                </div>

                                                    <div className="notification_created_date">{calculateTimeAgo(notification.created_date)}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="notification_background" onClick={handleOpenNotification}></div>
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
            <div className="topbar">
                <div className=" c-2">
                    <div className="logo"  onClick={handleDashbroads}>
                        <HomeIcon />
                        <div>Trang chủ</div>
                    </div>
                    {/* <img src="logo.png" alt="Logo" width="50" onClick={handleDashbroads} /> */}

                </div>
                <ul className="menu c-8">
                    <li><Link to={`/stock/ticker=${stockName}`}>Phân tích</Link></li>
                    <li><Link to="/tracking">Theo dõi</Link></li>
                    <li><Link to="/forecast">Dự báo</Link></li>
                    <li><Link to="/guide">Hướng dẫn</Link></li>
                </ul>
                <div className="topbar_right c-2">
                <div className="c-4">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <NotificationsIcon className="Noti_icon" onClick={handleOpenNotification} sx={{cursor:'pointer'}} />
                        {pendingOrSentCount > 0 && (
                            <span className="notification_badge">{pendingOrSentCount}</span>
                        )}
                    </div>
                </div>
                    <div className="logout c-8 ">
                        <div onClick={handleLogout} style={{ cursor: 'pointer' }}>Đăng xuất</div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default TopBar;


