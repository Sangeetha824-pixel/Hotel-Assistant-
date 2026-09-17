import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.models.schemas import Source

KB_PATH = Path(__file__).resolve().parents[1] / "data" / "hotel_kb.json"


class KnowledgeBaseError(RuntimeError):
    pass


@lru_cache
def load_kb() -> dict[str, Any]:
    try:
        return json.loads(KB_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        raise KnowledgeBaseError("Hotel knowledge base could not be loaded") from exc


def retrieve_section(intent: str, message: str, conversation_context: str = "") -> tuple[str, list[Source]]:
    kb = load_kb()
    current_text = message.lower()
    text = f"{message} {conversation_context}".lower()

    if intent == "room_info" or any(word in current_text for word in ["room", "suite", "guests", "bed"]):
        rooms = kb["rooms"]
        snippet = json.dumps({"rooms": rooms}, indent=2)
        return snippet, [Source(id="rooms", title="Room catalog")]

    if intent == "policy":
        policies = kb["policies"]
        if "cancel" in text:
            snippet = policies["cancellation"]
            source_id = "policies.cancellation"
            title = "Cancellation policy"
        elif "pet" in text:
            snippet = policies["pets"]
            source_id = "policies.pets"
            title = "Pet policy"
        elif "child" in text or "children" in text:
            snippet = policies["children"]
            source_id = "policies.children"
            title = "Children policy"
        else:
            snippet = json.dumps(policies, indent=2)
            source_id = "policies"
            title = "Hotel policies"
        return snippet, [Source(id=source_id, title=title)]

    amenity_map = {
        "breakfast": ("hotel.breakfast", "Breakfast information", kb["hotel"]["breakfast"]),
        "lunch": ("hotel.restaurant", "Lunch menu", kb["hotel"]["restaurant"]),
        "dinner": ("hotel.restaurant", "Dinner menu", kb["hotel"]["restaurant"]),
        "snack": ("hotel.restaurant", "Snacks menu", kb["hotel"]["restaurant"]),
        "menu": ("hotel.restaurant", "Dining menu", kb["hotel"]["restaurant"]),
        "pool": ("hotel.pool", "Pool information", kb["hotel"]["pool"]),
        "wifi": ("hotel.wifi", "Wi-Fi information", kb["hotel"]["wifi"]),
        "parking": ("hotel.parking", "Parking information", kb["hotel"]["parking"]),
        "gym": ("hotel.gym", "Fitness center information", kb["hotel"]["gym"]),
        "restaurant": ("hotel.restaurant", "Restaurant information", kb["hotel"]["restaurant"]),
    }
    for keyword, (source_id, title, snippet) in amenity_map.items():
        if keyword in current_text:
            return snippet, [Source(id=source_id, title=title)]

    if "check-out" in current_text or "checkout" in current_text or "check out" in current_text:
        return kb["hotel"]["check_out"], [Source(id="hotel.check_out", title="Check-out time")]
    if "check-in" in current_text or "checkin" in current_text or "check in" in current_text:
        return kb["hotel"]["check_in"], [Source(id="hotel.check_in", title="Check-in time")]

    hotel_summary = {
        "name": kb["hotel"]["name"],
        "address": kb["hotel"]["address"],
        "reception": kb["hotel"]["reception"],
    }
    return json.dumps(hotel_summary, indent=2), [Source(id="hotel.general", title="Hotel overview")]
