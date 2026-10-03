from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.postgres import get_db
from app.core.rbac import require_roles
from app.core.roles import UserRole

from app.models.sql_models import Campaign, Post, SocialAccount, User


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)
# Frontend: Get admin dashboard statistics for overview screens.
@router.get("/dashboard")
def admin_dashboard(
    current_user=Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return {
        "message": "Dashboard data fetched successfully",
        "dashboard": {
            "total_users": db.query(User).count(),
            "total_posts": db.query(Post).count(),
            "total_campaigns": db.query(Campaign).count(),
            "connected_accounts": db.query(SocialAccount).count()
        }
    }