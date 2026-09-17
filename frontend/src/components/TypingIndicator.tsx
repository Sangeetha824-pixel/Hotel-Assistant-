export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#b69a58]" />
          Simplotel is checking hotel information...
        </span>
      </div>
    </div>
  );
}
