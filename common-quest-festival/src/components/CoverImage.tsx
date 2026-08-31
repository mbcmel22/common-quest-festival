import Image from "next/image";

/**
 * Affiche un visuel sans jamais le rogner : l image entiere est posee sur un
 * fond flou tire d elle-meme. Les affiches verticales et les photos
 * horizontales tiennent ainsi dans le meme cadre.
 */
export default function CoverImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        priority={priority}
        className="scale-110 object-cover blur-xl saturate-150"
      />
      <div className="absolute inset-0 bg-ink/35" aria-hidden />
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="relative object-contain" />
    </>
  );
}
