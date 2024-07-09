from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas, ultils
from oauth2 import get_current_user,authenticate_user,create_access_token
from background_tasks import check_attention, is_within_trading_hours
from dependencies import get_db, get_active_users

ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter(
    tags=["Authentication"]
)


# Route to handle user signup
@router.post("/signup/")
async def signup(user_data: schemas.User, db: Session = Depends(get_db)):
    username = user_data.username
    password = ultils.get_password_hash(user_data.password)
    # Create a new user object
    new_user = models.User(username=username, password=password)
    # Add the new user to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user




@router.post("/login/")
async def login(user_data: schemas.UserLogin, background_tasks: BackgroundTasks, db: Session = Depends(get_db), active_users: set = Depends(get_active_users)):
    username = user_data.username
    password = user_data.password
    
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.id not in active_users:
        active_users.add(user.id)
        if is_within_trading_hours() and len(active_users) == 1:
            background_tasks.add_task(check_attention, db, active_users)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return schemas.Token(access_token=access_token, token_type="bearer")

@router.put("/update_password/")
async def update_password(user_data: schemas.Update_password, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    username = user_data.username
    old_password = user_data.old_password
    new_password = user_data.new_password
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None or not ultils.verify_password(old_password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user.password = ultils.get_password_hash(new_password)
    try:
        db.commit()
        db.refresh(user)
    except:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    return {"message": "Password updated successfully"}


@router.delete("/delete_user/")
async def delete_user(username: str,current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username, models.User.password == password).first()
    if user is None:
        return {"message": "Invalid credentials"}
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}



# Example route to get users
@router.get("/users/" )
async def get_users(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_active_users()

