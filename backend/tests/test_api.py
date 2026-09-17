from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.main import app

client = TestClient(app)


def test_normal_check_in_question():
    response = client.post("/api/chat", json={"message": "What time is check-in?", "conversation": []})

    assert response.status_code == 200
    body = response.json()
    assert "3:00 PM" in body["answer"]
    assert body["intent"] == "hotel_faq"
    assert body["sources"][0]["id"] == "hotel.check_in"


def test_pool_question():
    response = client.post("/api/chat", json={"message": "Is there a pool?", "conversation": []})

    assert response.status_code == 200
    assert "6:00 AM to 9:00 PM" in response.json()["answer"]
    assert response.json()["intent"] == "amenity"


def test_breakfast_question():
    response = client.post("/api/chat", json={"message": "Tell me about breakfast", "conversation": []})

    assert response.status_code == 200
    assert "7:00 AM to 10:30 AM" in response.json()["answer"]


def test_current_question_overrides_previous_amenity_context():
    response = client.post(
        "/api/chat",
        json={
            "message": "Breakfast",
            "conversation": [{"role": "user", "content": "Pool"}],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert "7:00 AM to 10:30 AM" in body["answer"]
    assert body["sources"][0]["id"] == "hotel.breakfast"


def test_room_suitability_question():
    response = client.post("/api/chat", json={"message": "Which room for 3 guests?", "conversation": []})

    assert response.status_code == 200
    assert "Deluxe Room" in response.json()["answer"]
    assert response.json()["intent"] == "room_info"


def test_room_images_question_does_not_return_raw_json():
    response = client.post("/api/chat", json={"message": "Room images", "conversation": []})

    assert response.status_code == 200
    body = response.json()
    assert body["intent"] == "room_info"
    assert "room images" in body["answer"].lower()
    assert '"rooms"' not in body["answer"]


def test_cancellation_policy_question():
    response = client.post("/api/chat", json={"message": "What is the cancellation policy?", "conversation": []})

    assert response.status_code == 200
    assert "24 hours before arrival" in response.json()["answer"]
    assert response.json()["intent"] == "policy"


def test_availability_happy_path():
    response = client.post(
        "/api/availability",
        json={"check_in": "2026-10-10", "check_out": "2026-10-12", "guests": 3},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["guests"] == 3
    assert {room["type"] for room in body["rooms"]} == {"Deluxe", "Family", "Suite"}


def test_availability_request_with_missing_info_asks_for_details():
    response = client.post("/api/chat", json={"message": "Do you have availability?", "conversation": []})

    assert response.status_code == 200
    body = response.json()
    assert body["intent"] == "availability_request"
    assert "check-in date, check-out date, and guest count" in body["answer"]


def test_invalid_date_range():
    response = client.post(
        "/api/availability",
        json={"check_in": "2026-10-12", "check_out": "2026-10-10", "guests": 2},
    )

    assert response.status_code == 422
    assert "check_in must be before check_out" in response.text


def test_unsupported_question_gets_fixed_fallback():
    response = client.post("/api/chat", json={"message": "Who won the cricket match?", "conversation": []})

    assert response.status_code == 200
    body = response.json()
    assert body["intent"] == "unsupported"
    assert body["sources"] == []
    assert "I don't have reliable information" in body["answer"]


def test_follow_up_question_uses_conversation_context():
    response = client.post(
        "/api/chat",
        json={
            "message": "What about check-out?",
            "conversation": [{"role": "user", "content": "What time is check-in?"}],
        },
    )

    assert response.status_code == 200
    assert response.json()["intent"] == "hotel_faq"
    assert "11:00 AM" in response.json()["answer"]


def test_llm_failure_graceful_fallback():
    app.dependency_overrides[get_settings] = lambda: Settings(llm_provider="fail")
    try:
        response = client.post("/api/chat", json={"message": "What time is check-in?", "conversation": []})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert "AI answer service is temporarily unavailable" in response.json()["answer"]


def test_chat_to_availability_integration_path():
    chat_response = client.post("/api/chat", json={"message": "Need a room for 3 guests", "conversation": []})
    availability_response = client.post(
        "/api/availability",
        json={"check_in": "2026-10-10", "check_out": "2026-10-12", "guests": 3},
    )

    assert chat_response.status_code == 200
    assert chat_response.json()["intent"] == "room_info"
    assert availability_response.status_code == 200
    assert any(room["available"] for room in availability_response.json()["rooms"])
