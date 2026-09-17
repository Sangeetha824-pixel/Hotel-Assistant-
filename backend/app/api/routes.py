import logging

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import Settings, get_settings
from app.models.schemas import AvailabilityRequest, AvailabilityResponse, ChatRequest, ChatResponse
from app.services.chat_service import handle_chat
from app.services.kb_service import KnowledgeBaseError
from app.tools.availability import AvailabilityError, check_availability

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, settings: Settings = Depends(get_settings)) -> ChatResponse:
    try:
        return await handle_chat(payload, settings)
    except KnowledgeBaseError as exc:
        logger.exception("Knowledge base failure")
        raise HTTPException(status_code=503, detail="Hotel information is temporarily unavailable.") from exc
    except Exception as exc:
        logger.exception("Unexpected chat failure")
        raise HTTPException(status_code=500, detail="Chat is temporarily unavailable. Please try again.") from exc


@router.post("/availability", response_model=AvailabilityResponse)
async def availability(payload: AvailabilityRequest) -> AvailabilityResponse:
    try:
        rooms, message = check_availability(payload.check_in, payload.check_out, payload.guests)
        return AvailabilityResponse(
            check_in=payload.check_in,
            check_out=payload.check_out,
            guests=payload.guests,
            rooms=rooms,
            message=message,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except (AvailabilityError, KnowledgeBaseError) as exc:
        logger.exception("Availability source failure")
        raise HTTPException(status_code=503, detail="Availability is temporarily unavailable.") from exc
    except Exception as exc:
        logger.exception("Unexpected availability failure")
        raise HTTPException(status_code=500, detail="Availability is temporarily unavailable. Please try again.") from exc
