import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Wordmark } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Criar nova senha — MNLK" },
      { name: "description", content: "Defina uma nova senha para sua conta MNLK." },
      { property: "og:title", content: "Criar nova senha — MNLK" },
      { property: "og:description", content: "Defina uma nova senha para sua conta MNLK." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (senha !== confirma) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada com sucesso.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="hero-canvas flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link to="/">
        <Wordmark size="lg" />
      </Link>
      <div className="surface-card mt-8 w-full max-w-md p-7 sm:p-9">
        <h1 className="text-2xl font-semibold">Criar nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina a nova senha da sua conta para continuar.
        </p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Nova senha</span>
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Confirmar nova senha</span>
            <input
              type="password"
              value={confirma}
              onChange={(event) => setConfirma(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Salvar nova senha
          </button>
        </form>
      </div>
    </div>
  );
}
