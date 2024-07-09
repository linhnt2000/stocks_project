import asyncio
import requests
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Notification, EStatus , Groups , Tracking 

async def fetch_events():
    while True:
        db = SessionLocal()
        symbols = db.query(TrackedSymbols).all()
        for symbol in symbols:
            # Giả sử bạn có một API để lấy sự kiện của mã cổ phiếu
            response = requests.get(f"https://api.example.com/events?symbol={symbol.symbol}")
            events = response.json()
            for event in events:
                # Kiểm tra nếu sự kiện chưa tồn tại trong bảng thông báo
                exists = db.query(Notification).filter_by(message=event["message"]).first()
                if not exists:
                    new_notification = Notification(
                        user_id=1,  # Bạn có thể thay đổi logic để xác định user_id
                        type_id=1,  # Bạn có thể thay đổi logic để xác định type_id
                        message=event["message"],
                        status=EStatus.PENDING
                    )
                    db.add(new_notification)
                    db.commit()
        db.close()
        await asyncio.sleep(60)  # Kiểm tra sự kiện mỗi phút