from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

Intent = Literal[
    "hotel_faq",
    "room_info",
    "policy",
    "amenity",
    "availability_request",
    "follow_up",
    "unsupported",
]


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class Source(BaseModel):
    id: str
    title: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    conversation: list[ConversationMessage] = Field(default_factory=list, max_length=20)


class ChatResponse(BaseModel):
    answer: str
    intent: Intent
    sources: list[Source] = Field(default_factory=list)


class AvailabilityRequest(BaseModel):
    check_in: date
    check_out: date
    guests: int = Field(gt=0, le=12)

    @model_validator(mode="after")
    def validate_date_range(self) -> "AvailabilityRequest":
        if self.check_in >= self.check_out:
            raise ValueError("check_in must be before check_out")
        return self


class RoomAvailability(BaseModel):
    name: str
    type: str
    max_guests: int
    price_per_night: int
    available: bool
    features: list[str]
    description: str


class AvailabilityResponse(BaseModel):
    check_in: date
    check_out: date
    guests: int
    rooms: list[RoomAvailability]
    message: str
