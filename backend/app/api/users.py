from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.schemas.auth import (
    ChangePasswordRequest,
    NotificationPreferencesRequest,
    UpdateProfileRequest,
)
from app.core.postgres import get_db
from app.models.sql_models import NotificationPreference, User
from app.core.rbac import require_roles
from app.core.roles import UserRole
from app.utils.hashing import hash_password, verify_password


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# Frontend: Get the currently logged-in user's profile details.
@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    email = current_user["sub"]

    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "user": {
            "id": db_user.user_id,
            "name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role.value,
            "phone": db_user.phone or "",
            "location": db_user.location or "",
            "bio": db_user.bio or ""
        }
    }


# Frontend: Update the current user's profile information.
@router.put("/me")
def update_profile(
    user_data: UpdateProfileRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    email = current_user["sub"]

    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user_data.name is not None:
        db_user.full_name = user_data.name

    if user_data.phone is not None:
        db_user.phone = user_data.phone

    if user_data.location is not None:
        db_user.location = user_data.location

    if user_data.bio is not None:
        db_user.bio = user_data.bio

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": db_user.user_id,
            "name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role.value,
            "phone": db_user.phone or "",
            "location": db_user.location or "",
            "bio": db_user.bio or ""
        }
    }


def get_current_db_user(current_user, db):
    db_user = (
        db.query(User)
        .filter(User.email == current_user["sub"])
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return db_user


# Get notification preferences.
@router.get("/me/preferences")
def get_preferences(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = get_current_db_user(current_user, db)

    preferences = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.user_id == db_user.user_id)
        .first()
    )

    if not preferences:
        preferences = NotificationPreference(
            user_id=db_user.user_id
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return {
        "preferences": {
            "email_notification": preferences.email_notification,
            "push_notification": preferences.push_notification,
            "auto_sync": preferences.auto_sync,
        }
    }


# Update notification preferences.
@router.put("/me/preferences")
def update_preferences(
    preference_data: NotificationPreferencesRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = get_current_db_user(current_user, db)

    preferences = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.user_id == db_user.user_id)
        .first()
    )

    if not preferences:
        preferences = NotificationPreference(
            user_id=db_user.user_id
        )
        db.add(preferences)

    if preference_data.email_notification is not None:
        preferences.email_notification = (
            preference_data.email_notification
        )

    if preference_data.push_notification is not None:
        preferences.push_notification = (
            preference_data.push_notification
        )

    if preference_data.auto_sync is not None:
        preferences.auto_sync = preference_data.auto_sync

    db.commit()
    db.refresh(preferences)

    return {
        "message": "Preferences updated successfully",
        "preferences": {
            "email_notification": preferences.email_notification,
            "push_notification": preferences.push_notification,
            "auto_sync": preferences.auto_sync,
        },
    }


# Change the current user's password.
@router.put("/me/password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = get_current_db_user(current_user, db)

    if not verify_password(
        password_data.current_password,
        db_user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters"
        )

    db_user.password_hash = hash_password(
        password_data.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully"
    }


# Get permissions based on the user's role.
@router.get("/me/permissions")
def get_permissions(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = get_current_db_user(current_user, db)

    permissions_by_role = {
        UserRole.ADMIN.value: [
            "Manage users",
            "Manage campaigns",
            "View analytics",
            "Manage connected accounts"
        ],
        UserRole.BUSINESS_USER.value: [
            "Manage campaigns",
            "View analytics",
            "Manage connected accounts"
        ],
        UserRole.MARKETING_TEAM.value: [
            "Manage campaigns",
            "Create and schedule posts",
            "View analytics"
        ],
        UserRole.CONTENT_CREATOR.value: [
            "Create and schedule posts",
            "Manage drafts"
        ],
    }

    return {
        "role": db_user.role.value,
        "permissions": permissions_by_role.get(
            db_user.role.value,
            []
        ),
    }


# Delete the current user's account.
@router.delete("/me")
def delete_my_account(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = get_current_db_user(current_user, db)

    db.delete(db_user)
    db.commit()

    return {
        "message": "Account and workspace data deleted successfully"
    }


# Frontend: List all users for admin management screens.
@router.get("/")
def get_all_users(
    current_user=Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    users = (
        db.query(User)
        .order_by(User.user_id)
        .all()
    )

    return {
        "total_users": len(users),
        "users": [
            {
                "id": user.user_id,
                "name": user.full_name,
                "email": user.email,
                "role": user.role.value
            }
            for user in users
        ]
    }


# Frontend: Remove a user account by email from the system.
@router.delete("/{email}")
def delete_user(
    email: str,
    current_user=Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    db_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    deleted_user = {
        "name": db_user.full_name,
        "email": db_user.email,
        "role": db_user.role.value
    }

    db.delete(db_user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "deleted_user": deleted_user
    }