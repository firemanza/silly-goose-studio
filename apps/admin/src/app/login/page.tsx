import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
      <section className="relative hidden overflow-hidden border-r border-black/8 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(193,78,40,0.18),transparent_30%),linear-gradient(160deg,rgba(255,255,255,0.55),rgba(244,235,220,0.78))]" />
        <div className="relative">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[color:var(--color-muted)]">
            Silly Goose Studio
          </p>
          <h1 className="mt-6 max-w-xl text-6xl font-semibold leading-[0.95] tracking-tight text-[color:var(--color-ink)]">
            Private portal for the working archive.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[color:var(--color-muted)]">
            Manage published work, upload new frames, and retire older shots without touching the public site code.
          </p>
        </div>

        <div className="relative grid max-w-2xl grid-cols-3 gap-4">
          <div className="rounded-[2rem] border bg-white/80 p-4 shadow-[0_20px_50px_rgba(32,26,21,0.08)]">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Categories
            </p>
            <p className="mt-4 text-3xl font-semibold">4</p>
          </div>
          <div className="rounded-[2rem] border bg-white/80 p-4 shadow-[0_20px_50px_rgba(32,26,21,0.08)]">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Workflow
            </p>
            <p className="mt-4 text-3xl font-semibold">Draft</p>
          </div>
          <div className="rounded-[2rem] border bg-white/80 p-4 shadow-[0_20px_50px_rgba(32,26,21,0.08)]">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Removal
            </p>
            <p className="mt-4 text-3xl font-semibold">Archive</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-[2rem] border bg-white/85 p-7 shadow-[0_30px_80px_rgba(32,26,21,0.12)] backdrop-blur">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
            Admin Access
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--color-ink)]">
            Sign in to the portal
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
            Only approved studio accounts can manage uploads, categories, titles, and archive state.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
