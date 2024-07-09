import React, { useEffect,useState } from "react";
import "./guilde.css"
import axios from 'axios';
import { useAuth } from '../../components/context/AuthContext';
import rsipk from '../../assets/rsipk.png';
import rsiht from '../../assets/rsiht.png';

const NewGuide = () => {
  const {guide} = useAuth();
  const [detailData, setDetailData] = useState([]);
  const [name,setName] = useState('Giới thiệu');
  const [selectedGuide, setSelectedGuide] = useState(null);

  
  const fetchData = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/guide/');
        if (response.status !== 200) {
            throw new Error("Failed to fetch");
        }

        // Lấy dữ liệu từ phản hồi
        const data = response.data;
        console.log("data",data);

        setDetailData(data);

    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Lỗi khi gửi yêu cầu:', error);
    }   
}
useEffect(() => {
    fetchData();
  },[]);

  useEffect(() => {
    if (guide && detailData.length > 0) {
      setName(guide);
      console.log("guide", guide);
      const selected = detailData.find(g => g.title === guide);
      setSelectedGuide(selected);
    }
  }, [guide, detailData]);

  const handleItemClick = (itemName) => {
    setName(itemName);
    // console.log("name", itemName);
    const selected = detailData.find(guide => guide.title === itemName);

    setSelectedGuide(selected);
};




// console.log("detailData",detailData);
// console.log("selectedGuide",selectedGuide);

  return (
    <>
    <div className="Container">
    <div className="guide-container">
        <div className="side_bar-guide c-2" >
          <div className="intro">
            <h3 onClick={() => handleItemClick("Giới thiệu")}>Giới thiệu</h3>
            <ul></ul>
          </div>
          <div>
            <h3>Chỉ số</h3>
            <ul>
              <li onClick={() => handleItemClick("P/E")}> F/E </li>
              <li onClick={() => handleItemClick('P/B')}> P/B </li>
              <li onClick={() => handleItemClick('EPS')}> EPS </li>
              <li onClick={() => handleItemClick('ROE')}> ROE </li>
              <li onClick={() => handleItemClick('ROA')}> ROA </li>
            </ul>
          </div>
          <div>
            <h3>Chỉ báo</h3>
            <ul>
            <li onClick={() => handleItemClick('RSI')}> RSI </li>
              <li> MACD </li>
            </ul>
          </div>
        </div>
        <div className="main-guide c-10">
          <div className="content-guide">
          <div className="top-guide" >
            <strong>{name}</strong>
          </div>
            <div>
              {name === "Giới thiệu" ? (
                <div className="content">
                  <p>
                    Chào mừng bạn đến với hệ thống hỗ trợ đầu tư của chúng tôi. 
                  </p>
                  <p>Hãy chọn một chỉ số hoặc chỉ báo để xem  chi tiết.</p>
                </div>
              ) : null}
              <div>
              {selectedGuide && selectedGuide.content ? (
                <div className="content">
                  {selectedGuide.content.split(/\n\n+/).map((paragraph, index) => {
                    // Kiểm tra xem đoạn văn bản có chứa "image:" hay không
                    if (paragraph.includes('image:')) {
                      // Tách phần tên ảnh
                      const [beforeImage, imagePart] = paragraph.split('image:');
                      const imageName = imagePart.split('.')[0].trim();
                      if (imageName === 'rsipk') {                        
                        return (
                          <div key={index}>
                            {beforeImage.trim().split('\n').map((line, idx) => (
                              <React.Fragment key={idx}>
                                <p>{line.trim()}</p>
                              </React.Fragment>
                            ))}
                            <img src={rsipk} alt={imageName} />
                            <div> Ảnh: RSI phân kỳ</div>
                          </div>
                        );
                      }
                      else if (imageName === 'rsiht') {
                        return (
                          <div key={index}>
                            {beforeImage.trim().split('\n').map((line, idx) => (
                              <React.Fragment key={idx}>
                                <p>{line.trim()}</p>
                              </React.Fragment>
                            ))}
                            <img src={rsiht} alt={imageName} />
                            <div> Ảnh: RSI hội tụ</div>
                          </div>
                        );
                      }


                    } else {
                      return (
                        <p key={index}>
                          {paragraph.trim().split('\n').map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line.trim()}
                              {idx !== paragraph.trim().split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </p>
                      );
                    }
                  })}
                </div>
              ) : null}

            <div className="content">
            {selectedGuide && selectedGuide.link ? (
              <div>
                <span>Tham khảo: </span>
                <a
                  href={selectedGuide.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ở đây
                </a>

              </div>
            ) : null}

            </div>
          </div>
  </div>
</div>

        </div>


      </div>
    </div>

    </>
  )
}
export default NewGuide;