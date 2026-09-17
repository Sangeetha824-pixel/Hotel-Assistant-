export type Intent =
  | "hotel_faq"
  | "room_info"
  | "policy"
  | "amenity"
  | "availability_request"
  | "follow_up"
  | "unsupported";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Source = {
  id: string;
  title: string;
};

export type ChatResponse = {
  answer: string;
  intent: Intent;
  sources: Source[];
};

export type AvailabilityRequest = {
  check_in: string;
  check_out: string;
  guests: number;
};

export type RoomAvailability = {
  name: string;
  type: string;
  max_guests: number;
  price_per_night: number;
  available: boolean;
  features: string[];
  description: string;
};

export type AvailabilityResponse = AvailabilityRequest & {
  rooms: RoomAvailability[];
  message: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  intent?: Intent;
  sources?: Source[];
  cards?: VisualCard[];
};

export type VisualCard = {
  title: string;
  subtitle: string;
  imageUrl: string;
  meta: string;
};
