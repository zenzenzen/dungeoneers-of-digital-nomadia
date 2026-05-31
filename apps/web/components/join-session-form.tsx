"use client";

import { useState, useTransition } from "react";

type JoinResult = {
  code: string;
  members: Array<{ displayName: string; seat: number }>;
} | null;

export function JoinSessionForm() {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [result, setResult] = useState<JoinResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const payload = Object.fromEntries(formData.entries());
      const endpoint =
        mode === "create" ? "/api/sessions" : `/api/sessions/${String(payload.code)}/join`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something collapsed in the handoff.");
        setResult(null);
        return;
      }

      setResult({
        code: data.code,
        members: data.members,
      });
    });
  }

  return (
    <div className="ddn-panel rounded-[var(--radius-card)] p-6">
      <div className="mb-5 flex gap-2">
        {(["create", "join"] as const).map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setMode(entry)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              mode === entry
                ? "bg-[var(--accent-amber)] text-[var(--button-primary-text)]"
                : "border border-[var(--stroke-default)] text-[var(--text-secondary)]"
            }`}
          >
            {entry === "create" ? "Host a Room" : "Join by Code"}
          </button>
        ))}
      </div>
      <form action={handleSubmit} className="space-y-4">
        {mode === "join" ? (
          <label className="block">
            <span className="ddn-stat-label">Join Code</span>
            <input
              required
              name="code"
              className="mt-2 w-full rounded-2xl border border-[var(--stroke-default)] bg-[var(--surface-inset)] px-4 py-3 uppercase tracking-[0.18em] outline-none"
              placeholder="CRYPT7"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="ddn-stat-label">{mode === "create" ? "Host Name" : "Display Name"}</span>
          <input
            required
            name={mode === "create" ? "hostName" : "displayName"}
            className="mt-2 w-full rounded-2xl border border-[var(--stroke-default)] bg-[var(--surface-inset)] px-4 py-3 outline-none"
            placeholder="Barista Kyle"
          />
        </label>
        <label className="block">
          <span className="ddn-stat-label">Passphrase</span>
          <input
            required
            type="password"
            name="passphrase"
            className="mt-2 w-full rounded-2xl border border-[var(--stroke-default)] bg-[var(--surface-inset)] px-4 py-3 outline-none"
            placeholder="keep this weird but memorable"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-[var(--accent-amber)] px-5 py-3 text-sm font-semibold text-[var(--button-primary-text)] transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Working..." : mode === "create" ? "Create Session" : "Join Session"}
        </button>
      </form>
      {error ? <p className="mt-4 text-sm text-[var(--accent-red)]">{error}</p> : null}
      {result ? (
        <div className="mt-6 rounded-2xl border border-[var(--stroke-default)] bg-[var(--surface-elevated)] p-4">
          <p className="ddn-kicker text-[var(--accent-amber)]">Session Ready</p>
          <p className="mt-2 text-lg font-semibold">Code {result.code}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Seats currently filled: {result.members.map((member) => member.displayName).join(", ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
