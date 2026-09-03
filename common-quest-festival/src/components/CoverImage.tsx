import Image from "next/image";

/**
 * Visuel d evenement, deux cadrages possibles.
 * "cover" remplit tout le cadre, l image est recadree au centre.
 * "contain" montre l image entiere, posee sur un fond flou tire d elle-meme.
 */
export default function CoverImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  fit = "cover"
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  if (fit === "cover") {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={85}
        priority={priority}
        className="object-cover object-center"
      />
    );
  }

  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes="40vw"
        quality={35}
        priority={priority}
        className="scale-110 object-cover blur-xl saturate-150"
      />
      <div className="absolute inset-0 bg-ink/35" aria-hidden />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={85}
        priority={priority}
        className="relative object-contain"
      />
    </>
  );
}
