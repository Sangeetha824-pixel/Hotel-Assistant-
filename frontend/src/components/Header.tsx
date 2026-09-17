import Info from "lucide-react/dist/esm/icons/info.js";
import RotateCw from "lucide-react/dist/esm/icons/rotate-cw.js";

export function Header() {
  return (
    <header className="flex h-20 items-center justify-between bg-[#03042f] px-5 text-white">
      <button className="grid h-9 w-9 place-items-center border border-white/20 text-2xl leading-none text-white/80" aria-label="Back">
        ‹
      </button>
      <div className="text-center">
        <div className="text-lg font-semibold tracking-wide">Simplotel</div>
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">AI Concierge</div>
      </div>
      <div className="flex gap-3">
        <button className="grid h-9 w-9 place-items-center border border-white/20 text-white/80" aria-label="Information">
          <Info size={18} />
        </button>
        <button className="grid h-9 w-9 place-items-center border border-white/20 text-white/80" aria-label="Refresh">
          <RotateCw size={18} />
        </button>
      </div>
    </header>
  );
}
