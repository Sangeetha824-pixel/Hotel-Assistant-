import logging
import json

from app.core.config import Settings

logger = logging.getLogger(__name__)


class LLMError(RuntimeError):
    pass


class LLMService:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def answer_from_snippet(self, question: str, snippet: str) -> str:
        if self.settings.llm_provider == "fail":
            raise LLMError("Configured LLM failure")

        # Mock provider used for local development and tests. A real provider can
        # replace this branch without changing API routing or business logic.
        return self._mock_grounded_answer(question, snippet)

    async def render_availability(self, message: str) -> str:
        if self.settings.llm_provider == "fail":
            raise LLMError("Configured LLM failure")
        return message

    def _mock_grounded_answer(self, question: str, snippet: str) -> str:
        q = question.lower()
        if '"rooms"' in snippet:
            try:
                rooms = json.loads(snippet)["rooms"]
            except (json.JSONDecodeError, KeyError, TypeError):
                rooms = []
            if rooms:
                room_names = ", ".join(room["name"] for room in rooms)
                if "image" in q or "photo" in q or "picture" in q:
                    return f"Here are the room images and details for {room_names}. You can compare capacity, amenities, and starting prices in the cards below."
                return (
                    f"We have {room_names}. Standard is best for up to 2 guests, Deluxe for up to 3 guests, "
                    "and Family Room or Harbor Suite for up to 4 guests. The cards below show room photos and key details."
                )
        if "3" in q and "guest" in q and "deluxe" in snippet.lower():
            return "For 3 guests, the Deluxe Room can fit up to 3 guests, while the Family Room and Harbor Suite can fit up to 4 guests."
        if "lunch" in q:
            return "Lunch is served at Seabreeze Restaurant from 12:30 PM to 3:00 PM. I’ve included lunch menu options below."
        if "dinner" in q:
            return "Dinner is served at Seabreeze Restaurant from 7:00 PM to 10:30 PM. Room service is available until 11:00 PM."
        if "snack" in q:
            return "Snacks are available from 4:00 PM to 6:00 PM, with cafe bites and evening snacks shown below."
        if "menu" in q or "food" in q:
            return "Here are the breakfast, lunch, snacks, and dinner options available at the hotel."
        if "breakfast" in q:
            return snippet
        if "pool" in q:
            return snippet
        if "cancel" in q:
            return snippet
        if "check-out" in q or "checkout" in q or "check out" in q:
            return snippet
        if "check-in" in q or "checkin" in q or "check in" in q:
            return snippet
        return snippet
