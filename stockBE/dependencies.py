from database import SessionLocal

# Dependency để lấy một phiên làm việc của cơ sở dữ liệu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

active_users = set()

# Hàm để lấy active_users
def get_active_users():
    return active_users
