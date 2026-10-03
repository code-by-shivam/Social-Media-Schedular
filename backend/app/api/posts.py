from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.postgres import get_db
from app.core.security import get_current_user
from app.services.queue_service import add_post_to_queue
from typing import Optional
from zoneinfo import ZoneInfo
from fastapi.responses import Response

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
)

from fastapi.responses import Response

from app.models.sql_models import (
    User,
    Post,
    SocialAccount,
    Campaign,
    PostStatusEnum,
    RecurringFrequencyEnum,
    RecurringPostRule,
    PublishingQueue,
)

from app.schemas.post import (
    UpdatePostRequest,
    CreateDraftRequest,
    ScheduleDraftRequest,
    CreateRecurringRequest,
    UpdateRecurringRequest,
    ToggleRecurringRequest,
)


router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)


def get_db_user(db: Session, current_user):
    user = (
        db.query(User)
        .filter(User.email == current_user["sub"])
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


def get_post_or_404(
    db: Session,
    user_id: int,
    post_id: int
):
    post = (
        db.query(Post)
        .filter(
            Post.post_id == post_id,
            Post.user_id == user_id
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    return post


# Frontend: Create and schedule a new post with optional image upload.
@router.post("/", status_code=201)
async def create_post(
    social_account_id: int = Form(...),
    campaign_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    caption: str = Form(...),
    scheduled_time: datetime = Form(...),
    image: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Validate scheduled time — use user's configured timezone, fall back to UTC
    try:
        user_tz = ZoneInfo(db_user.timezone or "UTC")
    except Exception:
        user_tz = ZoneInfo("UTC")

    if scheduled_time.tzinfo is None:
        scheduled_time = scheduled_time.replace(tzinfo=user_tz)

    if scheduled_time.astimezone(timezone.utc) <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Scheduled time must be in the future"
        )

    # Validate social account
    social = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.social_account_id == social_account_id,
            SocialAccount.user_id == db_user.user_id
        )
        .first()
    )

    if not social:
        raise HTTPException(
            status_code=404,
            detail="Social account not found"
        )

    # Validate campaign
    if campaign_id:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.campaign_id == campaign_id,
                Campaign.user_id == db_user.user_id
            )
            .first()
        )

        if not campaign:
            raise HTTPException(
                status_code=404,
                detail="Campaign not found"
            )

    # Process optional image attachment
    image_data = None
    image_name = None
    image_type = None

    if image:
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp"
        }

        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG and WEBP images are allowed"
            )

        image_data = await image.read()

        # Maximum image size = 5 MB
        max_size = 5 * 1024 * 1024

        if len(image_data) > max_size:
            raise HTTPException(
                status_code=400,
                detail="Image size must be less than 5 MB"
            )

        image_name = image.filename
        image_type = image.content_type

    # Create post
    new_post = Post(
        user_id=db_user.user_id,
        social_account_id=social_account_id,
        campaign_id=campaign_id,
        title=title,
        caption=caption,

        # Image stored in database
        image_data=image_data,
        image_name=image_name,
        image_type=image_type,

        scheduled_time=scheduled_time,
        status=PostStatusEnum.SCHEDULED
    )

    # Save post + queue
    try:
        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        # Add scheduled post to publishing queue
        add_post_to_queue(
            db=db,
            post=new_post,
            priority=1
        )

    except Exception as exc:
        db.rollback()

        print(f"Create post error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to create post"
        )

    # Response
    return {
        "message": "Post scheduled successfully",

        "post": {
            "post_id": new_post.post_id,
            "title": new_post.title,
            "caption": new_post.caption,

            "image_name": new_post.image_name,
            "image_type": new_post.image_type,
            "has_image": new_post.image_data is not None,

            "status": new_post.status.value,
            "scheduled_time": new_post.scheduled_time,

            "social_account_id": new_post.social_account_id,
            "campaign_id": new_post.campaign_id,

            "created_at": new_post.created_at
        }
    }


# Frontend: Get all posts belonging to the current user.
@router.get("/")
def get_posts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    posts = (
        db.query(Post)
        .filter(Post.user_id == db_user.user_id)
        .order_by(Post.created_at.desc())
        .all()
    )

    return {
        "total_posts": len(posts),
        "posts": [
            {
                "post_id": post.post_id,
                "title": post.title,
                "caption": post.caption,
                "image_name": post.image_name,
                "image_type": post.image_type,
                "has_image": post.image_data is not None,
                "status": post.status.value,
                "scheduled_time": post.scheduled_time,
                "published_time": post.published_time,
                "social_account_id": post.social_account_id,
                "campaign_id": post.campaign_id,
                "created_at": post.created_at,
                "updated_at": post.updated_at
            }
            for post in posts
        ]
    }


# Frontend: List all recurring post rules for the current user.
@router.get("/recurring")
def get_all_recurring_posts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Fetch all recurring rules for user's posts
    recurring_rules = (
        db.query(RecurringPostRule)
        .join(Post, Post.post_id == RecurringPostRule.post_id)
        .filter(Post.user_id == db_user.user_id)
        .order_by(RecurringPostRule.created_at.desc())
        .all()
    )

    return {
        "total_rules": len(recurring_rules),
        "rules": [
            {
                "rule_id": rule.rule_id,
                "post_id": rule.post_id,
                "frequency": rule.frequency,
                "cron_expression": rule.cron_expression,
                "start_date": rule.start_date,
                "end_date": rule.end_date,
                "is_active": rule.is_active,
                "created_at": rule.created_at,
                "updated_at": rule.updated_at
            }
            for rule in recurring_rules
        ]
    }


# Frontend: Retrieve all saved draft posts for the current user.
@router.get("/drafts")
def get_all_drafts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    drafts = (
        db.query(Post)
        .filter(
            Post.user_id == db_user.user_id,
            Post.status == PostStatusEnum.DRAFT
        )
        .order_by(Post.created_at.desc())
        .all()
    )

    return {
        "total_drafts": len(drafts),
        "drafts": [
            {
                "post_id": draft.post_id,
                "title": draft.title,
                "caption": draft.caption,
                "image_name": draft.image_name,
                "image_type": draft.image_type,
                "has_image": draft.image_data is not None,
                "status": draft.status.value,
                "social_account_id": draft.social_account_id,
                "campaign_id": draft.campaign_id,
                "created_at": draft.created_at,
                "updated_at": draft.updated_at
            }
            for draft in drafts
        ]
    }


# Frontend: Fetch one specific post by ID.
@router.get("/{post_id}")
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    post = get_post_or_404(
        db,
        db_user.user_id,
        post_id
    )

    return {
        "message": "Post fetched successfully",
        "post": {
            "post_id": post.post_id,
            "title": post.title,
            "caption": post.caption,
            "image_name": post.image_name,
            "image_type": post.image_type,
            "has_image": post.image_data is not None,
            "status": post.status.value,
            "scheduled_time": post.scheduled_time,
            "published_time": post.published_time,
            "social_account_id": post.social_account_id,
            "campaign_id": post.campaign_id,
            "created_at": post.created_at,
            "updated_at": post.updated_at
        }
    }


# Frontend: Update an existing post before it is published.
@router.put("/{post_id}")
async def update_post(
    post_id: int,

    social_account_id: Optional[int] = Form(None),
    campaign_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    scheduled_time: Optional[datetime] = Form(None),

    image: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    post = get_post_or_404(
        db,
        db_user.user_id,
        post_id
    )

    # Published post cannot be edited
    if post.status == PostStatusEnum.PUBLISHED:
        raise HTTPException(
            status_code=400,
            detail="Published posts cannot be updated"
        )

    # Scheduled time validation
    if scheduled_time is not None:
        if scheduled_time.tzinfo is None:
            scheduled_time = scheduled_time.replace(
                tzinfo=ZoneInfo("Asia/Kolkata")
            )

        if scheduled_time.astimezone(timezone.utc) <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=400,
                detail="Scheduled time must be in the future"
            )

    # Social account validation
    if social_account_id is not None:
        social = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.social_account_id == social_account_id,
                SocialAccount.user_id == db_user.user_id
            )
            .first()
        )

        if not social:
            raise HTTPException(
                status_code=404,
                detail="Social account not found"
            )

        post.social_account_id = social_account_id

    # Campaign validation
    if campaign_id is not None:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.campaign_id == campaign_id,
                Campaign.user_id == db_user.user_id
            )
            .first()
        )

        if not campaign:
            raise HTTPException(
                status_code=404,
                detail="Campaign not found"
            )

        post.campaign_id = campaign_id

    # Update text fields
    if title is not None:
        post.title = title

    if caption is not None:
        post.caption = caption

    if scheduled_time is not None:
        post.scheduled_time = scheduled_time

    # Update image
    if image is not None:
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp"
        }

        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG and WEBP images are allowed"
            )

        image_data = await image.read()

        max_size = 5 * 1024 * 1024

        if len(image_data) > max_size:
            raise HTTPException(
                status_code=400,
                detail="Image size must be less than 5 MB"
            )

        post.image_data = image_data
        post.image_name = image.filename
        post.image_type = image.content_type

    # Save
    try:
        db.commit()
        db.refresh(post)

    except Exception as exc:
        db.rollback()

        print(f"Update post error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to update post"
        )

    # Response
    return {
        "message": "Post updated successfully",

        "post": {
            "post_id": post.post_id,
            "social_account_id": post.social_account_id,
            "campaign_id": post.campaign_id,

            "title": post.title,
            "caption": post.caption,

            "image_name": post.image_name,
            "image_type": post.image_type,
            "has_image": post.image_data is not None,

            "status": post.status.value,

            "scheduled_time": post.scheduled_time,
            "published_time": post.published_time,

            "created_at": post.created_at,
            "updated_at": post.updated_at
        }
    }


# Frontend: Delete a post that is not yet published.
@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Get post
    post = get_post_or_404(
        db,
        db_user.user_id,
        post_id
    )

    # Published posts cannot be deleted
    if post.status == PostStatusEnum.PUBLISHED:
        raise HTTPException(
            status_code=400,
            detail="Published posts cannot be deleted"
        )

    try:
        db.delete(post)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete post"
        )

    return {
        "message": "Post deleted successfully",
        "deleted_post": {
            "post_id": post.post_id,
            "title": post.title,
            "status": post.status.value
        }
    }


# Frontend: Save a new draft post with optional image content.
@router.post("/draft", status_code=201)
async def create_draft(
    social_account_id: int = Form(...),
    campaign_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    # Validate social account
    social = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.social_account_id == social_account_id,
            SocialAccount.user_id == db_user.user_id
        )
        .first()
    )

    if not social:
        raise HTTPException(
            status_code=404,
            detail="Social account not found"
        )

    # Validate campaign
    if campaign_id is not None:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.campaign_id == campaign_id,
                Campaign.user_id == db_user.user_id
            )
            .first()
        )

        if not campaign:
            raise HTTPException(
                status_code=404,
                detail="Campaign not found"
            )

    # Process image
    image_data = None
    image_name = None
    image_type = None

    if image is not None:
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp"
        }

        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG and WEBP images are allowed"
            )

        image_data = await image.read()

        if len(image_data) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image size must be less than 5 MB"
            )

        image_name = image.filename
        image_type = image.content_type

    # Create draft
    draft = Post(
        user_id=db_user.user_id,
        social_account_id=social_account_id,
        campaign_id=campaign_id,
        title=title,
        caption=caption,

        image_data=image_data,
        image_name=image_name,
        image_type=image_type,

        scheduled_time=None,
        status=PostStatusEnum.DRAFT
    )

    try:
        db.add(draft)
        db.commit()
        db.refresh(draft)

    except Exception as exc:
        db.rollback()

        print(f"Create draft error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to create draft"
        )

    return {
        "message": "Draft saved successfully",
        "draft": {
            "post_id": draft.post_id,
            "title": draft.title,
            "caption": draft.caption,

            "image_name": draft.image_name,
            "image_type": draft.image_type,
            "has_image": draft.image_data is not None,

            "status": draft.status.value,
            "social_account_id": draft.social_account_id,
            "campaign_id": draft.campaign_id,
            "created_at": draft.created_at
        }
    }


# Frontend: Fetch one draft post by ID.
@router.get("/drafts/{draft_id}")
def get_single_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    draft = (
        db.query(Post)
        .filter(
            Post.post_id == draft_id,
            Post.user_id == db_user.user_id,
            Post.status == PostStatusEnum.DRAFT
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Draft not found"
        )

    return {
        "message": "Draft fetched successfully",

        "draft": {
            "post_id": draft.post_id,

            "title": draft.title,
            "caption": draft.caption,

            "image_name": draft.image_name,
            "image_type": draft.image_type,
            "has_image": draft.image_data is not None,

            "status": draft.status.value,

            "social_account_id": draft.social_account_id,
            "campaign_id": draft.campaign_id,

            "created_at": draft.created_at,
            "updated_at": draft.updated_at
        }
    }


# Frontend: Update an existing draft post.
@router.put("/drafts/{draft_id}")
async def update_draft(
    draft_id: int,

    social_account_id: Optional[int] = Form(None),
    campaign_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Find draft
    draft = (
        db.query(Post)
        .filter(
            Post.post_id == draft_id,
            Post.user_id == db_user.user_id,
            Post.status == PostStatusEnum.DRAFT
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Draft not found"
        )

    # Validate social account
    if social_account_id is not None:
        social = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.social_account_id == social_account_id,
                SocialAccount.user_id == db_user.user_id
            )
            .first()
        )

        if not social:
            raise HTTPException(
                status_code=404,
                detail="Social account not found"
            )

        draft.social_account_id = social_account_id

    # Validate campaign
    if campaign_id is not None:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.campaign_id == campaign_id,
                Campaign.user_id == db_user.user_id
            )
            .first()
        )

        if not campaign:
            raise HTTPException(
                status_code=404,
                detail="Campaign not found"
            )

        draft.campaign_id = campaign_id

    # Update text fields
    if title is not None:
        draft.title = title

    if caption is not None:
        draft.caption = caption

    # Update image
    if image is not None:
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp"
        }

        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG and WEBP images are allowed"
            )

        image_data = await image.read()

        if len(image_data) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image size must be less than 5 MB"
            )

        draft.image_data = image_data
        draft.image_name = image.filename
        draft.image_type = image.content_type

    # Save changes
    try:
        db.commit()
        db.refresh(draft)

    except Exception as exc:
        db.rollback()

        print(f"Update draft error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to update draft"
        )

    # Return updated draft
    return {
        "message": "Draft updated successfully",

        "draft": {
            "post_id": draft.post_id,
            "title": draft.title,
            "caption": draft.caption,

            "image_name": draft.image_name,
            "image_type": draft.image_type,
            "has_image": draft.image_data is not None,

            "status": draft.status.value,
            "social_account_id": draft.social_account_id,
            "campaign_id": draft.campaign_id,

            "updated_at": draft.updated_at
        }
    }


# Frontend: Delete a draft post.
@router.delete("/drafts/{draft_id}")
def delete_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    draft = (
        db.query(Post)
        .filter(
            Post.post_id == draft_id,
            Post.user_id == db_user.user_id,
            Post.status == PostStatusEnum.DRAFT
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Draft not found"
        )

    try:
        db.delete(draft)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete draft"
        )

    return {
        "message": "Draft deleted successfully",
        "deleted_draft": {
            "post_id": draft.post_id,
            "title": draft.title,
            "status": draft.status.value
        }
    }


# Frontend: Schedule a draft post for future publishing.
@router.post("/drafts/{draft_id}/schedule")
def schedule_draft(
    draft_id: int,
    request: ScheduleDraftRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    draft = (
        db.query(Post)
        .filter(
            Post.post_id == draft_id,
            Post.user_id == db_user.user_id,
            Post.status == PostStatusEnum.DRAFT
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Draft not found"
        )

    # Validate scheduled time
    if request.scheduled_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Scheduled time must be in the future"
        )

    try:
        # Update post
        draft.scheduled_time = request.scheduled_time
        draft.status = PostStatusEnum.SCHEDULED

        # Check whether queue item already exists
        existing_queue = (
            db.query(PublishingQueue)
            .filter(
                PublishingQueue.post_id == draft.post_id,
                PublishingQueue.status == "QUEUED"
            )
            .first()
        )

        # Add to publishing queue if not already queued
        if not existing_queue:
            queue_item = PublishingQueue(
                post_id=draft.post_id,
                priority=1,
                attempts=0,
                scheduled_at=request.scheduled_time,
                status="QUEUED"
            )

            db.add(queue_item)

        db.commit()
        db.refresh(draft)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to schedule draft"
        )

    return {
        "message": "Draft scheduled successfully",
        "post": {
            "post_id": draft.post_id,
            "title": draft.title,
            "caption": draft.caption,
            "status": draft.status.value,
            "scheduled_time": draft.scheduled_time
        }
    }


# Frontend: Create a recurring posting rule for an existing post.
@router.post("/{post_id}/recurring", status_code=201)
def create_recurring_post(
    post_id: int,
    request: CreateRecurringRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Check whether post exists and belongs to current user
    post = (
        db.query(Post)
        .filter(
            Post.post_id == post_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    # Only Draft or Scheduled posts can have recurring rules
    if post.status not in [
        PostStatusEnum.DRAFT,
        PostStatusEnum.SCHEDULED
    ]:
        raise HTTPException(
            status_code=400,
            detail="Recurring rule can only be created for Draft or Scheduled posts"
        )

    # Validate dates
    if request.end_date:
        if request.end_date <= request.start_date:
            raise HTTPException(
                status_code=400,
                detail="End date must be greater than start date"
            )

    # Check duplicate recurring rule
    existing_rule = (
        db.query(RecurringPostRule)
        .filter(
            RecurringPostRule.post_id == post.post_id
        )
        .first()
    )

    if existing_rule:
        raise HTTPException(
            status_code=400,
            detail="Recurring rule already exists for this post"
        )

    # Create recurring rule
    recurring_rule = RecurringPostRule(
        post_id=post.post_id,
        frequency=request.frequency,
        cron_expression=request.cron_expression,
        start_date=request.start_date,
        end_date=request.end_date,
        is_active=True
    )

    try:
        db.add(recurring_rule)
        db.commit()
        db.refresh(recurring_rule)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to create recurring rule"
        )

    return {
        "message": "Recurring rule created successfully",
        "rule": {
            "rule_id": recurring_rule.rule_id,
            "post_id": recurring_rule.post_id,
            "frequency": recurring_rule.frequency,
            "cron_expression": recurring_rule.cron_expression,
            "start_date": recurring_rule.start_date,
            "end_date": recurring_rule.end_date,
            "is_active": recurring_rule.is_active,
            "created_at": recurring_rule.created_at
        }
    }


# Frontend: Fetch one recurring posting rule by ID.
@router.get("/recurring/{rule_id}")
def get_recurring_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Fetch recurring rule
    rule = (
        db.query(RecurringPostRule)
        .join(Post, Post.post_id == RecurringPostRule.post_id)
        .filter(
            RecurringPostRule.rule_id == rule_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not rule:
        raise HTTPException(
            status_code=404,
            detail="Recurring rule not found"
        )

    # Return recurring rule
    return {
        "message": "Recurring rule fetched successfully",
        "rule": {
            "rule_id": rule.rule_id,
            "post_id": rule.post_id,
            "frequency": rule.frequency,
            "cron_expression": rule.cron_expression,
            "start_date": rule.start_date,
            "end_date": rule.end_date,
            "is_active": rule.is_active,
            "created_at": rule.created_at,
            "updated_at": rule.updated_at
        }
    }


# Frontend: Update a recurring posting rule.
@router.put("/recurring/{rule_id}")
def update_recurring_rule(
    rule_id: int,
    request: UpdateRecurringRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get logged-in user
    db_user = get_db_user(db, current_user)

    # Find recurring rule
    rule = (
        db.query(RecurringPostRule)
        .join(Post, Post.post_id == RecurringPostRule.post_id)
        .filter(
            RecurringPostRule.rule_id == rule_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not rule:
        raise HTTPException(
            status_code=404,
            detail="Recurring rule not found"
        )

    # Validate dates
    start_date = (
        request.start_date
        if request.start_date
        else rule.start_date
    )

    end_date = (
        request.end_date
        if request.end_date
        else rule.end_date
    )

    if end_date and end_date <= start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be greater than start date"
        )

    # Update only provided fields
    update_data = request.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(rule, key, value)

    try:
        db.commit()
        db.refresh(rule)

    except Exception as exc:
        db.rollback()

        print(f"Update recurring rule error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to update recurring rule"
        )

    # Return updated recurring rule
    return {
        "message": "Recurring rule updated successfully",
        "rule": {
            "rule_id": rule.rule_id,
            "post_id": rule.post_id,
            "frequency": rule.frequency,
            "cron_expression": rule.cron_expression,
            "start_date": rule.start_date,
            "end_date": rule.end_date,
            "is_active": rule.is_active,
            "updated_at": rule.updated_at
        }
    }


# Frontend: Delete a recurring posting rule.
@router.delete("/recurring/{rule_id}")
def delete_recurring_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    # Find recurring rule
    rule = (
        db.query(RecurringPostRule)
        .join(Post, Post.post_id == RecurringPostRule.post_id)
        .filter(
            RecurringPostRule.rule_id == rule_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not rule:
        raise HTTPException(
            status_code=404,
            detail="Recurring rule not found"
        )

    # Save response data before deleting
    deleted_rule_id = rule.rule_id
    deleted_post_id = rule.post_id
    deleted_frequency = rule.frequency

    try:
        db.delete(rule)
        db.commit()

    except Exception as exc:
        db.rollback()

        print(f"Delete recurring rule error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to delete recurring rule"
        )

    return {
        "message": "Recurring rule deleted successfully",
        "deleted_rule": {
            "rule_id": deleted_rule_id,
            "post_id": deleted_post_id,
            "frequency": deleted_frequency
        }
    }


# Frontend: Enable or disable a recurring posting rule.
@router.patch("/recurring/{rule_id}/toggle")
def toggle_recurring_rule(
    rule_id: int,
    request: ToggleRecurringRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    # Find recurring rule
    rule = (
        db.query(RecurringPostRule)
        .join(Post, Post.post_id == RecurringPostRule.post_id)
        .filter(
            RecurringPostRule.rule_id == rule_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not rule:
        raise HTTPException(
            status_code=404,
            detail="Recurring rule not found"
        )

    # Update active status
    rule.is_active = request.is_active

    try:
        db.commit()
        db.refresh(rule)

    except Exception as exc:
        db.rollback()

        print(f"Toggle recurring rule error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to toggle recurring rule"
        )

    return {
        "message": "Recurring rule status updated successfully",
        "rule": {
            "rule_id": rule.rule_id,
            "post_id": rule.post_id,
            "frequency": rule.frequency,
            "is_active": rule.is_active,
            "updated_at": rule.updated_at
        }
    }


# Frontend: Download the image attached to a post.
@router.get("/{post_id}/image")
def get_post_image(
    post_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_user = get_db_user(db, current_user)

    post = (
        db.query(Post)
        .filter(
            Post.post_id == post_id,
            Post.user_id == db_user.user_id
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    if not post.image_data:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return Response(
        content=post.image_data,
        media_type=post.image_type
    )