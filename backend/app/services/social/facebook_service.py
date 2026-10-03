from typing import Dict


class FacebookService:

    def publish_post(
        self,
        caption: str,
        media_url: str | None = None
    ) -> Dict:

        """
        Publish post to Facebook.

        Currently Dummy Response.

        Later replace with Meta Graph API.
        """

        return {

            "success": True,

            "platform": "Facebook",

            "platform_post_id": "FB123456",

            "message": "Published Successfully"

        }


    def upload_image(
        self,
        image_path: str
    ) -> Dict:

        return {

            "success": True,

            "image_id": "IMG123"

        }


    def upload_video(
        self,
        video_path: str
    ) -> Dict:

        return {

            "success": True,

            "video_id": "VID123"

        }