from typing import Dict


class LinkedInService:

    def publish_post(
        self,
        caption: str,
        media_url: str | None = None
    ) -> Dict:

        return {

            "success": True,

            "platform": "LinkedIn",

            "platform_post_id": "LI123456",

            "message": "Published Successfully"

        }