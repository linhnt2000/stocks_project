from fastapi import APIRouter, Depends, HTTPException, status
import models, schemas, ultils
from sqlalchemy.orm import Session
from database import SessionLocal


router = APIRouter(
    prefix="/guide",
    tags=["Guide for newbie"]
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()  # Use the imported SessionLocal class
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Guide)
def create_guide(guide: schemas.GuideCreate, db: Session = Depends(get_db)):
    find_guide = db.query(models.Guide).filter_by(title=guide.title).first()
    if find_guide:
        raise HTTPException(status_code=400, detail="Guide already exists")
    new_guide = models.Guide(title=guide.title, description=guide.description, content=guide.content, link=guide.link)
    db.add(new_guide)
    db.commit()
    db.refresh(new_guide)
    return new_guide
    
@router.get("/")
def get_guides(db: Session = Depends(get_db)):
    return db.query(models.Guide).all()

@router.get("/{guide_id}")
def get_guide(guide_id: int, db: Session = Depends(get_db)):
    return db.query(models.Guide).filter(models.Guide.id == guide_id).first()

@router.put("/{guide_id}")
def update_guide(guide_id: int, guide: schemas.GuideUpdate, db: Session = Depends(get_db)):
    guide_db = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if guide_db is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    if guide.title:
        guide_db.title = guide.title
    if guide.description:
        guide_db.description = guide.description
    if guide.content:
        guide_db.content = guide.content
    if guide.link:
        guide_db.link = guide.link
    db.commit()
    db.refresh(guide_db)
    return guide_db


@router.delete("/{guide_id}")
def delete_guide(guide_id:int, db: Session = Depends(get_db)):
    guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    db.delete(guide)
    db.commit()
    return {"message": "Guide deleted successfully"}
    