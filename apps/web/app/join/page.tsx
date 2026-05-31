import { JoinSessionForm } from "@/components/join-session-form";

export default function JoinPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="max-w-2xl">
          <p className="ddn-kicker text-[var(--accent-amber)]">Async Session Foundation</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em]">
            Short-code rooms for the part of game night that happens three time zones apart.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--text-secondary)]">
            This is the first backend seam from the technical design: create a lobby, join by
            six-character code, and keep the contract shape stable while the persistent store and
            turn engine catch up.
          </p>
        </section>
        <JoinSessionForm />
      </div>
    </main>
  );
}
