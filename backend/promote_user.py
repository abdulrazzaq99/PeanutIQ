import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User, UserRole

def promote_user(email: str, role: str):
    db = SessionLocal()
    user = db.query(User).filter(User.identifier == email).first()
    
    if not user:
        print(f"❌ User '{email}' not found!")
        print("Please log in once through the web application first so the account gets created.")
        db.close()
        return
    
    if role not in ["admin", "researcher"]:
        print("❌ Invalid role. Must be 'admin' or 'researcher'")
        db.close()
        return
        
    user.role = UserRole(role)
    db.commit()
    db.close()
    print(f"✅ Successfully promoted {email} to {role}!")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python promote_user.py <email> <role>")
        print("Example: python promote_user.py admin@peanutiq.com admin")
    else:
        promote_user(sys.argv[1], sys.argv[2])
