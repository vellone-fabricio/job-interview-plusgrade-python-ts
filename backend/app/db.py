from pathlib import Path

from app.models import OfferRequest, Snapshot

SNAPSHOT = Snapshot.model_validate_json(
    (Path(__file__).parent.parent / "stays.json").read_text()
)
STAYS = {stay.reservation_id: stay for stay in SNAPSHOT.stays}
REQUESTS: dict[str, OfferRequest] = {}
