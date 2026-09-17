import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left.js";
import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.js";
import XCircle from "lucide-react/dist/esm/icons/circle-x.js";
import { useState } from "react";
import type { AvailabilityResponse, RoomAvailability } from "../types/api";

type Props = {
  result: AvailabilityResponse;
};

const roomImages: Record<string, string> = {
  Standard: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  Deluxe: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
  Family: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  Suite: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
};

function imageFor(room: RoomAvailability) {
  return roomImages[room.type] ?? roomImages.Standard;
}

export function AvailabilityResults({ result }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<RoomAvailability | null>(null);

  if (selectedRoom) {
    return (
      <section className="w-full max-w-full overflow-hidden rounded-2xl bg-white shadow-sm">
        <img src={imageFor(selectedRoom)} alt={selectedRoom.name} className="h-56 w-full object-cover" />
        <div className="space-y-4 p-4">
          <button
            type="button"
            onClick={() => setSelectedRoom(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#03042f]"
          >
            <ArrowLeft size={16} />
            Back to rooms
          </button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[#111331]">{selectedRoom.name}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{selectedRoom.description}</p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                selectedRoom.available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {selectedRoom.available ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {selectedRoom.available ? "Available" : "Unavailable"}
            </span>
          </div>
          <div className="grid gap-3 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700 sm:grid-cols-2 lg:grid-cols-1">
            <p>
              <span className="block text-xs uppercase tracking-wide text-stone-500">Guests</span>
              Up to {selectedRoom.max_guests}
            </p>
            <p>
              <span className="block text-xs uppercase tracking-wide text-stone-500">Price</span>
              INR {selectedRoom.price_per_night.toLocaleString()} / night
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRoom.features.map((feature) => (
              <span key={feature} className="rounded-full bg-stone-100 px-3 py-2 text-xs text-stone-700">
                {feature}
              </span>
            ))}
          </div>
          <button
            type="button"
            disabled={!selectedRoom.available}
            className="h-12 w-full rounded-full bg-[#03042f] text-sm font-semibold text-white disabled:bg-stone-300 disabled:text-stone-500"
          >
            {selectedRoom.available ? "Continue with this room" : "Unavailable for these dates"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-full space-y-3">
      <p className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm font-medium text-[#111331] shadow-sm">
        {result.message}
      </p>
      <div className="grid w-full max-w-full gap-3 md:grid-cols-2 lg:grid-cols-1">
        {result.rooms.map((room) => (
          <article key={room.type} className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm">
            <img src={imageFor(room)} alt={room.name} className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#111331]">{room.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">{room.description}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    room.available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {room.available ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {room.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="mt-3 text-sm text-stone-700">
                <p>Up to {room.max_guests} guests</p>
                <p className="font-semibold">INR {room.price_per_night.toLocaleString()} / night</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {room.features.map((feature) => (
                  <span key={feature} className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-700">
                    {feature}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(room)}
                className="mt-4 h-11 w-full rounded-full border border-[#03042f] text-sm font-semibold text-[#03042f]"
              >
                View details
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
