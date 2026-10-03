from pydantic import BaseModel

class SocialAccountRequest(BaseModel):
    platform: str
    username: str


class SocialAccountResponse(BaseModel):
    id: int
    platform: str
    username: str
    owner: str