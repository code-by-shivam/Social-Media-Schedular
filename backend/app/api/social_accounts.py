from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.social import SocialAccountRequest
from app.core.security import get_current_user
from app.core.postgres import get_db
from app.models.sql_models import PlatformEnum, SocialAccount, User, UserStatusEnum

router = APIRouter(
    prefix="/social-accounts",
    tags=["Social Accounts"]
)


PLATFORM_MAP = {
    "facebook": PlatformEnum.FACEBOOK,
    "instagram": PlatformEnum.INSTAGRAM,
    "linkedin": PlatformEnum.LINKEDIN,
    "twitter": PlatformEnum.TWITTER,
    "x": PlatformEnum.TWITTER,
    "x(twitter)": PlatformEnum.TWITTER,
    "youtube": PlatformEnum.YOUTUBE,
    "pinterest": PlatformEnum.PINTEREST,
}


def _resolve_platform(platform: str) -> PlatformEnum:
    normalized_platform = platform.strip().lower()

    if normalized_platform in PLATFORM_MAP:
        return PLATFORM_MAP[normalized_platform]

    for enum_value in PlatformEnum:
        if normalized_platform == enum_value.value.lower():
            return enum_value

    raise HTTPException(
        status_code=400,
        detail="Unsupported platform"
    )


def _get_current_db_user(current_user, db: Session) -> User:
    db_user = db.query(User).filter(User.email == current_user["sub"]).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return db_user

# Frontend: Connect a new social account for the signed-in user.
@router.post("/connect")
def connect_account(
    account: SocialAccountRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = _get_current_db_user(current_user, db)
    platform_name = _resolve_platform(account.platform)

    new_account = SocialAccount(
        user_id=db_user.user_id,
        platform_name=platform_name,
        platform_user_id=account.username,
        username=account.username,
        access_token="pending_oauth_connection",
        refresh_token=None,
        status=UserStatusEnum.ACTIVE,
    )

    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return {
        "message": "Social account connected successfully",
        "account": {
            "id": new_account.social_account_id,
            "platform": new_account.platform_name.value,
            "username": new_account.username,
            "owner": current_user["sub"]
        }
    }

# Frontend: Fetch all connected social accounts for the current user.
@router.get("/")
def get_accounts(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = _get_current_db_user(current_user, db)

    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == db_user.user_id
    ).order_by(SocialAccount.social_account_id).all()

    return {
        "total_accounts": len(accounts),
        "accounts": [
            {
                "id": account.social_account_id,
                "platform": account.platform_name.value,
                "username": account.username,
                "owner": current_user["sub"]
            }
            for account in accounts
        ]
    }

# Frontend: Delete a connected social account by ID.
@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = _get_current_db_user(current_user, db)
    account = db.query(SocialAccount).filter(
        SocialAccount.social_account_id == account_id,
        SocialAccount.user_id == db_user.user_id
    ).first()

    if account:
        db.delete(account)
        db.commit()

        return {
            "message": "Social account deleted successfully"
        }

    raise HTTPException(
        status_code=404,
        detail="Account not found"
    )