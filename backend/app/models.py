from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import AwareDatetime, BaseModel, Field


class Hotel(BaseModel):
    name: str
    currency: str = Field(min_length=3, max_length=3)


class Offer(BaseModel):
    id: str
    kind: Literal["upgrade", "extra"]
    name: str
    description: str
    price: Decimal = Field(ge=0)
    per: Literal["night", "stay"]
    bookable_until: AwareDatetime


class Stay(BaseModel):
    reservation_id: str
    guest_first_name: str
    hotel: Hotel
    arrival_date: date
    nights: int = Field(ge=1)
    booked_room: str
    offers: list[Offer]


class StayResponse(Stay):
    generated_at: AwareDatetime


class Snapshot(BaseModel):
    generated_at: AwareDatetime
    stays: list[Stay]
