export default function PwaInstallPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Install Ademy on your phone</h1>
          <p className="text-muted-foreground text-lg">
            Add the Ademy dashboard to your home screen for faster access, offline support, and an app-like experience.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">iPhone (Safari)</h2>
            <p className="text-muted-foreground mb-4">
              Open Ademy in Safari, then follow these steps:
            </p>
            <div className="grid gap-3 text-sm text-foreground/90">
              <div className="rounded-lg border border-border p-3">1. Tap the Share button (square with arrow).</div>
              <div className="rounded-lg border border-border p-3">2. Choose “Add to Home Screen”.</div>
              <div className="rounded-lg border border-border p-3">3. Confirm “Add”.</div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Android (Chrome)</h2>
            <p className="text-muted-foreground mb-4">
              Open Ademy in Chrome, then:
            </p>
            <div className="grid gap-3 text-sm text-foreground/90">
              <div className="rounded-lg border border-border p-3">1. Tap the three-dot menu.</div>
              <div className="rounded-lg border border-border p-3">2. Tap “Install app” or “Add to Home screen”.</div>
              <div className="rounded-lg border border-border p-3">3. Confirm installation.</div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Already installed?</h2>
            <p className="text-muted-foreground">
              You can open Ademy from your home screen just like a regular app.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
