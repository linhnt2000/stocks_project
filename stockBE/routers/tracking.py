import datetime
from fastapi import APIRouter, Depends, HTTPException, status
import models, schemas, ultils
from sqlalchemy.orm import Session
from database import SessionLocal
from oauth2 import get_current_user






router = APIRouter(
    prefix="/tracking",
    tags=["Trackings for stock code"]
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()  # Use the imported SessionLocal class
    try:
        yield db
    finally:
        db.close()

# Tạo danh sách theo dõi
@router.post("/group_tracking")
def create_group_tracking(
    group: schemas.TrackingGroupCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_group = models.Groups(name=group.name, user_id=user.id)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group


# Lấy danh sách theo dõi
@router.get("/group_tracking")
def get_group_tracking(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    groups = db.query(models.Groups).filter(models.Groups.user_id == user.id).all()
    return groups


# Cập nhật danh sách theo id
@router.put("/group_tracking/{group_id}")
def update_group_tracking(
    group_id: int,
    group_update: schemas.TrackingGroupCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    group = db.query(models.Groups).filter(models.Groups.id == group_id, models.Groups.user_id == user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    group.name = group_update.name
    db.commit()
    db.refresh(group)
    return group

@router.delete("/group_tracking/{group_id}")
def delete_group_tracking(
    group_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    group = db.query(models.Groups).filter(models.Groups.id == group_id, models.Groups.user_id == user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    db.delete(group)
    db.commit()
    return {"message": "Group deleted successfully"}

# Tạo mã theo dõi 
@router.post("/tracking")
def create_tracking(
    tracking: schemas.TrackingCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
): 
    if tracking.code == "" or tracking.group_id is None:
        raise HTTPException(status_code=404, detail="Code or group_id is empty")
    
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    group = db.query(models.Groups).filter(models.Groups.id == tracking.group_id, models.Groups.user_id == user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    existing_tracking = db.query(models.Tracking).filter(
        models.Tracking.code == tracking.code,
        models.Tracking.group_id == tracking.group_id
    ).first()
    if existing_tracking:
        raise HTTPException(status_code=400, detail="Tracking code already exists in this group")


    new_tracking = models.Tracking(
        group_id=tracking.group_id,
        code=tracking.code,
        added_date=datetime.datetime.now()
    )
    db.add(new_tracking)
    db.commit()
    db.refresh(new_tracking)
    return new_tracking

# Lấy danh sách mã theo dõi
@router.get("/tracking")
def get_tracking(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    trackings = db.query(models.Tracking).join(models.Groups).filter(models.Groups.user_id == user.id).all()
    return trackings

# lấy danh sách mã theo dõi theo group_id
@router.get("/tracking/group/{group_id}")
def get_tracking_by_group(
    group_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Kiểm tra xem nhóm có tồn tại và thuộc về người dùng hiện tại hay không
    group = db.query(models.Groups).filter(models.Groups.id == group_id, models.Groups.user_id == user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Lấy tất cả các mã theo dõi theo group_id
    trackings = db.query(models.Tracking).filter(models.Tracking.group_id == group_id).all()
    return trackings


# Xóa mã theo dõi
@router.delete("/tracking/{tracking_id}")
def delete_tracking(
    tracking_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == current_user.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tracking = db.query(models.Tracking).join(models.Groups).filter(models.Tracking.id == tracking_id, models.Groups.user_id == user.id).first()
    if not tracking:
        raise HTTPException(status_code=404, detail="Tracking not found")

    db.delete(tracking)
    db.commit()
    return {"message": "Tracking deleted successfully"}

