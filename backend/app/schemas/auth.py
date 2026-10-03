from pydantic import BaseModel, EmailStr
from app.core.roles import UserRole
from typing import Optional


# Register Request
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole


# Login Request
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# JWT Token Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# User Response
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True


# Update Profile Request
class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None


# Change Password Request
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# Notification Preferences Request
class NotificationPreferencesRequest(BaseModel):
    email_notification: Optional[bool] = None
    push_notification: Optional[bool] = None
    auto_sync: Optional[bool] = None