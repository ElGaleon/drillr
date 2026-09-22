from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..auth import AuthenticatedUser, get_current_user
from ..database import get_db
from ..dependencies import require_player, require_team
from ..models import PlayerReview
from ..repositories.reviews import get_player_review, list_player_reviews, list_team_reviews
from ..schemas import ReviewCreate, ReviewOverviewRead, ReviewRead, ReviewUpdate

router = APIRouter(tags=["reviews"])


@router.get("/api/v1/reviews", response_model=list[ReviewOverviewRead])
def get_team_reviews(team_id: str = Query(min_length=1), player_id: str | None = Query(default=None), review_status: str | None = Query(default=None), visibility: str | None = Query(default=None), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_team(db, user, team_id)
    return [ReviewOverviewRead(**ReviewRead.model_validate(review).model_dump(), player_name=f"{player.first_name} {player.last_name}", player_role=player.primary_role) for review, player in list_team_reviews(db, user, team_id, player_id, review_status, visibility)]


@router.get("/api/v1/players/{player_id}/reviews", response_model=list[ReviewRead])
def get_reviews(player_id: str, team_id: str = Query(min_length=1), db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    return list_player_reviews(db, user, team_id, player_id)


@router.post("/api/v1/players/{player_id}/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(player_id: str, team_id: str = Query(min_length=1), payload: ReviewCreate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    review = PlayerReview(owner_user_id=user.user_id, team_id=team_id, player_id=player_id, **payload.model_dump())
    review.visibility = payload.visibility.value
    review.status = payload.status.value
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.patch("/api/v1/players/{player_id}/reviews/{review_id}", response_model=ReviewRead)
def update_review(player_id: str, review_id: str, team_id: str = Query(min_length=1), payload: ReviewUpdate = ..., db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user)):
    require_player(db, user, team_id, player_id)
    review = get_player_review(db, user, team_id, player_id, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, field, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(review)
    return review
