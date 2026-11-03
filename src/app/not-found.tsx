import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="igc-container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="igc-eyebrow">404 / Off the map</p>
      <h1 className="igc-display mt-6 text-5xl text-white md:text-7xl">
        NO LIMITS. BUT THIS PAGE IS MISSING.
      </h1>
      <p className="mt-6 max-w-lg text-white/55">
        The route you requested does not exist in the demo environment.
      </p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </main>
  );
}
