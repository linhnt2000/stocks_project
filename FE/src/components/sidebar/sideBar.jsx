import "./sideBar.css";

const SideBar = () => { 
    return (
        <div className="sidebar">
            <div className="sidebar-item">
                <a href="#">Phân tích</a>
            </div>
            <div className="sidebar-item">
                <a href="#">Theo dõi</a>
            </div>
            <div className="sidebar-item">
                <a href="#">Dự báo</a>
            </div>
            <div className="sidebar-item">
                <a href="#">Hướng dẫn</a>
            </div>
        </div>
    );
}
export default SideBar;