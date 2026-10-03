from typing import Dict


class YouTubeService:

    def publish_post(
        self,
        caption: str,
        media_url: str | None = None
    ) -> Dict:

        return {

            "success": True,

            "platform": "YouTube",

            "platform_post_id": "YT123456",

            "message": "Published Successfully"

        }