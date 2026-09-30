import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Wordmark } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode } => {
    const mode = search["mode"];
    return mode === "signup" || mode === "login" || mode === "forgot" ? { mode } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — MNLK" },
      {
        name: "description",
        content: "Acesse sua conta MNLK para criar links curtos e acompanhar os cliques.",
      },
      { property: "og:title", content: "Entrar ou criar conta — MNLK" },
      { property: "og:description", content: "Acesse seu painel de links curtos MNLK." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState<Mode>(search.mode ?? "login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { nome },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: "/dashboard" });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Enviamos um e-mail com o link para criar uma nova senha.");
        setMode("login");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir.";
      toast.error(traduzErro(message));
    } finally {
      setBusy(false);
    }
  }

  if (checkEmail) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold">Confirme seu e-mail</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enviamos uma mensagem para <strong className="text-foreground">{email}</strong>. Clique no
          link do e-mail para ativar sua conta e entrar no painel.
        </p>
        <button
          onClick={() => {
            setCheckEmail(false);
            setMode("login");
          }}
          className="mt-6 w-full rounded-lg border border-border py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          Voltar para o login
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl font-semibold">
        {mode === "signup" ? "Criar conta" : mode === "login" ? "Entrar" : "Recuperar senha"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signup"
          ? "Leva menos de um minuto e é gratuito."
          : mode === "login"
            ? "Acesse seu painel de links."
            : "Informe seu e-mail e enviaremos um link para criar uma nova senha."}
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {mode === "signup" && (
          <Field label="Nome">
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring"
            />
          </Field>
        )}
        <Field label="E-mail">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring"
          />
        </Field>
        {mode !== "forgot" && (
          <Field label="Senha">
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring"
            />
          </Field>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === "signup" ? "Criar conta" : mode === "login" ? "Entrar" : "Enviar link"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        {mode === "login" && (
          <>
            <button
              onClick={() => setMode("forgot")}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </button>
            <p className="text-muted-foreground">
              Não tem conta?{" "}
              <button onClick={() => setMode("signup")} className="font-medium text-primary">
                Criar conta
              </button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <p className="text-muted-foreground">
            Já tem conta?{" "}
            <button onClick={() => setMode("login")} className="font-medium text-primary">
              Entrar
            </button>
          </p>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="font-medium text-primary">
            Voltar para o login
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-canvas flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link to="/">
        <Wordmark size="lg" />
      </Link>
      <div className="surface-card mt-8 w-full max-w-md p-7 sm:p-9">{children}</div>
      <Link to="/" className="mt-6 text-xs text-muted-foreground hover:underline">
        Voltar para o início
      </Link>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function traduzErro(message: string): string {
  if (/Invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/already registered|already been registered/i.test(message))
    return "Este e-mail já possui uma conta. Tente entrar.";
  if (/Email not confirmed/i.test(message))
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  if (/Password should be at least/i.test(message))
    return "A senha precisa ter pelo menos 6 caracteres.";
  return message;
}
