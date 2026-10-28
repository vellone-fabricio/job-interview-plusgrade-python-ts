from fastapi import APIRouter, HTTPException

from app.db import REQUESTS, SNAPSHOT, STAYS
from app.models import Offer, OfferRequest, RequestCreate, RequestedOffer, Stay, StayResponse

router = APIRouter(prefix="/stay", tags=["stays"])


def get_stay_or_404(reservation_id: str) -> Stay:
    stay = STAYS.get(reservation_id)
    if stay is None:
        raise HTTPException(status_code=404, detail="Stay not found")
    return stay


def bookable_offers(stay: Stay) -> list[Offer]:
    return [o for o in stay.offers if o.bookable_until >= SNAPSHOT.generated_at]


def offer_total(offer: Offer, nights: int) -> RequestedOffer:
    quantity = nights if offer.per == "night" else 1
    return RequestedOffer(**offer.model_dump(), total=offer.price * quantity)


@router.get("/{reservation_id}")
def get_stay(reservation_id: str) -> StayResponse:
    stay = get_stay_or_404(reservation_id)
    return StayResponse(
        **stay.model_dump(exclude={"offers"}),
        offers=bookable_offers(stay),
        generated_at=SNAPSHOT.generated_at,
        request=REQUESTS.get(reservation_id),
    )


@router.post("/{reservation_id}/request", status_code=201)
def create_request(reservation_id: str, body: RequestCreate) -> OfferRequest:
    stay = get_stay_or_404(reservation_id)
    if reservation_id in REQUESTS:
        raise HTTPException(status_code=409, detail="A request was already made for this stay")

    available = {o.id: o for o in bookable_offers(stay)}
    offer_ids = list(dict.fromkeys(body.offer_ids))
    unavailable = [offer_id for offer_id in offer_ids if offer_id not in available]
    if unavailable:
        raise HTTPException(
            status_code=422, detail=f"No longer available: {', '.join(unavailable)}"
        )

    offers = [offer_total(available[offer_id], stay.nights) for offer_id in offer_ids]
    if sum(o.kind == "upgrade" for o in offers) > 1:
        raise HTTPException(status_code=422, detail="Only one upgrade can be requested")

    REQUESTS[reservation_id] = OfferRequest(offers=offers, total=sum(o.total for o in offers))
    return REQUESTS[reservation_id]
