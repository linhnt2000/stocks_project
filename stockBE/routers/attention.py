from fastapi import APIRouter, Depends, HTTPException, status
import models, schemas, ultils
from sqlalchemy.orm import Session
from sqlalchemy import and_, cast, Date
from database import SessionLocal
from oauth2 import get_current_user
import vnstock as vs
from typing import List
import pandas as pd
import numpy as np
import logging
import math
import datetime
import json
from collections import defaultdict
from indicator import calculate_moving_average_series_data,calculate_moving_average_volume_data

router = APIRouter(
    prefix="/attention",
    tags=["Attention"]
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# def get_stock_data(name):
#     current_date = datetime.datetime.now().strftime("%Y-%m-%d")
#     start_date = (datetime.datetime.now() - datetime.timedelta(days=45)).strftime("%Y-%m-%d")

#     data = vs.stock_historical_data(
#         symbol=name,
#         start_date=start_date,
#         end_date=current_date,
#         resolution="1D",
#         type="stock",
#         beautify=True,
#         decor=False,
#         source='TCBS'
#     )
#     formatted_data = []
#     for index, row in data.iterrows():
#         formatted_item = {
#             "time": str(row["time"]),
#             "open": row["open"],
#             "high": row["high"],
#             "low": row["low"],
#             "close": row["close"],
#             "volume": row["volume"],
#             "ticker": row["ticker"]
#         }
#         formatted_data.append(formatted_item)
#     return formatted_data



# @router.get("/check_attention")
# async def check_attention(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
#     user = db.query(models.User).filter(models.User.username == current_user.username).first()
    
#     list_tracking_codes = db.query(models.Tracking.code).join(models.Groups).\
#         filter(models.Groups.user_id == user.id).distinct().all()
#     # print(list_tracking_codes)
#     attention_messages = []

    
#     for tracking in list_tracking_codes:
#         # attention_messages.append(tracking.code)
#         stock_data = get_stock_data(tracking.code)
#         # Calculate SMA(5) for volume
#         SMA5_Volume = calculate_moving_average_volume_data(stock_data[:-1], 5)  # Exclude the current day
#         SMA5_Price = calculate_moving_average_series_data(stock_data, 5)
        
#         # # Debugging: Print out stock_data and SMA5_Volume to verify their structure
#         # print(f"Stock data for {code}: {stock_data}")
#         # print(f"SMA5 Volume data for {code}: {SMA5_Volume}")

#         today = datetime.datetime.now().date()

#         # Example logic to determine attention based on SMA5 and volume
#         if stock_data[-1]["volume"] >= 2 * SMA5_Volume[-1]["value"]:
#             existing_attention = db.query(models.Attention).filter(
#                 and_(
#                     models.Attention.user_id == user.id,
#                     models.Attention.ticker == tracking.code,
#                     models.Attention.type_id == 1,
#                     models.Attention.time.cast(Date) == today
#                 )
#             ).first()
#             if not existing_attention:
#                 attention_messages.append(f"{tracking.code} has high volume")
#                 new_attention_news = models.Attention(
#                     user_id=user.id,
#                     type_id=1,
#                     ticker=tracking.code,
#                     time=datetime.datetime.now()
#                 )
#                 db.add(new_attention_news)
#                 db.commit()
#                 print(attention_messages)
#         if stock_data[-1]["close"] > SMA5_Price[-1]["value"] and stock_data[-2]["close"] < SMA5_Price[-2]["value"]:
#             existing_attention = db.query(models.Attention).filter(
#                 and_(
#                     models.Attention.user_id == user.id,
#                     models.Attention.ticker == tracking.code,
#                     models.Attention.type_id == 2,
#                     models.Attention.time.cast(Date) == today
#                 )
#             ).first()
#             if not existing_attention:
#                 attention_messages.append(f"{tracking.code} has price breaking SMA(5) threshold")
#                 new_attention_news = models.Attention(
#                     user_id=user.id,
#                     type_id=2,
#                     ticker=tracking.code,
#                     time=datetime.datetime.now()
#                 )
#                 db.add(new_attention_news)
#                 db.commit()
#                 print(attention_messages)

#         if stock_data[-1]["close"] < SMA5_Price[-1]["value"] and stock_data[-2]["close"] > SMA5_Price[-2]["value"]:
#             existing_attention = db.query(models.Attention).filter(
#                 and_(
#                     models.Attention.user_id == user.id,
#                     models.Attention.ticker == tracking.code,
#                     models.Attention.type_id == 3,
#                     models.Attention.time.cast(Date) == today
#                 )
#             ).first()
#             if not existing_attention:
#                 attention_messages.append(f"{tracking.code} has price under SMA(5) threshold")
#                 new_attention_news = models.Attention(
#                     user_id=user.id,
#                     type_id=3,
#                     ticker=tracking.code,
#                     time=datetime.datetime.now()
#                 )
#                 db.add(new_attention_news)
#                 db.commit()
#                 print(attention_messages)
#     attention_data = db.query(models.Attention).filter(models.Attention.user_id == user.id).order_by(models.Attention.id.desc()).all()         
#     return attention_data

@router.get('/check_attention')
async def check_attention(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    attention_data = db.query(models.Attention).filter(models.Attention.user_id == user.id).order_by(models.Attention.id.desc()).all()         
    return attention_data    

# Định nghĩa endpoint cho API
@router.get("/stock_data")
async def fetch_stock_data(name: str):  # Thêm đối số name  ,current_user: schemas.User = Depends(get_current_user)
    data = get_stock_data(name)
    return data