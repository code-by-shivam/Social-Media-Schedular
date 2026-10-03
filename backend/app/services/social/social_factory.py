from app.models.sql_models import PlatformEnum
from app.services.social.facebook_service import FacebookService
from app.services.social.instagram_service import InstagramService
from app.services.social.linkedin_service import LinkedInService
from app.services.social.pinterest_service import PinterestService
from app.services.social.x_service import XService
from app.services.social.youtube_service import YouTubeService

class SocialFactory:

    @staticmethod
    def get_service(platform: PlatformEnum):

        if platform == PlatformEnum.FACEBOOK:
            return FacebookService()

        elif platform == PlatformEnum.INSTAGRAM:
            return InstagramService()

        elif platform == PlatformEnum.LINKEDIN:
            return LinkedInService()

        elif platform == PlatformEnum.PINTEREST:
            return PinterestService()

        elif platform == PlatformEnum.TWITTER:
            return XService()

        elif platform == PlatformEnum.YOUTUBE:
            return YouTubeService()

        raise ValueError(f"Unsupported platform: {platform}")