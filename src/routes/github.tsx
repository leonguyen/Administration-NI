import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/tailadmin/DashboardLayout";
import {
  isAdmin,
  listGithubConfigs,
  saveGithubConfig,
  deleteGithubConfig,
  listBranches,
  commitAndPush,
  pullAndMerge,
} from "@/lib/github.functions";
import { GitBranch, GitMerge, Plus, Trash2, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/github")({
  component: GithubPage,
  head: () => ({
    meta: [
      { title: "GitHub Sync — TailAdmin" },
      { name: "description", content: "Configure a GitHub repo, commit & push files, pull & merge branches." },
    ],
  }),
});

type Config = {
  id: string;
  label: string;
  repo_url: string;
  github_account: string | null;
  default_branch: string;
};

type FileEntry = { path: string; content: string };

function GithubPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(isAdmin);
  const listCfg = useServerFn(listGithubConfigs);
  const saveCfg = useServerFn(saveGithubConfig);
  const delCfg = useServerFn(deleteGithubConfig);
  const branchesFn = useServerFn(listBranches);
  const commitFn = useServerFn(commitAndPush);
  const mergeFn = useServerFn(pullAndMerge);

  const [state, setState] = useState<"loading" | "unauth" | "forbidden" | "ready">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Config | null>(null);
  const [label, setLabel] = useState("default");
  const [repoUrl, setRepoUrl] = useState("");
  const [ghAccount, setGhAccount] = useState("");
  const [token, setToken] = useState("");
  const [defBranch, setDefBranch] = useState("main");

  // action state
  const [branches, setBranches] = useState<Array<{ name: string; sha: string }>>([]);
  const [branch, setBranch] = useState("main");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([{ path: "", content: "" }]);
  const [mergeBase, setMergeBase] = useState("main");
  const [mergeHead, setMergeHead] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const active = useMemo(() => configs.find((c) => c.id === activeId) ?? null, [configs, activeId]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setState("unauth");
        return;
      }
      try {
        const a = await checkAdmin();
        setEmail(a.email);
        if (!a.admin) {
          setState("forbidden");
          return;
        }
        const rows = (await listCfg()) as Config[];
        setConfigs(rows);
        if (rows[0]) {
          setActiveId(rows[0].id);
          setBranch(rows[0].default_branch);
          setMergeBase(rows[0].default_branch);
        } else {
          setShowForm(true);
        }
        setState("ready");
      } catch {
        setState("forbidden");
      }
    })();
  }, [checkAdmin, listCfg]);

  function resetForm() {
    setEditing(null);
    setLabel("default");
    setRepoUrl("");
    setGhAccount("");
    setToken("");
    setDefBranch("main");
  }

  async function refreshConfigs(selectId?: string) {
    const rows = (await listCfg()) as Config[];
    setConfigs(rows);
    if (selectId) setActiveId(selectId);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy("save");
    try {
      const res = await saveCfg({
        data: {
          id: editing?.id,
          label,
          repoUrl,
          githubAccount: ghAccount || null,
          githubToken: token || undefined,
          defaultBranch: defBranch,
        },
      });
      await refreshConfigs(res.id);
      setShowForm(false);
      resetForm();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this GitHub config?")) return;
    await delCfg({ data: { id } });
    await refreshConfigs();
    if (activeId === id) setActiveId(null);
  }

  async function loadBranches() {
    if (!active) return;
    setErr(null);
    setBusy("branches");
    try {
      const b = await branchesFn({ data: { configId: active.id } });
      setBranches(b);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to list branches");
    } finally {
      setBusy(null);
    }
  }

  function addFile() {
    setFiles((f) => [...f, { path: "", content: "" }]);
  }
  function updateFile(i: number, patch: Partial<FileEntry>) {
    setFiles((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeFile(i: number) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
  }

  async function onCommit() {
    if (!active) return;
    setErr(null);
    setBusy("commit");
    try {
      const clean = files.filter((f) => f.path.trim() && f.content.length);
      if (!clean.length) throw new Error("Add at least one file with a path and content.");
      if (!message.trim()) throw new Error("Commit message required.");
      const res = await commitFn({
        data: { configId: active.id, branch, message, files: clean },
      });
      setLog((l) => [`✅ Pushed ${res.files} file(s) → ${res.commitSha.slice(0, 7)} — ${res.url}`, ...l]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Commit failed");
    } finally {
      setBusy(null);
    }
  }

  async function onMerge() {
    if (!active) return;
    setErr(null);
    setBusy("merge");
    try {
      const res = await mergeFn({
        data: { configId: active.id, base: mergeBase, head: mergeHead },
      });
      setLog((l) => [
        res.merged
          ? `✅ Merged ${mergeHead} → ${mergeBase} (${res.commitSha?.slice(0, 7)}) — ${res.url}`
          : `ℹ️ ${res.note ?? "Already up to date"}`,
        ...l,
      ]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setBusy(null);
    }
  }

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (state === "unauth") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-muted-foreground">You need to sign in to access GitHub sync.</p>
        <Link to="/auth" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Go to sign in
        </Link>
      </div>
    );
  }
  if (state === "forbidden") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p className="text-muted-foreground">
          Signed in as <code>{email ?? "unknown"}</code>. This panel is restricted to{" "}
          <code>nam85it@gmail.com</code>.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">GitHub Sync</h1>
            <p className="text-sm text-muted-foreground">
              Save a repo + personal access token, then commit &amp; push files or pull &amp; merge branches.
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="rounded-md border px-3 py-1.5 text-xs"
          >
            Sign out ({email})
          </button>
        </header>

        {/* Config picker */}
        <section className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Repositories</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          {configs.length === 0 && <p className="text-sm text-muted-foreground">No repos yet.</p>}
          <ul className="space-y-1">
            {configs.map((c) => (
              <li
                key={c.id}
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                  activeId === c.id ? "border-primary bg-primary/5" : ""
                }`}
              >
                <button
                  className="text-left"
                  onClick={() => {
                    setActiveId(c.id);
                    setBranch(c.default_branch);
                    setMergeBase(c.default_branch);
                  }}
                >
                  <div className="font-medium">{c.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.repo_url} · default: {c.default_branch}
                    {c.github_account ? ` · ${c.github_account}` : ""}
                  </div>
                </button>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditing(c);
                      setLabel(c.label);
                      setRepoUrl(c.repo_url);
                      setGhAccount(c.github_account ?? "");
                      setToken("");
                      setDefBranch(c.default_branch);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-destructive hover:text-destructive/80"
                    onClick={() => onDelete(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {showForm && (
            <form onSubmit={onSave} className="mt-4 grid grid-cols-1 gap-3 rounded-md border bg-background p-3 md:grid-cols-2">
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Label</span>
                <input value={label} onChange={(e) => setLabel(e.target.value)} required className="w-full rounded border bg-background px-2 py-1 text-sm" />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Repository URL</span>
                <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repo" required className="w-full rounded border bg-background px-2 py-1 text-sm" />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">GitHub account (optional)</span>
                <input value={ghAccount} onChange={(e) => setGhAccount(e.target.value)} placeholder="username or email" className="w-full rounded border bg-background px-2 py-1 text-sm" />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted-foreground">Default branch</span>
                <input value={defBranch} onChange={(e) => setDefBranch(e.target.value)} required className="w-full rounded border bg-background px-2 py-1 text-sm" />
              </label>
              <label className="text-xs md:col-span-2">
                <span className="mb-1 block text-muted-foreground">
                  Personal Access Token {editing ? "(leave blank to keep existing)" : "(required)"}
                </span>
                <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_..." className="w-full rounded border bg-background px-2 py-1 font-mono text-sm" />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  Needs <code>repo</code> scope. Stored server-side; never returned to the browser.
                </span>
              </label>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" disabled={busy === "save"} className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-60">
                  {busy === "save" ? "Saving…" : editing ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-md border px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {active && (
          <>
            {/* Commit & Push */}
            <section className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Commit &amp; Push
                </h2>
                <button
                  onClick={loadBranches}
                  disabled={busy === "branches"}
                  className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  {busy === "branches" ? "Loading…" : "Fetch branches"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-xs">
                  <span className="mb-1 block text-muted-foreground">Branch</span>
                  <input list="branches-list" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full rounded border bg-background px-2 py-1 text-sm" />
                  <datalist id="branches-list">
                    {branches.map((b) => (
                      <option key={b.name} value={b.name} />
                    ))}
                  </datalist>
                </label>
                <label className="text-xs">
                  <span className="mb-1 block text-muted-foreground">Commit message</span>
                  <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Update via TailAdmin" className="w-full rounded border bg-background px-2 py-1 text-sm" />
                </label>
              </div>

              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Files ({files.length}) — supports .ts / .js / .tsx / any UTF-8 source
                  </span>
                  <button onClick={addFile} className="inline-flex items-center gap-1 text-xs text-primary">
                    <Plus className="h-3.5 w-3.5" /> Add file
                  </button>
                </div>
                {files.map((f, i) => (
                  <div key={i} className="rounded-md border bg-background p-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={f.path}
                        onChange={(e) => updateFile(i, { path: e.target.value })}
                        placeholder="src/hello.ts"
                        className="flex-1 rounded border bg-background px-2 py-1 font-mono text-xs"
                      />
                      <label className="rounded border px-2 py-1 text-xs cursor-pointer">
                        Upload
                        <input
                          type="file"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const content = await file.text();
                            updateFile(i, { path: f.path || file.name, content });
                          }}
                        />
                      </label>
                      {files.length > 1 && (
                        <button onClick={() => removeFile(i)} className="rounded border px-2 py-1 text-xs text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={f.content}
                      onChange={(e) => updateFile(i, { content: e.target.value })}
                      rows={6}
                      placeholder="// file contents"
                      className="w-full rounded border bg-background px-2 py-1 font-mono text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={onCommit}
                  disabled={busy === "commit"}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
                >
                  {busy === "commit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Commit &amp; Push
                </button>
              </div>
            </section>

            {/* Pull & Merge */}
            <section className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <GitMerge className="h-4 w-4" /> Pull &amp; Merge
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-xs">
                  <span className="mb-1 block text-muted-foreground">Base (target)</span>
                  <input list="branches-list" value={mergeBase} onChange={(e) => setMergeBase(e.target.value)} className="w-full rounded border bg-background px-2 py-1 text-sm" />
                </label>
                <label className="text-xs">
                  <span className="mb-1 block text-muted-foreground">Head (source)</span>
                  <input list="branches-list" value={mergeHead} onChange={(e) => setMergeHead(e.target.value)} placeholder="feature/xyz" className="w-full rounded border bg-background px-2 py-1 text-sm" />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={onMerge}
                  disabled={busy === "merge" || !mergeHead}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
                >
                  {busy === "merge" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />}
                  Pull &amp; Merge
                </button>
              </div>
            </section>
          </>
        )}

        {err && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {err}
          </div>
        )}

        {log.length > 0 && (
          <section className="rounded-xl border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Activity</h2>
            <ul className="space-y-1 text-xs font-mono">
              {log.map((l, i) => (
                <li key={i} className="break-all">{l}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
