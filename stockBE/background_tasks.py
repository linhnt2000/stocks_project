import datetime
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import and_, cast, Date
import models
import vnstock as vs
from indicator import calculate_moving_average_series_data,calculate_moving_average_volume_data

def get_stock_data(name):
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.datetime.now() - datetime.timedelta(days=45)).strftime("%Y-%m-%d")

    data = vs.stock_historical_data(
        symbol=name,
        start_date=start_date,
        end_date=current_date,
        resolution="1D",
        type="stock",
        beautify=True,
        decor=False,
        source='TCBS'
    )
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

def is_within_trading_hours():
    current_time = datetime.datetime.now().time()
    current_day = datetime.datetime.now().weekday()  # Lấy ngày trong tuần (0: Thứ 2, ..., 6: Chủ nhật)
    
    morning_start = datetime.time(9, 0)
    morning_end = datetime.time(11, 30)
    afternoon_start = datetime.time(13, 0)
    afternoon_end = datetime.time(14, 50)
    
    # Kiểm tra ngoài giờ và ngày trong tuần từ thứ 2 đến thứ 6
    is_weekday = current_day >= 0 and current_day <= 4  # Thứ 2 đến thứ 6
    
    return is_weekday and ((morning_start <= current_time <= morning_end) or (afternoon_start <= current_time <= afternoon_end))


async def check_attention(db: Session, active_users: set):
    try:
        while active_users:
            if is_within_trading_hours():
                users = db.query(models.User).filter(models.User.id.in_(active_users)).all()
                for user in users:
                    list_tracking_codes = db.query(models.Tracking.code).join(models.Groups).\
                        filter(models.Groups.user_id == user.id).distinct().all()
                    
                    attention_messages = []
                    
                    for tracking in list_tracking_codes:
                        stock_data = get_stock_data(tracking.code)
                        SMA5_Volume = calculate_moving_average_volume_data(stock_data[:-1], 5)
                        SMA5_Price = calculate_moving_average_series_data(stock_data, 5)

                        if stock_data[-1]["volume"] >= 2 * SMA5_Volume[-1]["value"]:
                            attention_messages.append(f"{tracking.code} has high volume")
                            if not db.query(models.Attention).filter_by(user_id=user.id, type_id=1, ticker=tracking.code).first():
                                new_attention_news = models.Attention(
                                    user_id=user.id,
                                    type_id=1,
                                    ticker=tracking.code,
                                    time=datetime.datetime.now()
                                )
                                db.add(new_attention_news)
                                db.commit()

                        if stock_data[-1]["close"] > SMA5_Price[-1]["value"] and stock_data[-2]["close"] < SMA5_Price[-2]["value"]:
                            attention_messages.append(f"{tracking.code} has price breaking SMA(5) threshold")
                            if not db.query(models.Attention).filter_by(user_id=user.id, type_id=2, ticker=tracking.code).first():
                                new_attention_news = models.Attention(
                                    user_id=user.id,
                                    type_id=2,
                                    ticker=tracking.code,
                                    time=datetime.datetime.now()
                                )
                                db.add(new_attention_news)
                                db.commit()

                        if stock_data[-1]["close"] < SMA5_Price[-1]["value"] and stock_data[-2]["close"] > SMA5_Price[-2]["value"]:
                            attention_messages.append(f"{tracking.code} has price under SMA(5) threshold")
                            if not db.query(models.Attention).filter_by(user_id=user.id, type_id=3, ticker=tracking.code).first():
                                new_attention_news = models.Attention(
                                    user_id=user.id,
                                    type_id=3,
                                    ticker=tracking.code,
                                    time=datetime.datetime.now()
                                )
                                db.add(new_attention_news)
                                db.commit()
            
            await asyncio.sleep(60)  # Wait for 60 seconds before the next check
    except asyncio.CancelledError:
        print("check_attention task was cancelled")
        raise

# Hàm reset mỗi ngày trừ thứ 7 cn
async def reset_active_users(active_users: set):
    try:
        while True:
            now = datetime.datetime.now()
            # Reset at midnight every weekday
            next_reset = now.replace(hour=0, minute=0, second=0, microsecond=0) + datetime.timedelta(days=1)
            if next_reset.weekday() >= 5:  # If the next day is Saturday or Sunday, skip to next Monday
                days_to_add = 7 - next_reset.weekday()
                next_reset += datetime.timedelta(days=days_to_add)

            await asyncio.sleep((next_reset - now).total_seconds())
            active_users.clear()
    except asyncio.CancelledError:
        print("reset_active_users task was cancelled")
        raise
    finally:
        print("reset_active_users task cleanup complete")