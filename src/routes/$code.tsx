import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";

import { Wordmark } from "@/components/brand";
import { resolveLink } from "@/lib/links.functions";

export const Route = createFileRoute("/$code")({
  loader: async ({ params }) => {
    const result = await resolveLink({ data: { code: params.code } });
    if (!result.url) throw notFound();
    throw redirect({ href: result.url, statusCode: 302 });
  },
  head: () => ({
    meta: [
      { title: "Abrindo link — MNLK" },
      { name: "description", content: "Redirecionamento seguro de link curto MNLK." },
      { property: "og:title", content: "Link curto — MNLK" },
      { property: "og:description", content: "Redirecionamento seguro de link curto MNLK." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Redirecting,
  notFoundComponent: UnknownCode,
});

function Redirecting() {
  return null;
}

function UnknownCode() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md text-center">
        <Wordmark />
        <h1 className="mt-8 text-3xl font-bold text-primary-deep">Link não encontrado</h1>
        <p className="mt-3 text-muted-foreground">
          Este endereço não existe, foi desativado ou não está mais disponível.
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
