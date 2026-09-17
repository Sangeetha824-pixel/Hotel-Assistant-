from app.models.schemas import ConversationMessage, Intent


def classify_intent(message: str, conversation: list[ConversationMessage]) -> Intent:
    text = message.lower()
    previous_user = " ".join(item.content.lower() for item in conversation[-4:] if item.role == "user")

    availability_words = ["available", "availability", "book", "reserve", "vacancy", "stay"]
    if "availability" in text or any(word in text for word in availability_words) and any(
        word in text for word in ["date", "night", "guest", "room", "from", "to", "check"]
    ):
        return "availability_request"

    if any(phrase in text for phrase in ["room for", "rooms for", "fit", "suitable", "guest"]):
        return "room_info"

    if any(word in text for word in ["room", "suite", "standard", "deluxe", "family", "bed"]):
        return "room_info"

    if any(word in text for word in ["cancel", "policy", "pet", "children", "child", "extra guest"]):
        return "policy"

    if any(word in text for word in ["pool", "breakfast", "lunch", "dinner", "snack", "menu", "wifi", "wi-fi", "parking", "gym", "restaurant"]):
        return "amenity"

    if any(word in text for word in ["check-in", "checkin", "check in", "check-out", "checkout", "check out", "address", "reception"]):
        return "hotel_faq"

    if len(text.split()) <= 6 and any(word in previous_user for word in ["check-in", "checkin", "check in"]):
        if "check-out" in text or "checkout" in text or "check out" in text:
            return "follow_up"

    if len(text.split()) <= 7 and any(word in text for word in ["what about", "and", "also", "that"]):
        return "follow_up"

    return "unsupported"
