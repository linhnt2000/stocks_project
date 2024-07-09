import datetime
from fastapi import APIRouter,Depends
import vnstock as vs
from typing import List
import pandas as pd
import schemas
from oauth2 import get_current_user




router = APIRouter(
    prefix="/stock",
    tags=["Stock Data"]
)


# Định nghĩa hàm lấy dữ liệu từ vnstock với biến name
def get_stock_data(name):
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    # start_date = (datetime.datetime.now() - datetime.timedelta(days=15)).strftime("%Y-%m-%d")
    data = vs.stock_historical_data(
        symbol=name,
        start_date=current_date, 
        end_date=current_date, 
        resolution="5", 
        type="index", 
        beautify=True, 
        decor=False, 
        source='DNSE'
    )
    return data

def get_stock_data2(name,start_date,end_date):
    data = vs.stock_historical_data(
        symbol=name,  # Thay thế symbol="TCB" bằng symbol=name
        start_date=start_date, 
        end_date=end_date, 
        resolution="1H", 
        type="stock", 
        beautify=True, 
        decor=False, 
        source='DNSE'
    )
    return data

def get_stock_data3(name,start_date,end_date,resolution):
    currentDate = datetime.datetime.now().strftime("%Y-%m-%d")
    if resolution == '' :
        resolution = 'D'
    data = vs.longterm_ohlc_data (
        symbol=name,
        start_date=start_date, 
        end_date=end_date, 
        resolution=resolution, 
        type="stock", 
    )
    if resolution == '1H':
        data = vs.stock_historical_data (
            symbol=name, 
            start_date=start_date, 
            end_date=end_date, 
            resolution="1H", 
            type="stock", 
            source='DNSE'
        )
    return data


def get_analysis(name: str) :
    stock_codes = "TCH," + name
    data = vs.stock_ls_analysis(stock_codes)
    return data






# Định nghĩa endpoint cho API
@router.get("/stock_data", response_model=List[dict])
async def fetch_stock_data(name: str):
    data = get_stock_data(name)
    formatted_data = []
    
    previous_close = None  # Variable to store the close price of the previous day
    
    for index, row in data.iterrows():
        # Skip calculation for the first row since there's no previous day's close
        if previous_close is None:
            previous_close = row["close"]
            continue
        
        # Calculate 'Change' and '% Change' based on the previous day's close
        daily_change = row["close"] - previous_close
        percent_change = (daily_change / previous_close) * 100 if previous_close != 0 else 0
        
        formatted_item = {
            "time": str(row["time"]),
            "open": row["open"],
            "high": row["high"],
            "low": row["low"],
            "close": row["close"],
            "volume": row["volume"],
            "ticker": row["ticker"],
            "Change": daily_change,       # Daily change based on previous day's close
            "% Change": percent_change    # Percentage change based on previous day's close
        }
        formatted_data.append(formatted_item)
        
        # Update previous_close for the next iteration
        previous_close = row["close"]
    
    return formatted_data

@router.get("/analysis")
async def fetch_analysis(name: str):
    data = get_analysis(name)
    return data

@router.get("/stock_data/")
async def fetch_stock_data2(name: str, start_date: str, end_date: str):  # Thêm đối số name  ,current_user: schemas.User = Depends(get_current_user)
    data = get_stock_data2(name,start_date,end_date)
    formatted_data = []
    for index, row in data.iterrows():
        formatted_item = {
            "time": str(row["time"]),
            "open": row["open"],
            "high": row["high"],
            "low": row["low"],
            "close": row["close"],
            "volume": row["volume"],
            "ticker": row["ticker"]
        }
        formatted_data.append(formatted_item)
    return formatted_data


@router.get('/stock_data3')
async def fetch_stock_data3(name:str, start_date: str, end_date: str, revolution: str):
    data = get_stock_data3(name, start_date, end_date, revolution)
    formatted_data = []
    previous_close = None  # Variable to store the close price of the previous day
    
    for index, row in data.iterrows():
        # Skip calculation for the first row since there's no previous day's close
        if previous_close is None:
            previous_close = row["close"]
            continue
        
        # Calculate 'Change' and '% Change' based on the previous day's close
        daily_change = row["close"] - previous_close
        percent_change = (daily_change / previous_close) * 100 if previous_close != 0 else 0
        
        formatted_item = {
            "time": str(row["time"]),
            "open": row["open"],
            "high": row["high"],
            "low": row["low"],
            "close": row["close"],
            "volume": row["volume"],
            "ticker": row["ticker"],
            "change": daily_change,       # Daily change based on previous day's close
            "perChange": percent_change    # Percentage change based on previous day's close
        }
        formatted_data.append(formatted_item)
        
        # Update previous_close for the next iteration
        previous_close = row["close"]
    
    return formatted_data


