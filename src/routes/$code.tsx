import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { resolveLink } from "@/lib/links.functions";
import { Wordmark } from "@/components/brand";

export const Route = createFileRoute("/$code")({
  loader: async ({ params }) => {
    const { url } = await resolveLink({ data: { code: params.code } });
    if (!url) return { notFound: true };
    throw redirect({ href: url, statusCode: 302 });
  },
  component: UnknownCode,
});

function UnknownCode() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <Wordmark className="justify-center" />
        <h1 className="mt-8 text-2xl font-semibold">Link não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este link curto não existe, expirou ou foi desativado pelo autor.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-secondary"
        >
          Criar meu link curto
        </Link>
      </div>
    </div>
  );
}
