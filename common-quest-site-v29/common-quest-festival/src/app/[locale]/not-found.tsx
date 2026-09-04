import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-4 display-l">Cette page n’existe pas.</h1>
      <p className="mt-4 max-w-md text-paper/70">
        Le lien est peut-être ancien ou mal recopié. Le programme, lui, est toujours à jour.
      </p>
      <Link href="/fr/programme" className="btn-acid mt-8">
        Voir le programme
      </Link>
    </section>
  );
}
