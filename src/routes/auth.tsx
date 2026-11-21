import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { claimAdminIfEligible } from "@/lib/github.functions";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — TailAdmin" },
      { name: "description", content: "Sign in to manage GitHub sync." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const claim = useServerFn(claimAdminIfEligible);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/github" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        setMsg("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await claim().catch(() => {});
        navigate({ to: "/github" });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Auth error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-semibold">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        {err && <p className="text-sm text-destructive">{err}</p>}
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setErr(null);
            setMsg(null);
          }}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <p className="text-xs text-muted-foreground">
          Admin access (GitHub panel) is granted automatically only to{" "}
          <code>nam85it@gmail.com</code>.
        </p>
      </form>
    </div>
  );
}
