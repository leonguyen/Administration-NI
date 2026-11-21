import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function parseRepo(repoUrl: string): { owner: string; repo: string } {
  const cleaned = repoUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const m = cleaned.match(/github\.com[:/]([^/]+)\/([^/]+)$/);
  if (!m) throw new Error("Invalid GitHub repo URL. Expected https://github.com/owner/repo");
  return { owner: m[1], repo: m[2] };
}

async function gh(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(
      `GitHub ${init.method || "GET"} ${path} failed (${res.status}): ${data?.message || text}`,
    );
  }
  return data;
}

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

async function loadConfig(userId: string, configId: string) {
  await assertAdmin(userId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("github_configs")
    .select("*")
    .eq("id", configId)
    .maybeSingle();
  if (error || !data) throw new Error("Config not found");
  return data as {
    id: string;
    repo_url: string;
    github_token: string;
    default_branch: string;
  };
}

export const claimAdminIfEligible = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string })?.email?.toLowerCase();
    if (email !== "nam85it@gmail.com") return { granted: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    return { granted: true };
  });

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { admin: !!data, email: (context.claims as { email?: string })?.email ?? null };
  });

export const listGithubConfigs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("github_configs")
      .select("id,label,repo_url,github_account,default_branch,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(80),
  repoUrl: z.string().url(),
  githubAccount: z.string().max(120).optional().nullable(),
  githubToken: z.string().min(10).optional(),
  defaultBranch: z.string().min(1).max(120).default("main"),
});

export const saveGithubConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saveSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    parseRepo(data.repoUrl);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const patch: {
        label: string; repo_url: string; github_account: string | null; default_branch: string; updated_at: string; github_token?: string;
      } = {
        label: data.label,
        repo_url: data.repoUrl,
        github_account: data.githubAccount ?? null,
        default_branch: data.defaultBranch,
        updated_at: new Date().toISOString(),
      };
      if (data.githubToken) patch.github_token = data.githubToken;
      const { error } = await supabaseAdmin
        .from("github_configs")
        .update(patch)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    if (!data.githubToken) throw new Error("GitHub token required");
    const { data: row, error } = await supabaseAdmin
      .from("github_configs")
      .insert({
        user_id: context.userId,
        label: data.label,
        repo_url: data.repoUrl,
        github_account: data.githubAccount ?? null,
        github_token: data.githubToken,
        default_branch: data.defaultBranch,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteGithubConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("github_configs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listBranches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ configId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const cfg = await loadConfig(context.userId, data.configId);
    const { owner, repo } = parseRepo(cfg.repo_url);
    const branches = (await gh(cfg.github_token, `/repos/${owner}/${repo}/branches?per_page=100`)) as Array<{
      name: string;
      commit: { sha: string };
    }>;
    return branches.map((b) => ({ name: b.name, sha: b.commit.sha }));
  });

const commitSchema = z.object({
  configId: z.string().uuid(),
  branch: z.string().min(1),
  message: z.string().min(1).max(500),
  files: z
    .array(z.object({ path: z.string().min(1).max(500), content: z.string() }))
    .min(1)
    .max(200),
});

export const commitAndPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => commitSchema.parse(d))
  .handler(async ({ data, context }) => {
    const cfg = await loadConfig(context.userId, data.configId);
    const { owner, repo } = parseRepo(cfg.repo_url);
    const base = `/repos/${owner}/${repo}`;
    const ref = (await gh(cfg.github_token, `${base}/git/ref/heads/${data.branch}`)) as {
      object: { sha: string };
    };
    const parentCommitSha = ref.object.sha;
    const parentCommit = (await gh(
      cfg.github_token,
      `${base}/git/commits/${parentCommitSha}`,
    )) as { tree: { sha: string } };
    const baseTreeSha = parentCommit.tree.sha;
    const blobs = await Promise.all(
      data.files.map(async (f) => {
        const blob = (await gh(cfg.github_token, `${base}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
        })) as { sha: string };
        return {
          path: f.path.replace(/^\/+/, ""),
          mode: "100644" as const,
          type: "blob" as const,
          sha: blob.sha,
        };
      }),
    );
    const newTree = (await gh(cfg.github_token, `${base}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTreeSha, tree: blobs }),
    })) as { sha: string };
    const newCommit = (await gh(cfg.github_token, `${base}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: data.message,
        tree: newTree.sha,
        parents: [parentCommitSha],
      }),
    })) as { sha: string };
    await gh(cfg.github_token, `${base}/git/refs/heads/${data.branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });
    return {
      commitSha: newCommit.sha,
      url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
      files: data.files.length,
    };
  });

const mergeSchema = z.object({
  configId: z.string().uuid(),
  base: z.string().min(1),
  head: z.string().min(1),
  message: z.string().max(500).optional(),
});

export const pullAndMerge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => mergeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const cfg = await loadConfig(context.userId, data.configId);
    const { owner, repo } = parseRepo(cfg.repo_url);
    const res = (await gh(cfg.github_token, `/repos/${owner}/${repo}/merges`, {
      method: "POST",
      body: JSON.stringify({
        base: data.base,
        head: data.head,
        commit_message: data.message ?? `Merge ${data.head} into ${data.base}`,
      }),
    })) as { sha?: string } | null;
    if (!res) return { merged: false, note: "Nothing to merge (already up to date)." };
    return {
      merged: true,
      commitSha: res.sha,
      url: res.sha ? `https://github.com/${owner}/${repo}/commit/${res.sha}` : undefined,
    };
  });
