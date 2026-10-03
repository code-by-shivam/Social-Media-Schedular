from fastapi import Depends, HTTPException
from app.core.security import get_current_user

def require_roles(*roles):
    def checker(current_user=Depends(get_current_user)):
        allowed_roles = {
            role.value if hasattr(role, "value") else str(role)
            for role in roles
        }

        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access Denied"
            )
        return current_user
    return checker