import type { VisualCard } from "../types/api";

const menuCards: Record<string, VisualCard[]> = {
  breakfast: [
    {
      title: "Continental Breakfast",
      subtitle: "Fresh fruit, pastries, eggs, toast, juice, tea, and coffee.",
      imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=700&q=80",
      meta: "7:00 AM - 10:30 AM",
    },
    {
      title: "South Indian Breakfast",
      subtitle: "Idli, dosa, pongal, sambar, chutneys, and filter coffee.",
      imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80",
      meta: "Included for select rooms",
    },
  ],
  lunch: [
    {
      title: "Coastal Lunch",
      subtitle: "Rice bowls, grilled fish, vegetables, salads, and fresh juices.",
      imageUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=700&q=80",
      meta: "12:30 PM - 3:00 PM",
    },
    {
      title: "Vegetarian Thali",
      subtitle: "Seasonal curries, dal, rice, roti, pickle, curd, and dessert.",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=700&q=80",
      meta: "Chef recommended",
    },
  ],
  snacks: [
    {
      title: "Evening Snacks",
      subtitle: "Sandwiches, fries, pakoras, cookies, tea, and coffee.",
      imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=700&q=80",
      meta: "4:00 PM - 6:00 PM",
    },
    {
      title: "Cafe Bites",
      subtitle: "Wraps, pastries, fruit bowls, smoothies, and iced coffee.",
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=80",
      meta: "Available at lounge",
    },
  ],
  dinner: [
    {
      title: "Seabreeze Dinner",
      subtitle: "Grills, pasta, biryani, soups, salads, and plated desserts.",
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=80",
      meta: "7:00 PM - 10:30 PM",
    },
    {
      title: "Room Service Dinner",
      subtitle: "Comfort meals, soups, breads, desserts, and beverages.",
      imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=700&q=80",
      meta: "Until 11:00 PM",
    },
  ],
};

const roomCards: VisualCard[] = [
  {
    title: "Standard Room",
    subtitle: "Queen bed, work desk, rain shower, and tea or coffee.",
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=700&q=80",
    meta: "Up to 2 guests",
  },
  {
    title: "Deluxe Room",
    subtitle: "King bed, sitting area, minibar, smart TV, and breakfast.",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=700&q=80",
    meta: "Up to 3 guests",
  },
  {
    title: "Family Room",
    subtitle: "Two queen beds, sofa, child-friendly amenities, and breakfast.",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=700&q=80",
    meta: "Up to 4 guests",
  },
  {
    title: "Harbor Suite",
    subtitle: "Separate living room, harbor view, bathtub, and espresso machine.",
    imageUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=700&q=80",
    meta: "Up to 4 guests",
  },
];

export function cardsForMessage(message: string): VisualCard[] {
  const text = message.toLowerCase();
  if (text.includes("room") || text.includes("suite") || text.includes("guest")) {
    return roomCards;
  }
  if (text.includes("breakfast")) {
    return menuCards.breakfast;
  }
  if (text.includes("lunch")) {
    return menuCards.lunch;
  }
  if (text.includes("snack")) {
    return menuCards.snacks;
  }
  if (text.includes("dinner")) {
    return menuCards.dinner;
  }
  if (text.includes("menu") || text.includes("food")) {
    return [...menuCards.breakfast, ...menuCards.lunch, ...menuCards.snacks, ...menuCards.dinner];
  }
  return [];
}
