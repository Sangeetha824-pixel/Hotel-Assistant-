import CalendarDays from "lucide-react/dist/esm/icons/calendar-days.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import { FormEvent, useState } from "react";
import type { AvailabilityRequest } from "../types/api";

type Props = {
  disabled: boolean;
  onSearch: (payload: AvailabilityRequest) => void;
};

export function AvailabilityForm({ disabled, onSearch }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!checkIn || !checkOut) {
      setError("Please choose both dates.");
      return;
    }
    if (checkIn >= checkOut) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (guests <= 0) {
      setError("Guest count must be greater than zero.");
      return;
    }

    onSearch({ check_in: checkIn, check_out: checkOut, guests });
  }

  return (
    <form onSubmit={submit} className="w-full max-w-full rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111331]">
        <CalendarDays size={17} />
        Check room availability
      </div>
      <div className="grid gap-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
          Check-in
          <input
            type="date"
            value={checkIn}
            disabled={disabled}
            onChange={(event) => setCheckIn(event.target.value)}
            className="mt-1 block w-full max-w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-[#111331]"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
          Check-out
          <input
            type="date"
            value={checkOut}
            disabled={disabled}
            onChange={(event) => setCheckOut(event.target.value)}
            className="mt-1 block w-full max-w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-[#111331]"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
          Guests
          <input
            type="number"
            min={1}
            value={guests}
            disabled={disabled}
            onChange={(event) => setGuests(Number(event.target.value))}
            className="mt-1 block w-full max-w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-[#111331]"
          />
        </label>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#03042f] px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Search size={17} />
          Search
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </form>
  );
}
