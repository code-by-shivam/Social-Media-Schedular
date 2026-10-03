from typing import Dict


class PinterestService:

    def publish_post(
        self,
        caption: str,
        media_url: str | None = None
    ) -> Dict:

        return {

            "success": True,

            "platform": "Pinterest",

            "platform_post_id": "PIN123456",

            "message": "Published Successfully"

        }