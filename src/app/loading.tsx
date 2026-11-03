export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-lime" />
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">
          Loading infinite…
        </p>
      </div>
    </div>
  );
}
