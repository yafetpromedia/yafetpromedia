"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Trash2, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminPermission } from "@/app/admin/types";

type TeamUser = {
  id: number;
  email: string;
  role: "owner" | "messages";
  roleLabel?: string;
  permissions: AdminPermission[];
  isPrimary?: boolean;
};

type AccessTemplate = "messages" | "content" | "testimonials" | "teamSupport" | "custom";

const PERMISSION_OPTIONS: Array<{ key: AdminPermission; label: string }> = [
  { key: "content.view", label: "Content: view" },
  { key: "content.edit", label: "Content: edit/save" },
  { key: "leads.view", label: "Messages: view" },
  { key: "leads.edit", label: "Messages: update status" },
  { key: "leads.delete", label: "Messages: delete" },
  { key: "testimonials.view", label: "Testimonials: view" },
  { key: "testimonials.edit", label: "Testimonials: approve/reject" },
  { key: "testimonials.delete", label: "Testimonials: delete" },
  { key: "team.view", label: "Team: view users" },
  { key: "team.add", label: "Team: create users" },
  { key: "team.delete", label: "Team: remove users" },
  { key: "security.view", label: "Security: view page" },
  { key: "security.edit", label: "Security: change password" },
  { key: "ai.view", label: "AI provider: view" },
  { key: "upload.add", label: "Uploads: add media" },
];

const TEMPLATE_PERMISSIONS: Record<AccessTemplate, AdminPermission[]> = {
  messages: ["leads.view", "leads.edit", "security.view", "security.edit"],
  content: ["content.view", "content.edit", "upload.add", "security.view", "security.edit"],
  testimonials: [
    "testimonials.view",
    "testimonials.edit",
    "testimonials.delete",
    "security.view",
    "security.edit",
  ],
  teamSupport: ["team.view", "team.add", "security.view", "security.edit"],
  custom: [],
};

function samePermissions(a: AdminPermission[], b: AdminPermission[]) {
  if (a.length !== b.length) return false;
  const x = [...a].sort();
  const y = [...b].sort();
  return x.every((v, i) => v === y[i]);
}

function detectTemplate(perms: AdminPermission[]): AccessTemplate {
  if (samePermissions(perms, TEMPLATE_PERMISSIONS.messages)) return "messages";
  if (samePermissions(perms, TEMPLATE_PERMISSIONS.content)) return "content";
  if (samePermissions(perms, TEMPLATE_PERMISSIONS.testimonials)) return "testimonials";
  if (samePermissions(perms, TEMPLATE_PERMISSIONS.teamSupport)) return "teamSupport";
  return "custom";
}

const actionBtn = cn(
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border/75 bg-card px-4 text-sm font-semibold text-foreground/85 transition",
  "hover:border-primary/40 hover:bg-primary/[0.07] hover:text-foreground"
);

const dangerBtn = cn(
  actionBtn,
  "border-red-500/25 text-red-600 hover:border-red-500/45 hover:bg-red-500/[0.09] hover:text-red-700",
  "dark:text-red-400 dark:hover:text-red-300"
);

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-accent/45 focus:ring-2 focus:ring-accent/15",
  ""
);
const selectTriggerCls = cn(
  inputCls,
  "flex items-center justify-between gap-3 text-left cursor-pointer pr-3"
);

type SelectOption = { value: string; label: string };

function MenuSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    const onAnotherOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (!detail?.id) return;
      if (detail.id !== id) {
        setOpen(false);
      }
    };
    window.addEventListener("team-menu-open", onAnotherOpen as EventListener);
    return () => window.removeEventListener("team-menu-open", onAnotherOpen as EventListener);
  }, [id]);

  const current = options.find((opt) => opt.value === value);

  return (
    <div ref={rootRef} className={cn("relative", open ? "z-[120]" : "z-0")}>
      <button
        type="button"
        className={selectTriggerCls}
        onClick={() =>
          setOpen((prev) => {
            const next = !prev;
            if (next) {
              window.dispatchEvent(new CustomEvent("team-menu-open", { detail: { id } }));
            }
            return next;
          })
        }
      >
        <span className="truncate">{current?.label ?? placeholder ?? "Select..."}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-foreground/55 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute z-[90] isolate mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border/80 bg-background p-1 shadow-lg ring-1 ring-black/25 backdrop-blur-xl ">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active ? "bg-primary/14 text-foreground" : "text-foreground/85 hover:bg-foreground/[0.06]"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {active ? <Check className="size-4 shrink-0 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminTeamSection() {
  const router = useRouter();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "messages">("messages");
  const [template, setTemplate] = useState<AccessTemplate>("messages");
  const [permissions, setPermissions] = useState<AdminPermission[]>([
    "leads.view",
    "leads.edit",
    "security.view",
    "security.edit",
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<"owner" | "messages">("messages");
  const [editTemplate, setEditTemplate] = useState<AccessTemplate>("messages");
  const [editPermissions, setEditPermissions] = useState<AdminPermission[]>([]);
  const [copyFromCreateId, setCopyFromCreateId] = useState<string>("");
  const [copyFromEditId, setCopyFromEditId] = useState<string>("");
  const [createOk, setCreateOk] = useState("");
  const [createError, setCreateError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    setLoading(false);
    if (!res.ok) {
      setError("Could not load team members.");
      return;
    }
    const data = (await res.json()) as { users?: TeamUser[] };
    setUsers(data.users ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError("Could not load team members.");
        return;
      }
      const data = (await res.json()) as { users?: TeamUser[] };
      if (cancelled) return;
      setUsers(data.users ?? []);
      setError("");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createUser = async () => {
    setCreateOk("");
    setCreateError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, permissions }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setCreateError(data.error ?? "Could not create user.");
      return;
    }
    setEmail("");
    setPassword("");
    setRole("messages");
    setTemplate("messages");
    setPermissions(["leads.view", "leads.edit", "security.view", "security.edit"]);
    setCreateOk("User created.");
    void load();
    router.refresh();
  };

  const remove = async (u: TeamUser) => {
    if (u.isPrimary) {
      setError("Primary admin account cannot be removed.");
      return;
    }
    if (!confirm(`Remove ${u.email} from the team? They will no longer be able to sign in.`)) return;
    setBusyId(u.id);
    const res = await fetch(`/api/admin/users?id=${u.id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not remove user.");
      return;
    }
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    router.refresh();
  };

  const startEdit = (u: TeamUser) => {
    setEditingId(u.id);
    setEditRole(u.role);
    setEditPermissions(u.permissions ?? []);
    setEditTemplate(detectTemplate(u.permissions ?? []));
    setError("");
  };

  const saveEdit = async (u: TeamUser) => {
    setBusyId(u.id);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, role: editRole, permissions: editRole === "owner" ? [] : editPermissions }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not update access.");
      return;
    }
    setEditingId(null);
    void load();
    router.refresh();
  };

  const copyAccessToCreate = () => {
    const id = Number(copyFromCreateId);
    if (!Number.isFinite(id) || id <= 0) return;
    const source = users.find((u) => u.id === id);
    if (!source || source.isPrimary) return;
    setRole(source.role);
    if (source.role === "owner") {
      setTemplate("custom");
      setPermissions([]);
      return;
    }
    const next = source.permissions ?? [];
    setPermissions(next);
    setTemplate(detectTemplate(next));
  };

  const copyAccessToEdit = (targetId: number) => {
    const id = Number(copyFromEditId);
    if (!Number.isFinite(id) || id <= 0) return;
    if (id === targetId) return;
    const source = users.find((u) => u.id === id);
    if (!source || source.isPrimary) return;
    setEditRole(source.role);
    if (source.role === "owner") {
      setEditTemplate("custom");
      setEditPermissions([]);
      return;
    }
    const next = source.permissions ?? [];
    setEditPermissions(next);
    setEditTemplate(detectTemplate(next));
  };

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-muted/35 to-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-indigo-400/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-violet-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-800 ring-1 ring-indigo-500/28 dark:text-indigo-400">
              <Users className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-900/90 dark:text-indigo-400/95">
                Admin · Team
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">Team access</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Invite collaborators with full dashboard access, or assign custom read/write/delete permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm backdrop-blur-sm  sm:p-8">
        <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
          <h4 className="font-display text-lg font-semibold tracking-tight">Add dashboard user</h4>
          <p className="text-sm text-foreground/55">
            Primary admin account is protected and cannot be removed.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
              Email
            </span>
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="name@company.com"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
              Temporary password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Min. 8 characters"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
              Role
            </span>
            <MenuSelect
              id="create-role"
              value={role}
              onChange={(value) => {
                const nextRole = value as "owner" | "messages";
                setRole(nextRole);
                if (nextRole === "owner") {
                  setPermissions([]);
                  setTemplate("custom");
                }
              }}
              options={[
                { value: "messages", label: "Restricted (custom permissions)" },
                { value: "owner", label: "Owner (full dashboard)" },
              ]}
            />
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
              Permissions ({role === "owner" ? "full access by role" : "custom access"})
            </p>
            {role === "owner" ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground/65">
                Owners always have full permissions.
              </div>
            ) : (
              <>
                <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
                      Duplicate access from
                    </span>
                    <MenuSelect
                      id="create-copy"
                      value={copyFromCreateId}
                      onChange={setCopyFromCreateId}
                      placeholder="Choose existing user..."
                      options={[
                        { value: "", label: "Choose existing user..." },
                        ...users
                          .filter((u) => !u.isPrimary)
                          .map((u) => ({ value: String(u.id), label: u.email })),
                      ]}
                    />
                  </label>
                  <button type="button" className={actionBtn} onClick={copyAccessToCreate}>
                    Duplicate access
                  </button>
                </div>
                <label className="mb-3 block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
                    Access template
                  </span>
                  <MenuSelect
                    id="create-template"
                    value={template}
                    onChange={(value) => {
                      const next = value as AccessTemplate;
                      setTemplate(next);
                      if (next !== "custom") setPermissions(TEMPLATE_PERMISSIONS[next]);
                    }}
                    options={[
                      { value: "messages", label: "Messages manager" },
                      { value: "content", label: "Content editor" },
                      { value: "testimonials", label: "Testimonials moderator" },
                      { value: "teamSupport", label: "Team support" },
                      { value: "custom", label: "Custom permissions" },
                    ]}
                  />
                </label>
                <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/55 p-3 sm:grid-cols-2">
                  {PERMISSION_OPTIONS.map((opt) => {
                    const checked = permissions.includes(opt.key);
                    return (
                      <label key={opt.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/80">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setTemplate("custom");
                            setPermissions((prev) =>
                              e.target.checked ? [...new Set([...prev, opt.key])] : prev.filter((p) => p !== opt.key)
                            );
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void createUser()} className={cn(actionBtn, "bg-primary text-primary-foreground hover:bg-primary/90")}>
            <UserPlus className="size-4 shrink-0" />
            Create user
          </button>
          {createOk ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{createOk}</p> : null}
          {createError ? (
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{createError}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm  sm:p-8">
        <h4 className="font-display text-lg font-semibold tracking-tight">People ({loading ? "…" : users.length})</h4>
        <ul className="mt-6 divide-y divide-border/40">
          {loading ? (
            <li className="py-6 text-sm text-foreground/55">Loading…</li>
          ) : users.length === 0 ? (
            <li className="py-6 text-sm text-foreground/55">No users yet.</li>
          ) : (
            users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{u.email}</p>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-foreground/45">
                    {u.roleLabel ?? (u.role === "messages" ? "Restricted (custom permissions)" : "Owner (full dashboard)")}
                  </p>
                  {u.permissions.length > 0 ? (
                    <p className="mt-1 text-xs text-foreground/50">
                      {u.permissions.join(", ")}
                    </p>
                  ) : null}
                  {u.isPrimary ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">Primary admin</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!u.isPrimary ? (
                    <button
                      type="button"
                      onClick={() => startEdit(u)}
                      className={actionBtn}
                      disabled={busyId === u.id}
                    >
                      Edit access
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === u.id || Boolean(u.isPrimary)}
                    onClick={() => void remove(u)}
                    className={dangerBtn}
                  >
                    <Trash2 className="size-4 shrink-0" />
                    Remove
                  </button>
                </div>
                {editingId === u.id ? (
                  <div className="mt-3 w-full rounded-2xl border border-border/60 bg-background/65 p-3">
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
                          Duplicate access from
                        </span>
                        <MenuSelect
                          id={`edit-copy-${u.id}`}
                          value={copyFromEditId}
                          onChange={setCopyFromEditId}
                          placeholder="Choose existing user..."
                          options={[
                            { value: "", label: "Choose existing user..." },
                            ...users
                              .filter((x) => x.id !== u.id && !x.isPrimary)
                              .map((x) => ({ value: String(x.id), label: x.email })),
                          ]}
                        />
                      </label>
                      <button type="button" className={actionBtn} onClick={() => copyAccessToEdit(u.id)}>
                        Duplicate access
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
                          Role
                        </span>
                        <MenuSelect
                          id={`edit-role-${u.id}`}
                          value={editRole}
                          onChange={(value) => setEditRole(value as "owner" | "messages")}
                          options={[
                            { value: "messages", label: "Restricted (custom permissions)" },
                            { value: "owner", label: "Owner (full dashboard)" },
                          ]}
                        />
                      </label>
                      {editRole === "messages" ? (
                        <label className="block">
                          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
                            Access template
                          </span>
                          <MenuSelect
                            id={`edit-template-${u.id}`}
                            value={editTemplate}
                            onChange={(value) => {
                              const next = value as AccessTemplate;
                              setEditTemplate(next);
                              if (next !== "custom") setEditPermissions(TEMPLATE_PERMISSIONS[next]);
                            }}
                            options={[
                              { value: "messages", label: "Messages manager" },
                              { value: "content", label: "Content editor" },
                              { value: "testimonials", label: "Testimonials moderator" },
                              { value: "teamSupport", label: "Team support" },
                              { value: "custom", label: "Custom permissions" },
                            ]}
                          />
                        </label>
                      ) : null}
                    </div>
                    {editRole === "messages" ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {PERMISSION_OPTIONS.map((opt) => {
                          const checked = editPermissions.includes(opt.key);
                          return (
                            <label key={`edit-${u.id}-${opt.key}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/80">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setEditTemplate("custom");
                                  setEditPermissions((prev) =>
                                    e.target.checked
                                      ? [...new Set([...prev, opt.key])]
                                      : prev.filter((p) => p !== opt.key)
                                  );
                                }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" className={cn(actionBtn, "bg-primary text-primary-foreground")} onClick={() => void saveEdit(u)}>
                        Save access
                      </button>
                      <button type="button" className={actionBtn} onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
