from datetime import date

import pytest

from app.tools.availability import check_availability


def test_check_availability_filters_capacity_and_marks_status():
    rooms, message = check_availability(date(2026, 10, 10), date(2026, 10, 12), 3)

    assert "suitable" in message
    assert {room.type for room in rooms} == {"Deluxe", "Family", "Suite"}
    assert next(room for room in rooms if room.type == "Deluxe").available is True
    assert next(room for room in rooms if room.type == "Family").available is False


def test_check_availability_rejects_invalid_range():
    with pytest.raises(ValueError, match="check_in must be before check_out"):
        check_availability(date(2026, 10, 12), date(2026, 10, 10), 2)


def test_check_availability_no_suitable_rooms():
    rooms, message = check_availability(date(2026, 10, 10), date(2026, 10, 12), 8)

    assert rooms == []
    assert message == "No suitable rooms are available for that guest count."
