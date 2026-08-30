export default function Marquee({
  text,
  tone = "acid",
  speed = 75
}: {
  text: string;
  tone?: "acid" | "violet";
  speed?: number;
}) {
  const items = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div
      className={`overflow-hidden border-y py-3 ${
        tone === "acid" ? "border-acid/30 bg-acid text-ink" : "border-violet/40 bg-violet text-white"
      }`}
      aria-hidden
    >
      <div
        className="marquee-track flex w-max gap-8 whitespace-nowrap font-display text-xl uppercase leading-none sm:text-2xl"
        style={{ ["--marquee-duration" as string]: `${speed}s` }}
      >
        {items.concat(items).map((i) => (
          <span key={i} className="flex items-center gap-8">
            {text}
            <span className="opacity-50">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
