import type { VisualCard } from "../types/api";

type Props = {
  cards: VisualCard[];
};

export function VisualCards({ cards }: Props) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid w-full max-w-full gap-3 pb-2 sm:ml-11 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.title} className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-white shadow-sm">
          <img src={card.imageUrl} alt={card.title} className="h-40 w-full object-cover sm:h-36" />
          <div className="p-4">
            <h3 className="text-lg font-semibold text-[#111331]">{card.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{card.subtitle}</p>
            <p className="mt-3 text-sm font-medium text-emerald-700">{card.meta}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
