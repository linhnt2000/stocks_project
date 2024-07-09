from fastapi import FastAPI, Depends,WebSocket
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, stock, guide, infor, tracking, notification, forecast, attention
from background_tasks import reset_active_users
from dependencies import  active_users
import asyncio
from sockets import manager, websocket_endpoint
from dependencies import get_db
from sqlalchemy.orm import Session
from schemas import Notification, NotificationAll
from oauth2 import get_current_user 

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    app.reset_task = asyncio.create_task(reset_active_users(active_users))

@app.on_event("shutdown")
async def shutdown_event():
    app.reset_task.cancel()
    try:
        await app.reset_task
    except asyncio.CancelledError:
        print("reset_active_users task was cancelled during shutdown")


# Thêm middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5173"],  # Cấu hình cho domain frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include các router
app.include_router(auth.router)
app.include_router(stock.router)
app.include_router(guide.router)
app.include_router(infor.router)
app.include_router(tracking.router)
app.include_router(notification.router)
app.include_router(forecast.router)
app.include_router(attention.router)


@app.websocket("/ws/{token}")
async def websocket_route(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    try:
        print(f"Attempting to connect WebSocket with token: {token}")
        user = await get_current_user(token=token, db=db)  # Sử dụng hàm xác thực từ oauth2.py
        print(f"WebSocket connected for user: {user.username}")
        print(f"WebSocket connected for user: {user.id}")
        await websocket_endpoint(websocket, user.username)
    except HTTPException as e:
        print(f"WebSocket connection failed: {e}")
        await websocket.close(code=e.status_code)


@app.post("/notify/")
async def notify(notification: Notification):
    await manager.send_personal_message_to_user(notification.message, notification.username)
    return {"message": "Notification sent"}

@app.post("/notify-all/")
async def notify_all(notification: NotificationAll):
    await manager.broadcast(notification.message)
    return {"message": "Notification sent to all active users"}


