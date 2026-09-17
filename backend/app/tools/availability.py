import json
from functools import lru_cache
from pathlib import Path

from app.models.schemas import RoomAvailability
from app.services.kb_service import load_kb

INVENTORY_PATH = Path(__file__).resolve().parents[1] / "data" / "inventory.json"


class AvailabilityError(RuntimeError):
    pass


@lru_cache
def load_inventory() -> list[dict]:
    try:
        return json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        raise AvailabilityError("Inventory could not be loaded") from exc


def check_availability(check_in, check_out, guests: int) -> tuple[list[RoomAvailability], str]:
    if check_in >= check_out:
        raise ValueError("check_in must be before check_out")
    if guests <= 0:
        raise ValueError("guests must be greater than zero")

    kb = load_kb()
    inventory_by_type = {item["room_type"]: item["available"] for item in load_inventory()}
    rooms: list[RoomAvailability] = []

    for room in kb["rooms"]:
        if room["max_guests"] < guests:
            continue
        available = bool(inventory_by_type.get(room["type"], False))
        rooms.append(
            RoomAvailability(
                name=room["name"],
                type=room["type"],
                max_guests=room["max_guests"],
                price_per_night=room["price"],
                available=available,
                features=room["amenities"],
                description=room["description"],
            )
        )

    suitable_available = [room for room in rooms if room.available]
    if suitable_available:
        message = f"{len(suitable_available)} suitable room option(s) are available for {guests} guest(s)."
    elif rooms:
        message = "There are suitable room types for your guest count, but they are not available for those dates."
    else:
        message = "No suitable rooms are available for that guest count."
    return rooms, message
