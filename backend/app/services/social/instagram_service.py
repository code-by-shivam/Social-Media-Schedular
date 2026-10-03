from typing import Dict


class InstagramService:

    def publish_post(
        self,
        caption: str,
        media_url: str | None = None
    ) -> Dict:

        return {

            "success": True,

            "platform": "Instagram",

            "platform_post_id": "IG123456",

            "message": "Published Successfully"

        }