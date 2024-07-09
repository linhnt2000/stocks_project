from fastapi import APIRouter, Depends, HTTPException, status
import  schemas, ultils
import models
from sqlalchemy.orm import Session
from database import SessionLocal
import vnstock as vs
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import logging
import math
from oauth2 import get_current_user

router = APIRouter(
    prefix="/infor",
    tags=["Information for newbie"]
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()  # Use the imported SessionLocal class
    try:
        yield db
    finally:
        db.close()

def get_infor_data():
    data = vs.listing_companies(live=True)
    if not data.empty:
        for index, row in data.iterrows():
            if 'comGroupCode' in row:
                if row['comGroupCode'] not in ["HOSE", "HNX", "UPCOM"]:
                    data = data.drop(index)  # Xóa hàng không thuộc danh sách
        return data
    else:
        return None




# Hàm lưu dữ liệu vào database
def save_to_db(data, db: Session):
    try:
        for index, row in data.iterrows():
            # Kiểm tra sự tồn tại của công ty
            existing_company = db.query(models.Companies).filter(models.Companies.ticker == row['ticker']).first()
            if existing_company:
                # Xóa thông tin cột group nếu không thuộc 3 giá trị "HOSE", "HNX", "UPCOM"
                if row['comGroupCode'] not in ["HOSE", "HNX", "UPCOM"]:
                    existing_company.group = None
                else:
                    # Cập nhật thông tin công ty nếu cần thiết
                    existing_company.name = row['organName']
                    existing_company.group = row['comGroupCode']
            else:
                # Thêm mới công ty
                company = models.Companies(
                    name=row['organName'],
                    ticker=row['ticker'],
                    group=row['comGroupCode']
                )
                db.add(company)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")

# Lấy dữ liệu và lưu vào database
@router.get("/fetch-and-save")
def fetch_and_save_data(db: Session = Depends(get_db)):
    data = get_infor_data()
    print(data)
    save_to_db(data, db)
    return {"message": "Data fetched and saved successfully"}

@router.get("/companies")
def get_companies():
    data = get_infor_data()
    return data.to_dict(orient="records")

@router.get("/companies-data")
def get_company_infor(db: Session = Depends(get_db)):
    return db.query(models.Companies).all()




# lịch sử cổ tức:
# Định nghĩa Pydantic model cho phản hồi
class DividendRecord(BaseModel):
    exerciseDate: str
    cashYear: int
    cashDividendPercentage: float
    issueMethod: str

def get_dividend_history(name:str):
    data = vs.dividend_history(name)
    df = pd.DataFrame(data)
    
    # Chuyển đổi DataFrame thành danh sách dictionary với kiểu dữ liệu Python tiêu chuẩn
    converted_data = df.to_dict(orient="records")

    return converted_data

# Lịch sử cổ tức
@router.get("/dividend_history", response_model=List[DividendRecord])
async def fetch_dividend_history(name: str):
    data = get_dividend_history(name)
    return data


# Hàm lấy dữ liệu tin tức của công ty từ vs.company_news
# Cấu hình logging
logging.basicConfig(level=logging.DEBUG)

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


# Endpoint FastAPI cho tin tức của công ty
@router.get("/company_news")
async def fetch_company_news(name: str):
    try:
        data = get_company_news(name)
        return data
    except ValueError as e:
        logging.error(f"Error fetching company news: {e}")
        return {"error": str(e)}

# Công ty
def get_company_profile(name:str):
    data = vs.company_profile(name)
    return data


# Thông tin công ty
@router.get("/company_profile")
async def fetch_company_profile(name: str):
    data = get_company_profile(name)
    return data

# # sự kiện công ty

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



# Endpoint FastAPI cho sự kiện công ty
@router.get("/company_events")
async def fetch_company_events(name: str):
    try:
        data = get_company_events(name)
        return data
    except ValueError as e:
        logging.error(f"Error fetching company events: {e}")
        return {"error": str(e)}


# Danh sách cổ đông
def get_shareholders(name:str):
    data = vs.company_large_shareholders(name)
    return data

@router.get("/shareholders")
async def fetch_shareholders(name: str):
    data = get_shareholders(name)
    return data


# Thông tin giao dịch nội bộ
def get_insider_deals(name:str):
    data = vs.company_insider_deals(symbol=name, page_size=40, page=0)
    return data

@router.get("/insider_deals")
async def fetch_insider_deals(name: str):
    data = get_insider_deals(name)
    return data

# Danh sách công ty con
def get_subsidiaries(name:str):
    data = vs.company_subsidiaries_listing(symbol=name, page_size=100, page=0)
    return data

@router.get("/subsidiaries")
async def fetch_subsidiaries(name: str):
    data = get_subsidiaries(name)
    return data

# Ban lãnh đạo công ty
def get_leadership(name:str):
    data = vs.company_officers (symbol=name, page_size=20, page=0)
    return data

@router.get("/leadership")
async def fetch_leadership(name: str):
    data = get_leadership(name)
    return data

# Chi tiết tin tức

def get_news_detail(news_id: int):
    data = vs.news_detail(news_id=news_id)    
    # # Log dữ liệu trả về 
    # logging.debug(f"Data returned from vs.company_news({name}): {data}")
    
    # Nếu dữ liệu là một DataFrame, chuyển đổi thành danh sách các từ điển
    if isinstance(data, pd.DataFrame):
        data = data.to_dict(orient='records')
    
    # Kiểm tra xem dữ liệu trả về có phải là danh sách các từ điển hay không
    if not isinstance(data, list) or not all(isinstance(item, dict) for item in data):
        raise ValueError("Dữ liệu trả về không đúng định dạng mong muốn")
    
    # Xử lý dữ liệu
    news_data = []
    for item in data:
        # # Kiểm tra và giữ nguyên giá trị None nếu kiểu dữ liệu không đúng
        # def valid_float(value):
        #     return value if isinstance(value, (float, int)) and not math.isnan(value) and not math.isinf(value) else None
        
        news_item = {
            "ticker": item.get("ticker"),
            "id": item.get("id"),
            "title": item.get("title", ""),
            "source": item.get("source", ""),
            "image": item.get("image", ""),
            "shortDesc": item.get("shortDesc", ""),
            "content" : item.get("content", ""),
            "publishDate": item.get("publishDate", ""),
            "authorFull": item.get("authorFull", "")
        }
        news_data.append(news_item)
    return news_data

@router.get("/news_detail")
async def fetch_news_detail(id: int):
    data = get_news_detail(id)
    return data


# Lấy thông tin theo danh sách
def price_broad(list_tracking_codes: list):
    # data= vs.price_board('VND,HCM,ACB')
    data = vs.price_board(list_tracking_codes)  # Assuming vs.price_board returns a DataFrame
    price_board = []
    for index, row in data.iterrows():
        price_item = {
            "Mã CP": row["Mã CP"],       # Adjust based on actual field name in your data
            "Giá": row["Giá"],           # Adjust based on actual field name in your data
            "KLBD/TB5D": row["KLBD/TB5D"],  # Add more fields as needed
            "T.độ GD": row["T.độ GD"],
            "KLGD ròng(CM)": row["KLGD ròng(CM)"],
            "RSI": row["RSI"],
            "MACD Hist": row["MACD Hist"],
            "MACD Signal": row["MACD Signal"],
            "Tín hiệu KT": row["Tín hiệu KT"],
            "Tín hiệu TB động": row["Tín hiệu TB động"],
            "MA20": row["MA20"],
            "MA50": row["MA50"],
            "MA100": row["MA100"],
            # Add more fields as needed
        }
        price_board.append(price_item)
    return price_board

@router.get("/price_board")
def get_price_board(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    
    # Query distinct tracking codes for the user
    tracking_codes = db.query(models.Tracking.code).join(models.Groups).\
        filter(models.Groups.user_id == user.id).distinct().all()
    
    # Convert list of tuples to list of codes
    list_tracking_codes = [code for (code,) in tracking_codes]
    
    # Join list into a comma-separated string
    tracking_codes_str = ','.join(list_tracking_codes)
    
    # Get price board data
    data = price_broad(tracking_codes_str)
    return data