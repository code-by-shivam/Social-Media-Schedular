from typing import Dict


class XService:

    def publish_post(
        self,
        caption: str,
        media_url: str | None = None
    ) -> Dict:

        return {

            "success": True,

            "platform": "X",

            "platform_post_id": "X123456",

            "message": "Published Successfully"

        }