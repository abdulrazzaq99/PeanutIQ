from app.db.session import Base
from app.models.user import User
from app.models.otp import OTPToken
from app.models.upload import UserUpload
from app.models.knowledge import Article
from app.models.dashboard import Advisory, ActionItem, ActivityLog
from app.models.scan import ScanReport

# This is used by Alembic to discover all models
