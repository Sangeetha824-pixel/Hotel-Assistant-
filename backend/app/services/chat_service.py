import logging

from app.core.config import Settings
from app.models.schemas import ChatRequest, ChatResponse
from app.services.intent_service import classify_intent
from app.services.kb_service import retrieve_section
from app.services.llm_service import LLMError, LLMService

logger = logging.getLogger(__name__)

FALLBACK = "I'm sorry, I don't have reliable information about that. I can help with hotel rooms, amenities, policies, and availability."
AVAILABILITY_MISSING = "I can check availability for you. Please provide a check-in date, check-out date, and guest count."


async def handle_chat(payload: ChatRequest, settings: Settings) -> ChatResponse:
    intent = classify_intent(payload.message, payload.conversation)

    if intent == "unsupported":
        return ChatResponse(answer=FALLBACK, intent=intent, sources=[])

    if intent == "availability_request":
        return ChatResponse(answer=AVAILABILITY_MISSING, intent=intent, sources=[])

    context = " ".join(item.content for item in payload.conversation[-4:])
    snippet, sources = retrieve_section(intent, payload.message, context)

    try:
        answer = await LLMService(settings).answer_from_snippet(payload.message, snippet)
    except LLMError:
        logger.exception("LLM call failed")
        answer = "I found the relevant hotel information, but the AI answer service is temporarily unavailable. Please try again."

    return ChatResponse(answer=answer, intent=intent, sources=sources)
