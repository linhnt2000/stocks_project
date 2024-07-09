import datetime
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
import json
from collections import defaultdict
from indicator import calculate_rsi_series_data, calculate_macd_series_data


router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"]
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def stocks_to_dict(stocks: List[models.Stocks]):
    return [{"open": stock.open, "id": stock.id, "low": stock.low, "volume": stock.volume, "time": stock.time.strftime("%Y-%m-%d"), "high": stock.high, "ticker": stock.ticker, "close": stock.close} for stock in stocks]

def stocks_to_dict2(stocks: List[models.Stocks]):
    stock_dicts = []
    previous_close = None

    for stock in stocks:
        row = {
            "open": stock.open,
            "id": stock.id,
            "low": stock.low,
            "volume": stock.volume,
            "time": stock.time.strftime("%Y-%m-%d"),
            "high": stock.high,
            "ticker": stock.ticker,
            "close": stock.close
        }

        if previous_close is not None:
            daily_change = row["close"] - previous_close
            percent_change = (daily_change / previous_close) * 100 if previous_close != 0 else 0
        else:
            daily_change = 0
            percent_change = 0

        row["change"] = daily_change
        row["perChange"] = percent_change

        previous_close = row["close"]

        stock_dicts.append(row)

    return stock_dicts


# Định nghĩa hàm lấy dữ liệu từ vnstock với biến name
def get_stock_data(name):
    currentDate = datetime.datetime.now().strftime("%Y-%m-%d")
    data = vs.stock_historical_data(
        symbol=name,
        start_date="2000-01-02", 
        end_date=currentDate, 
        resolution="1D", 
        type="index", 
        beautify=True, 
        decor=False, 
        source='TCBS'
    )
    return data

def update_stock_data(data, name, db: Session):
    new_data = []
    for index, row in data.iterrows():
        # Kiểm tra xem dữ liệu đã tồn tại trong cơ sở dữ liệu chưa
        existing_data = db.query(models.Stocks).filter(
            models.Stocks.ticker == name,
            models.Stocks.time == row['time']  # time là trường dùng để xác định dữ liệu đã tồn tại hay không
        ).first()
        if existing_data:
            # Nếu dữ liệu đã tồn tại, cập nhật các giá trị
            existing_data.ticker = name
            existing_data.open = row['open']
            existing_data.high = row['high']
            existing_data.low = row['low']
            existing_data.close = row['close']
            existing_data.volume = row['volume']
        else:
            # Nếu dữ liệu chưa tồn tại, thêm vào danh sách dữ liệu mới
            new_data.append(models.Stocks(
                ticker=name,
                time=row["time"],
                open=row["open"],
                high=row["high"],
                low=row["low"],
                close=row["close"],
                volume=row["volume"]
            ))
    
    # Thêm dữ liệu mới vào cơ sở dữ liệu
    if new_data:
        db.add_all(new_data)
        db.commit()

    return new_data





@router.get("/vn_stock")
async def fetch_stock_data(name: str):  # Thêm đối số name  ,current_user: schemas.User = Depends(get_current_user)
    data = get_stock_data(name)
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


@router.get('/update_stock_data')
async def update_stock_data_route(name: str, db: Session = Depends(get_db)):
    data = get_stock_data(name)
    def update_data():
        
        return update_stock_data(data, name, db) 

    new_data = update_data()
    return {"data": new_data}


@router.get('/stock_data')
async def get_stock(name:str, db:Session= Depends(get_db)):
    data = db.query(models.Stocks).filter(models.Stocks.ticker == name).order_by(models.Stocks.time.asc()).all()

    return data

@router.get('/stock_data2')
async def get_stock(name:str, start_date: str, end_date: str, db:Session= Depends(get_db)):
    data = db.query(models.Stocks).filter(models.Stocks.ticker == name, models.Stocks.time >= start_date, models.Stocks.time <= end_date).order_by(models.Stocks.time.asc()).all()
    formatted_data = stocks_to_dict2(data)
    return formatted_data


@router.get('/test_rsi')
async def test_rsi(name: str, start_date: str, end_date: str, db: Session = Depends(get_db)):
    data = db.query(models.Stocks).filter(models.Stocks.ticker == name, models.Stocks.time >= start_date, models.Stocks.time <= end_date).order_by(models.Stocks.time.asc()).all()
    data_dict = stocks_to_dict(data)
    rsi_data = calculate_rsi_series_data(data_dict, 14)

    rsi_data_filtered = []

    for i in range(1, len(rsi_data) - 1):
        if "value" in rsi_data[i] and "value" in rsi_data[i - 1] and "value" in rsi_data[i + 1]:
            prev_value = rsi_data[i - 1]["value"]
            current_value = rsi_data[i]["value"]
            next_value = rsi_data[i + 1]["value"]
            
            # Tìm đỉnh (local maximum) với giá trị trên 70
            if current_value > prev_value and current_value > next_value and current_value > 70:
                is_peak = True
                for j in range(1, min(20, len(rsi_data) - i - 1)):
                    if rsi_data[i + j]["value"] > rsi_data[i]["value"]:
                        is_peak = False
                        break
                if is_peak:
                    rsi_data_filtered.append({"time": rsi_data[i]["time"], "value": current_value, "type": "peak"})
            
            # Tìm đáy (local minimum) với giá trị dưới 30
            elif current_value < prev_value and current_value < next_value and current_value < 30:
                is_trough = True
                for j in range(1, min(20, len(rsi_data) - i - 1)):
                    if rsi_data[i + j]["value"] < rsi_data[i]["value"]:
                        is_trough = False
                        break
                if is_trough:
                    rsi_data_filtered.append({"time": rsi_data[i]["time"], "value": current_value, "type": "trough"})

    return rsi_data_filtered


@router.get('/test_macd')
async def test_macd(name: str, start_date: str, end_date: str, db: Session = Depends(get_db)):
    data = db.query(models.Stocks).filter(models.Stocks.ticker == name, models.Stocks.time >= start_date, models.Stocks.time <= end_date).order_by(models.Stocks.time.asc()).all()
    data_dict = stocks_to_dict(data)
    macd_data = calculate_macd_series_data(data_dict, 12, 26, 9)

    macd_data_filtered = []

    for i in range(2, len(macd_data) - 2):
        if "Histogram" in macd_data[i] and "Histogram" in macd_data[i - 2] and "Histogram" in macd_data[i - 1] and "Histogram" in macd_data[i + 1] and "Histogram" in macd_data[i + 2]:
            prev_value2 = macd_data[i - 2]["Histogram"]
            prev_value1 = macd_data[i - 1]["Histogram"]
            current_value = macd_data[i]["Histogram"]
            next_value1 = macd_data[i + 1]["Histogram"]
            next_value2 = macd_data[i + 2]["Histogram"]
            
            # Tìm đỉnh (local maximum) với giá trị dương
            if current_value > prev_value2 and current_value > prev_value1 and current_value > next_value1 and current_value > next_value2 and current_value > 0:
                is_peak = True
                for j in range(1, min(20, len(macd_data) - i - 1)):
                    if macd_data[i + j]["Histogram"] > macd_data[i]["Histogram"]:
                        is_peak = False
                        break
                if is_peak:
                    macd_data_filtered.append({"time": macd_data[i]["time"], "value": current_value, "type": "peak"})
            
            # Tìm đáy (local minimum) với giá trị âm
            elif current_value < prev_value2 and current_value < prev_value1 and current_value < next_value1 and current_value < next_value2 and current_value < 0:
                is_trough = True
                for j in range(1, min(20, len(macd_data) - i - 1)):
                    if macd_data[i + j]["Histogram"] < macd_data[i]["Histogram"]:
                        is_trough = False
                        break
                if is_trough:
                    macd_data_filtered.append({"time": macd_data[i]["time"], "value": current_value, "type": "trough"})

    return macd_data_filtered




