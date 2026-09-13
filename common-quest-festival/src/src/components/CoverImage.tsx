import Image from "next/image";

/**
 * Visuel d evenement, trois cadrages.
 * "cover"   : remplit le cadre, image recadree au centre. Utilise sur les vignettes.
 * "contain" : image entiere posee sur un fond flou. Pour les affiches verticales.
 * "hero"    : recadrage plein sur mobile, image entiere avec marge floue sur ordinateur.
 *             Le cadre y est plus large que la plupart des visuels, ce mode evite
 *             de couper le haut et le bas sur grand ecran.
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
  fit?: "cover" | "contain" | "hero";
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

  if (fit === "hero") {
    return (
      <>
        {/* Fond flou visible seulement a partir de la tablette */}
        <div className="absolute inset-0 hidden md:block" aria-hidden>
          <Image
            src={src}
            alt=""
            fill
            sizes="45vw"
            quality={30}
            priority={priority}
            className="scale-110 object-cover blur-2xl saturate-150"
          />
          <div className="absolute inset-0 bg-ink/45" />
        </div>

        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={85}
          priority={priority}
          className="relative object-cover object-center md:object-contain md:p-4 lg:p-6"
        />
      </>
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
