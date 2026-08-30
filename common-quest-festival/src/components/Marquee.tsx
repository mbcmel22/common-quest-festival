export default function Marquee({ text, tone = "acid" }: { text: string; tone?: "acid" | "violet" }) {
  const items = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div
      className={`overflow-hidden border-y py-3 ${
        tone === "acid" ? "border-acid/30 bg-acid text-ink" : "border-violet/40 bg-violet text-white"
      }`}
      aria-hidden
    >
      <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-display text-xl uppercase sm:text-2xl">
        {items.concat(items).map((i) => (
          <span key={i} className="flex items-center gap-8">
            {text}
            <span className="opacity-60">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
