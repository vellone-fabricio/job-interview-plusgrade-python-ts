from fastapi import APIRouter, HTTPException

from app.db import SNAPSHOT, STAYS
from app.models import StayResponse

router = APIRouter(prefix="/stay", tags=["stays"])


@router.get("/{reservation_id}")
def get_stay(reservation_id: str) -> StayResponse:
    stay = STAYS.get(reservation_id)
    if stay is None:
        raise HTTPException(status_code=404, detail="Stay not found")
    bookable = [o for o in stay.offers if o.bookable_until >= SNAPSHOT.generated_at]
    return StayResponse(
        **stay.model_dump(exclude={"offers"}),
        offers=bookable,
        generated_at=SNAPSHOT.generated_at,
    )
