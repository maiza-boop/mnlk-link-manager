import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BarChart3, Copy, ExternalLink, Link2, Loader2, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { generateShortCode, normalizeAlias, normalizeUrl, SHORT_DOMAIN } from "@/lib/mnlk";

type LinkRow = Tables<"links">;

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Meus links — MNLK" },
      { name: "description", content: "Crie, organize e acompanhe seus links curtos no MNLK." },
      { property: "og:title", content: "Meus links — MNLK" },
      { property: "og:description", content: "Painel de gerenciamento de links curtos MNLK." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LinkRow | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { mode: "login" }, replace: true });
      return;
    }

    let active = true;
    void supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error("Não foi possível carregar seus links.");
        setLinks(data ?? []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (authLoading || !user || typeof window === "undefined") return;
    const pendingUrl = window.sessionStorage.getItem("mnlk:pending-url");
    if (!pendingUrl) return;
    window.sessionStorage.removeItem("mnlk:pending-url");
    setUrl(pendingUrl);
    setDialogOpen(true);
  }, [authLoading, user]);

  const totalClicks = useMemo(
    () => links.reduce((total, link) => total + link.total_clicks, 0),
    [links],
  );

  function openCreate() {
    setEditing(null);
    setTitle("");
    setUrl("");
    setAlias("");
    setDialogOpen(true);
  }

  function openEdit(link: LinkRow) {
    setEditing(link);
    setTitle(link.title);
    setUrl(link.original_url);
    setAlias(link.short_code);
    setDialogOpen(true);
  }

  async function saveLink(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const originalUrl = normalizeUrl(url);
    if (!originalUrl) {
      toast.error("Informe um endereço válido.");
      return;
    }

    const customAlias = normalizeAlias(alias);
    if (alias && customAlias.length < 3) {
      toast.error("O código personalizado precisa ter pelo menos 3 caracteres.");
      return;
    }

    setSaving(true);
    if (editing) {
      const { data, error } = await supabase
        .from("links")
        .update({ title: title.trim(), original_url: originalUrl, short_code: customAlias || editing.short_code })
        .eq("id", editing.id)
        .select()
        .single();

      setSaving(false);
      if (error || !data) {
        toast.error(error?.code === "23505" ? "Este código já está em uso." : "Não foi possível salvar as alterações.");
        return;
      }
      setLinks((current) => current.map((link) => (link.id === data.id ? data : link)));
      toast.success("Link atualizado.");
    } else {
      const shortCode = customAlias || generateShortCode();
      const { data, error } = await supabase
        .from("links")
        .insert({
          user_id: user.id,
          title: title.trim(),
          original_url: originalUrl,
          short_code: shortCode,
          custom_alias: Boolean(customAlias),
        })
        .select()
        .single();

      setSaving(false);
      if (error || !data) {
        toast.error(error?.code === "23505" ? "Este código já está em uso. Tente outro." : "Não foi possível criar o link.");
        return;
      }
      setLinks((current) => [data, ...current]);
      toast.success("Link curto criado.");
    }
    setDialogOpen(false);
  }

  async function removeLink(link: LinkRow) {
    if (!window.confirm(`Excluir “${link.title || link.short_code}”?`)) return;
    const { error } = await supabase.from("links").delete().eq("id", link.id);
    if (error) {
      toast.error("Não foi possível excluir o link.");
      return;
    }
    setLinks((current) => current.filter((item) => item.id !== link.id));
    toast.success("Link excluído.");
  }

  async function copyShortUrl(code: string) {
    await navigator.clipboard.writeText(`https://${SHORT_DOMAIN}/${code}`);
    toast.success("Link copiado.");
  }

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Wordmark />
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Painel</p>
            <h1 className="mt-1 text-3xl font-bold text-primary-deep">Seus links, organizados.</h1>
          </div>
          <Button size="lg" onClick={openCreate}>
            <Plus />
            Novo link
          </Button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <Stat icon={Link2} label="Total de links" value={links.length} />
          <Stat icon={BarChart3} label="Total de cliques" value={totalClicks} />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Meus links</h2>
          {links.length === 0 ? (
            <div className="mt-4 border-y border-border py-14 text-center">
              <Link2 className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">Você ainda não criou nenhum link</h3>
              <p className="mt-1 text-sm text-muted-foreground">Crie seu primeiro endereço curto para começar.</p>
              <Button className="mt-5" onClick={openCreate}><Plus />Novo link</Button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-border border-y border-border">
              {links.map((link) => (
                <article key={link.id} className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{link.title || link.original_url}</h3>
                    <button className="mt-1 text-sm font-medium text-primary hover:underline" onClick={() => copyShortUrl(link.short_code)}>
                      {SHORT_DOMAIN}/{link.short_code}
                    </button>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{link.original_url}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mr-3 text-sm text-muted-foreground"><strong className="text-foreground">{link.total_clicks}</strong> cliques</span>
                    <Button variant="ghost" size="icon" title="Copiar link" onClick={() => copyShortUrl(link.short_code)}><Copy /></Button>
                    <Button variant="ghost" size="icon" title="Abrir link" asChild><a href={`/${link.short_code}`} target="_blank" rel="noreferrer"><ExternalLink /></a></Button>
                    <Button variant="ghost" size="icon" title="Editar link" onClick={() => openEdit(link)}><Pencil /></Button>
                    <Button variant="ghost" size="icon" title="Excluir link" onClick={() => removeLink(link)}><Trash2 /></Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar link" : "Criar novo link"}</DialogTitle>
            <DialogDescription>Defina o destino e, se quiser, personalize o endereço curto.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveLink} className="space-y-4">
            <Field label="Título">
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Página da campanha" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
            </Field>
            <Field label="URL de destino">
              <input value={url} onChange={(event) => setUrl(event.target.value)} required placeholder="https://exemplo.com/pagina" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
            </Field>
            <Field label="Código personalizado (opcional)">
              <div className="flex items-center rounded-md border border-input bg-background focus-within:border-ring">
                <span className="border-r border-border px-3 py-2 text-sm text-muted-foreground">{SHORT_DOMAIN}/</span>
                <input value={alias} onChange={(event) => setAlias(normalizeAlias(event.target.value))} placeholder="minha-oferta" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
              </div>
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />}{editing ? "Salvar" : "Criar link"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Link2; label: string; value: number }) {
  return (
    <div className="surface-card flex items-center gap-4 p-5">
      <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon /></div>
      <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold text-primary-deep">{value.toLocaleString("pt-BR")}</p></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>;
}