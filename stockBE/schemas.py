from pydantic import BaseModel
from typing import Optional
from models import EStatus

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str
    password: str

class Update_password(BaseModel):
    username: str
    old_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

class Guide(BaseModel):
    title: str
    description: str
    content: str
    link: str

class GuideCreate(BaseModel):
    title: str
    description: str
    content: str
    link: str

class GuideUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    link: Optional[str] = None


class TrackingGroupCreate(BaseModel):
    name: str


class TrackingCreate(BaseModel):
    group_id: int
    code: str

class UpdateStatus(BaseModel):
    notification_id: int
    status: EStatus

class Notification(BaseModel):
    username: str
    message: str
    # type_id: int
    # status: EStatus

class NotificationAll(BaseModel):
    message: str

