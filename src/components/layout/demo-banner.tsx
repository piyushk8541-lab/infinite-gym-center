export function DemoBanner() {
  return (
    <div className="relative z-50 flex items-center justify-center gap-2 border-b border-lime/20 bg-lime/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-lime sm:text-[11px]">
      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-lime" />
      Demonstration environment · sample data · Stripe test mode only · no real payments processed
    </div>
  );
}
