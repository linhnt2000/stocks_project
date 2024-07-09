from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import logging
import models
from datetime import datetime 
from database import SessionLocal
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections = {}  # Dictionary to map username to WebSocket object
        self.db = SessionLocal()

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_connections[username] = websocket  # Store WebSocket object with username

    def disconnect(self, websocket: WebSocket, username: str):
        self.active_connections.remove(websocket)
        if username in self.user_connections:
            del self.user_connections[username]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_personal_message_to_user(self, message: str, username: str):
        websocket = self.user_connections.get(username)
        if websocket:
            await websocket.send_text(message)
            logging.info(f"Sent message to user {username}: {message}")
        else:
            logging.warning(f"No WebSocket found for user {username}")

    async def broadcast(self, message: str):
        try:
            for username, websocket in self.user_connections.items():
                user = self.db.query(models.User).filter(models.User.username == username).first()
                try:
                    if user:
                        json_data = json.dumps(message)
                        new_notification = models.Notification(
                            user_id=user.id, 
                            type_id=4,
                            message=json_data,
                            status=models.EStatus.PENDING,
                            created_date=datetime.now()
                        )
                        self.db.add(new_notification)
                        await websocket.send_text(message)
                    else:
                        logging.warning(f"User not found for username {username}")
                except Exception as e:
                    logging.error(f"Error broadcasting message to user {username}: {str(e)}")
            
            # Commit changes to the database after processing all notifications
            self.db.commit()
        except Exception as e:
            logging.error(f"Error in broadcast method: {str(e)}")
            self.db.rollback()
        finally:
            self.db.close()  # Ensure session is closed properly


# Initialize ConnectionManager instance
manager = ConnectionManager()

# Example FastAPI endpoint handling WebSocket connections
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message_to_user(f"Client says: {data}", username)
            logging.info(f"Sent message to user {username}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, username)
        await manager.broadcast("A client disconnected")
