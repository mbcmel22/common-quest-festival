"use client";

import { Children, useEffect, useRef, useState } from "react";

/**
 * Carrousel des temps forts.
 * Defilement tactile sur mobile, fleches et points sur ordinateur.
 * Les cartes sont rendues cote serveur et passees en enfants.
 */
export default function HighlightsCarousel({
  children,
  labels
}: {
  children: React.ReactNode;
  labels: { previous: string; next: string; goTo: string };
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const count = Children.count(children);

  function readPosition() {
    const track = trackRef.current;
    if (!track) return;
    const step = track.firstElementChild?.clientWidth ?? 1;
    const gap = 24;
    setIndex(Math.round(track.scrollLeft / (step + gap)));
    setAtStart(track.scrollLeft < 8);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 8);
  }

  useEffect(() => {
    readPosition();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", readPosition, { passive: true });
    window.addEventListener("resize", readPosition);
    return () => {
      track.removeEventListener("scroll", readPosition);
      window.removeEventListener("resize", readPosition);
    };
  }, []);

  function scrollTo(target: number) {
    const track = trackRef.current;
    if (!track) return;
    const step = (track.firstElementChild?.clientWidth ?? 0) + 24;
    track.scrollTo({ left: step * target, behavior: "smooth" });
  }

  const arrow = (disabled: boolean) =>
    `flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
      disabled
        ? "cursor-not-allowed border-white/10 text-white/20"
        : "border-white/25 text-paper hover:border-acid hover:bg-acid hover:text-ink"
    }`;

  return (
    <div className="relative">
      {/* Piste : une carte visible sur mobile, deux sur tablette, trois sur ordinateur */}
      <div
        ref={trackRef}
        className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-roledescription="carrousel"
        aria-label="Temps forts du festival"
      >
        {Children.map(children, (child, i) => (
          <div
            className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            aria-label={`${i + 1} sur ${count}`}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Commandes : points sur mobile, fleches et points sur ordinateur */}
      {count > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`${labels.goTo} ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-acid" : "w-2.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <div className="hidden gap-3 sm:flex">
            <button
              type="button"
              onClick={() => scrollTo(Math.max(0, index - 1))}
              disabled={atStart}
              aria-label={labels.previous}
              className={arrow(atStart)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollTo(Math.min(count - 1, index + 1))}
              disabled={atEnd}
              aria-label={labels.next}
              className={arrow(atEnd)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
