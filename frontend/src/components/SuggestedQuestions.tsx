import { memo } from "react";

type Props = {
  disabled: boolean;
  onSelect: (question: string) => void;
};

const questions = ["Breakfast menu", "Lunch menu", "Snacks", "Dinner menu", "Room images", "Cancellation policy"];

function SuggestedQuestionsComponent({ disabled, onSelect }: Props) {
  return (
    <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-1">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="shrink-0 rounded-full bg-[#03042f] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#141653] disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  );
}

export const SuggestedQuestions = memo(SuggestedQuestionsComponent);
