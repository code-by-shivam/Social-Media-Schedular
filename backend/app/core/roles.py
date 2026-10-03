from enum import Enum

class UserRole(str, Enum):
    ADMIN = "Admin"
    BUSINESS_USER = "Business User"
    MARKETING_TEAM = "Marketing Team"
    CONTENT_CREATOR = "Content Creator"