import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}
    >
      <p className="igc-eyebrow mb-4">{eyebrow}</p>
      <h2 className="igc-display text-3xl text-white sm:text-4xl md:text-5xl">{title}</h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-white/55 md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
