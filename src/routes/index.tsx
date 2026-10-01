import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BarChart3, Copy, Link2, Lock, MousePointerClick, Menu } from "lucide-react";
import { toast } from "sonner";

import { Wordmark } from "@/components/brand";
import { useAuth } from "@/hooks/useAuth";
import { normalizeUrl, SHORT_DOMAIN } from "@/lib/mnlk";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MNLK — Encurte seus links e acompanhe seus cliques" },
      {
        name: "description",
        content:
          "Crie URLs curtas, organize seus links e acompanhe o desempenho de cada acesso em um único lugar.",
      },
      { property: "og:title", content: "MNLK — Encurte seus links e acompanhe seus cliques" },
      {
        property: "og:description",
        content: "Encurtador de URLs com painel de cliques, links personalizados e estatísticas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [url, setUrl] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeUrl(url);
    if (!normalized) {
      toast.error("Cole um endereço válido, como https://exemplo.com/pagina");
      return;
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("mnlk:pending-url", normalized);
    }
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth", search: { mode: "signup" } });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Wordmark />
          <nav className="hidden items-center gap-2 sm:flex">
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Entrar
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-secondary"
            >
              Criar conta
            </Link>
          </nav>
          <Sheet>
            <SheetTrigger className="rounded-lg border border-border p-2 sm:hidden" aria-label="Abrir menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background">
              <div className="mt-10 flex flex-col gap-3">
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  className="rounded-lg border border-border px-4 py-3 text-center text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
                >
                  Criar conta
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>
        <section className="hero-canvas">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-gold" />
                {SHORT_DOMAIN}
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] text-primary-deep sm:text-5xl md:text-6xl">
                Seu link. Seu controle. Seus resultados.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Crie URLs curtas, organize seus links e acompanhe o desempenho de cada acesso em um
                único lugar.
              </p>

              <form
                onSubmit={handleSubmit}
                className="surface-card mx-auto mt-9 flex max-w-2xl flex-col gap-3 p-3 sm:flex-row"
              >
                <label className="sr-only" htmlFor="url">
                  Cole sua URL
                </label>
                <div className="flex flex-1 items-center gap-2 rounded-lg bg-muted/60 px-3">
                  <Link2 className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    id="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="Cole sua URL"
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-secondary"
                >
                  Encurtar URL
                  <ArrowRight className="size-4" />
                </button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                Grátis para começar. Seus links ficam salvos na sua conta.
              </p>
            </div>

            <DemoPreview />
          </div>
        </section>

        <section className="border-y border-border/70 bg-cream/50">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:grid-cols-3">
            {[
              {
                icon: Link2,
                title: "Links curtos em segundos",
                text: "Cole a URL, gere um código único ou escolha um nome personalizado.",
              },
              {
                icon: BarChart3,
                title: "Cliques em tempo real",
                text: "Veja quantos acessos cada link recebeu e quando aconteceram.",
              },
              {
                icon: Lock,
                title: "Privado por padrão",
                text: "Cada conta enxerga e administra somente os seus próprios links.",
              },
            ].map((item) => (
              <div key={item.title} className="surface-card p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 text-center">
          <h2 className="text-3xl font-bold text-primary-deep">Pronto para começar?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Crie sua conta gratuita, encurte o primeiro link e volte quando quiser para ver os
            resultados.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-secondary"
          >
            Criar conta gratuita
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row">
          <Wordmark size="sm" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MNLK · {SHORT_DOMAIN}
          </p>
        </div>
      </footer>
    </div>
  );
}

function DemoPreview() {
  return (
    <div className="surface-card mx-auto mt-14 max-w-4xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="size-2 rounded-full bg-gold" />
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Como funciona
        </p>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto_1fr_auto_auto] sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">URL original</p>
          <p className="mt-1 truncate font-medium text-foreground">
            https://exemplo.com/produto/oferta
          </p>
        </div>
        <ArrowRight className="mx-auto hidden size-4 text-gold sm:block" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">URL curta</p>
          <p className="mt-1 font-medium text-primary">{SHORT_DOMAIN}/a8K29</p>
        </div>
        <div className="hidden h-10 w-px bg-border sm:block" />
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <MousePointerClick className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold leading-none text-primary-deep">1.284</p>
            <p className="text-xs text-muted-foreground">cliques</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-6 py-3 text-xs text-muted-foreground">
        <Copy className="size-3.5" />
        Copie e compartilhe onde quiser — o painel conta cada acesso automaticamente.
      </div>
    </div>
  );
}
