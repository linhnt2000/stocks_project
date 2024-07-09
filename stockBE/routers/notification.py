from fastapi import APIRouter, Depends, HTTPException, status
import models, schemas, ultils
from sqlalchemy.orm import Session
from database import SessionLocal
from oauth2 import get_current_user
import vnstock as vs
from typing import List
import pandas as pd
import numpy as np
import logging
import math
from datetime import datetime
import json
from collections import defaultdict

router = APIRouter(
    prefix="/notification",
    tags=["Notification"]
)

# class NotificationCreate(BaseModel):
#     user_id: int
#     type_id: int
#     message: str

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()





# Hàm lấy dữ liệu sự kiện công ty

def get_company_events(name: str):
    data = vs.company_events(name)
    logging.debug(f"Data returned from vs.company_events({name}): {data}")
    
    # Nếu dữ liệu là một DataFrame, chuyển đổi thành danh sách các từ điển
    if isinstance(data, pd.DataFrame):
        data = data.to_dict(orient='records')
    
    # Kiểm tra xem dữ liệu trả về có phải là danh sách các từ điển hay không
    if not isinstance(data, list) or not all(isinstance(item, dict) for item in data):
        raise ValueError("Dữ liệu trả về không đúng định dạng mong muốn")
    
    # Xử lý dữ liệu
    event_list = []
    for item in data:
                # Kiểm tra và giữ nguyên giá trị None nếu kiểu dữ liệu không đúng
        def valid_float(value):
            return value if isinstance(value, (float, int)) and not math.isnan(value) and not math.isinf(value) else None
        try:
            
            event_item = {
                "rsi": valid_float(item.get("rsi")),
                "rs": valid_float(item.get("rs")),
                "id": item.get("id"),
                "ticker": item.get("ticker"),
                "price": valid_float(item.get("price")),
                "priceChange": valid_float(item.get("priceChange")),
                "priceChangeRatio": valid_float(item.get("priceChangeRatio")),
                "priceChangeRatio1M": valid_float(item.get("priceChangeRatio1M")),
                "eventName": item.get("eventName", ""),
                "eventCode": item.get("eventCode", ""),
                "notifyDate": item.get("notifyDate", ""),
                "exerDate": item.get("exerDate", ""),
                "regFinalDate": item.get("regFinalDate", ""),
                "exRigthDate": item.get("exRigthDate", ""),
                "eventDesc": item.get("eventDesc", "")
            }
            event_list.append(event_item)
        except (ValueError, TypeError) as e:
            logging.error(f"Error processing item: {e}. Item: {item}")

            # Xử lý dữ liệu
    return event_list

def get_event_notifications(username, db: Session):
    user = db.query(models.User).filter(models.User.username == username).first()
    list_tracking_code = db.query(models.Tracking).join(models.Groups).filter(models.Groups.user_id == user.id).all()
    
    code_dict = defaultdict(lambda: {'added_date': None, 'object': None})
    for tracking in list_tracking_code:
        code = tracking.code
        added_date = tracking.added_date
        if code_dict[code]['added_date'] is None or added_date < code_dict[code]['added_date']:
            code_dict[code] = {'added_date': added_date, 'object': tracking}
    
    list_tracking_code_filter = [value['object'] for value in code_dict.values() if value['added_date'] is not None]

    company_events_dict = {}

    for tracking in list_tracking_code_filter:
        events_list = get_company_events(tracking.code)
        
        filtered_events = [
            {   
                "id": event["id"],
                "eventName": event["eventName"],
                "notifyDate": event["notifyDate"],
                "eventDesc": event["eventDesc"]
            } 
            for event in events_list 
            if datetime.strptime(event["notifyDate"], "%Y-%m-%d %H:%M:%S") > tracking.added_date
        ]
        
        if filtered_events:
            company_events_dict[tracking.code] = filtered_events

    return company_events_dict

def get_event_notifications_since(username, db: Session, date):
    user = db.query(models.User).filter(models.User.username == username).first()
    list_tracking_code = db.query(models.Tracking.code).join(models.Groups).filter(models.Groups.user_id == user.id).distinct().all()

    company_events_dict = {}

    for tracking in list_tracking_code:
        events_list = get_company_events(tracking.code)
        
        filtered_events = [
            {   
                "id": event["id"],
                "eventName": event["eventName"],
                "notifyDate": event["notifyDate"],
                "eventDesc": event["eventDesc"]
            } 
            for event in events_list 
            if datetime.strptime(event["notifyDate"], "%Y-%m-%d %H:%M:%S") > date
        ]
        
        if filtered_events:
            company_events_dict[tracking.code] = filtered_events

    return company_events_dict



# Lấy dữ liệu về tin tức mới nhất của công ty
def get_company_news(name: str):
    data = vs.company_news(name)
    
    # # Log dữ liệu trả về 
    # logging.debug(f"Data returned from vs.company_news({name}): {data}")
    
    # Nếu dữ liệu là một DataFrame, chuyển đổi thành danh sách các từ điển
    if isinstance(data, pd.DataFrame):
        data = data.to_dict(orient='records')
    
    # Kiểm tra xem dữ liệu trả về có phải là danh sách các từ điển hay không
    if not isinstance(data, list) or not all(isinstance(item, dict) for item in data):
        raise ValueError("Dữ liệu trả về không đúng định dạng mong muốn")
    
    # Xử lý dữ liệu
    news_list = []
    for item in data:
        # Kiểm tra và giữ nguyên giá trị None nếu kiểu dữ liệu không đúng
        def valid_float(value):
            return value if isinstance(value, (float, int)) and not math.isnan(value) and not math.isinf(value) else None
        
        news_item = {
            "ticker": item.get("ticker"),
            "price": valid_float(item.get("price")),
            "priceChange": valid_float(item.get("priceChange")),
            "priceChangeRatio": valid_float(item.get("priceChangeRatio")),
            "priceChangeRatio1W": valid_float(item.get("priceChangeRatio1W")),
            "priceChangeRatio1M": valid_float(item.get("priceChangeRatio1M")),
            "id": item.get("id"),
            "title": item.get("title", ""),
            "source": item.get("source", ""),
            "publishDate": item.get("publishDate", "")
        }
        news_list.append(news_item)
    return news_list

def get_noti_new(username, db: Session):
    user = db.query(models.User).filter(models.User.username == username).first()
    list_tracking_code = db.query(models.Tracking).join(models.Groups).filter(models.Groups.user_id == user.id).all()
    # Tạo một từ điển để lưu trữ thông tin theo code
    code_dict = defaultdict(lambda: {'added_date': None, 'object': None})

    # Lọc và cập nhật thông tin theo code
    for tracking in list_tracking_code:
        code = tracking.code
        added_date = tracking.added_date
        if code_dict[code]['added_date'] is None or added_date < code_dict[code]['added_date']:
            code_dict[code] = {'added_date': added_date, 'object': tracking}

    # Lọc ra danh sách kết quả
    list_tracking_code_filter = [value['object'] for value in code_dict.values() if value['added_date'] is not None]

    company_news_dict = {}

    for tracking in list_tracking_code_filter:
        # Lấy tin tức từ các mã cổ phiếu mà người dùng theo dõi
        news_list = get_company_news(tracking.code)
        
        # Lọc tin tức theo ngày xuất bản
        filtered_news = [
            {   "id": news["id"],
                "title": news["title"],
                "source": news["source"],
                # "publishDate": datetime.strptime(news["publishDate"], "%Y-%m-%d %H:%M:%S")
            } 
            for news in news_list 
            if datetime.strptime(news["publishDate"], "%Y-%m-%d %H:%M:%S") > tracking.added_date
        ]
        
        # Thêm tin tức đã lọc vào từ điển
        if filtered_news:

            company_news_dict[tracking.code] = filtered_news

    return company_news_dict

def get_noti_new2(username, db: Session, date):
    user = db.query(models.User).filter(models.User.username == username).first()
    list_tracking_code = db.query(models.Tracking.code).join(models.Groups).\
        filter(models.Groups.user_id == user.id).distinct().all()
    company_news_dict = {}

    for tracking in list_tracking_code:
        # Lấy tin tức từ các mã cổ phiếu mà người dùng theo dõi
        news_list = get_company_news(tracking.code)
        
        # Lọc tin tức theo ngày xuất bản
        filtered_news = [
            {   "id": news["id"],
                "title": news["title"],
                "source": news["source"],
                # "publishDate": datetime.strptime(news["publishDate"], "%Y-%m-%d %H:%M:%S")
            } 
            for news in news_list 
            if datetime.strptime(news["publishDate"], "%Y-%m-%d %H:%M:%S") > date
        ]
        
        # Thêm tin tức đã lọc vào từ điển
        if filtered_news:

            company_news_dict[tracking.code] = filtered_news

    return company_news_dict


def update_notification_status(user_id: int, db: Session, status: models.EStatus):
    pending_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == user_id, 
        models.Notification.status == models.EStatus.PENDING
    ).all()
    
    for notification in pending_notifications:
        notification.status = status
    
    db.commit()

# def update_notification_status_id(notification_id: int, db: Session, status: models.EStatus):
#     notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
#     notification.status = status
#     db.commit()


@router.get('/get_news')
def get_new_notifications(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    
    last_noti = db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.id.desc()).first()
    notifications = None
    
    if last_noti:
        date = last_noti.created_date
        notifications_news = get_noti_new2(user.username, db, date)
        notifications_events = get_event_notifications_since(user.username, db, date)

        if notifications_news:
            json_data_news = json.dumps(notifications_news)
            new_notification_news = models.Notification(
                user_id=user.id,
                type_id=1,
                message=json_data_news,
                status=models.EStatus.PENDING,
                created_date = datetime.now()
            )
            db.add(new_notification_news)
        
        if notifications_events:
            json_data_events = json.dumps(notifications_events)
            new_notification_events = models.Notification(
                user_id=user.id,
                type_id=2,
                message=json_data_events,
                status=models.EStatus.PENDING,
                created_date = datetime.now()
            )
            db.add(new_notification_events)

        db.commit()

    if not last_noti:
        first_notifications_news = get_noti_new(user.username, db)
        first_notifications_events = get_event_notifications(user.username, db)

        if first_notifications_news:
            json_data_news = json.dumps(first_notifications_news)
            new_notification_news = models.Notification(
                user_id=user.id,
                type_id=1,
                message=json_data_news,
                status=models.EStatus.PENDING,
                created_date = datetime.now()
            )
            db.add(new_notification_news)
        
        if first_notifications_events:
            json_data_events = json.dumps(first_notifications_events)
            new_notification_events = models.Notification(
                user_id=user.id,
                type_id=2,
                message=json_data_events,
                status=models.EStatus.PENDING,
                created_date = datetime.now()
            )
            db.add(new_notification_events)

        db.commit()
        
        notifications = {
            'news': first_notifications_news,
            'events': first_notifications_events
        }
    
        # Update status to SENT after successfully sending notifications to user
        update_notification_status(user.id, db, models.EStatus.SENT)

    noti = db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.id.desc()).all()
    return noti


@router.get('/all')
def get_all_notifications(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    list_tracking_code = db.query(models.Tracking).join(models.Groups).filter(models.Groups.user_id == user.id).order_by(models.Tracking.code.asc()).all()

    # Tạo một từ điển để lưu trữ thông tin theo code
    code_dict = defaultdict(lambda: {'added_date': None, 'object': None})

    # Lọc và cập nhật thông tin theo code
    for tracking in list_tracking_code:
        code = tracking.code
        added_date = tracking.added_date
        if code_dict[code]['added_date'] is None or added_date < code_dict[code]['added_date']:
            code_dict[code] = {'added_date': added_date, 'object': tracking}

    # Lọc ra danh sách kết quả
    list_tracking_code_filter = [value['object'] for value in code_dict.values() if value['added_date'] is not None]

    return list_tracking_code_filter


@router.get('/news')
def get_new_notifications(current_user:schemas.User = Depends(get_current_user), db:Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    noti = db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.id.desc()).all()

    return noti

@router.post('/update_status')
def update_status(update_data: schemas.UpdateStatus, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    notification_id = update_data.notification_id
    status = update_data.status

    notification = db.query(models.Notification).filter(
        (models.Notification.id == notification_id) & (models.Notification.user_id == user.id)
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.status = status
    db.commit()
    return {"message": "Status updated successfully"}


