from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
)
from app.core.postgres import get_db
from app.models.sql_models import User, UserRoleEnum, UserStatusEnum
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.core.roles import UserRole


ROLE_TO_DB_ROLE = {
    UserRole.ADMIN: UserRoleEnum.ADMINISTRATOR,
    UserRole.BUSINESS_USER: UserRoleEnum.BUSINESS_USER,
    UserRole.MARKETING_TEAM: UserRoleEnum.MARKETING_TEAM,
    UserRole.CONTENT_CREATOR: UserRoleEnum.CONTENT_CREATOR,
}

DB_ROLE_TO_API_ROLE = {db_role: api_role for api_role, db_role in ROLE_TO_DB_ROLE.items()}


def _api_role_from_db_role(db_role: UserRoleEnum) -> str:
    return DB_ROLE_TO_API_ROLE[db_role].value


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Frontend: Register a new user account with role-based profile details.
@router.post("/register", status_code=201)
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = user.email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        full_name=user.name,
        email=normalized_email,
        password_hash=hashed_password,
        role=ROLE_TO_DB_ROLE[user.role],
        phone="",
        bio="",
        location="",
        timezone="UTC",
        status=UserStatusEnum.ACTIVE,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


# Frontend: Sign in with email and password and receive a JWT token.
@router.post("/login", response_model=TokenResponse)
def login(user: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = user.email.strip().lower()
    db_user = db.query(User).filter(User.email == normalized_email).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": _api_role_from_db_role(db_user.role)
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }