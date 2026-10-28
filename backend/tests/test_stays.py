from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.db import REQUESTS, SNAPSHOT, STAYS
from app.routes import bookable_offers
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_requests():
    REQUESTS.clear()
    yield
    REQUESTS.clear()


def offer_ids(reservation_id: str) -> list[str]:
    return [o["id"] for o in client.get(f"/stay/{reservation_id}").json()["offers"]]


def request_offers(reservation_id: str, *ids: str):
    return client.post(f"/stay/{reservation_id}/request", json={"offer_ids": list(ids)})


@pytest.mark.parametrize(
    ("reservation_id", "expired_id"),
    [("LIS-1042", "L4"), ("TYO-2290", "T2"), ("LAX-0388", "A5")],
)
def test_expired_offers_are_not_returned(reservation_id, expired_id):
    ids = offer_ids(reservation_id)
    assert expired_id not in ids
    assert len(ids) == 4


def test_offer_bookable_until_generated_at_is_still_returned():
    stay = STAYS["LIS-1042"]
    offer = stay.offers[0].model_copy(update={"bookable_until": SNAPSHOT.generated_at})
    stay = stay.model_copy(update={"offers": [offer]})
    assert [o.id for o in bookable_offers(stay)] == [offer.id]


def test_unknown_stay_returns_404():
    assert client.get("/stay/NOPE").status_code == 404
    assert request_offers("NOPE", "L1").status_code == 404


def test_totals_multiply_per_night_offers_by_nights():
    offers = {o["id"]: o for o in client.get("/stay/LAX-0388").json()["offers"]}
    assert Decimal(offers["A2"]["total"]) == 95 * 4  # per night, 4 nights
    assert Decimal(offers["A3"]["total"]) == 85  # per stay


def test_request_sums_offer_totals():
    response = request_offers("LAX-0388", "A1", "A4")
    assert response.status_code == 201
    assert Decimal(response.json()["total"]) == 40 * 4 + 45 * 4


def test_two_upgrades_cannot_be_requested():
    response = request_offers("LIS-1042", "L1", "L2")
    assert response.status_code == 422
    assert "LIS-1042" not in REQUESTS


def test_one_upgrade_with_extras_can_be_requested():
    assert request_offers("LIS-1042", "L1", "L3", "L5").status_code == 201


def test_expired_offer_cannot_be_requested():
    response = request_offers("TYO-2290", "T2")
    assert response.status_code == 422
    assert "T2" in response.json()["detail"]


def test_duplicate_offer_ids_are_counted_once():
    response = request_offers("LIS-1042", "L3", "L3")
    assert response.status_code == 201
    assert [o["id"] for o in response.json()["offers"]] == ["L3"]


def test_stay_accepts_only_one_request():
    assert request_offers("LIS-1042", "L3").status_code == 201
    assert request_offers("LIS-1042", "L5").status_code == 409
