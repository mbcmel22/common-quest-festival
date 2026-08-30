export default function Marquee({ text, tone = "acid" }: { text: string; tone?: "acid" | "violet" }) {
  const items = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div
      className={`overflow-hidden border-y py-4 ${
        tone === "acid" ? "border-acid/30 bg-acid text-ink" : "border-violet/40 bg-violet text-white"
      }`}
      aria-hidden
    >
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-display text-3xl uppercase leading-none sm:text-4xl">
        {items.concat(items).map((i) => (
          <span key={i} className="flex items-center gap-10">
            {text}
            <span className="opacity-50">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
