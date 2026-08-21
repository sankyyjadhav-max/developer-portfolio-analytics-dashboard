import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Portfolio Builder",
    description:
      "Build and edit your professional developer profile with a clean, modern interface.",
  },
  {
    number: "02",
    title: "Dynamic URLs",
    description:
      "Share one clean public URL for your portfolio and make your profile easy to discover.",
  },
  {
    number: "03",
    title: "Real Analytics",
    description:
      "Track portfolio views and project interactions from real visitors.",
  },
  {
    number: "04",
    title: "Project Insights",
    description:
      "Understand which projects attract the most attention from your visitors.",
  },
  {
    number: "05",
    title: "Privacy Focused",
    description:
      "Use anonymous visitor and session identifiers for privacy-friendly analytics.",
  },
  {
    number: "06",
    title: "PDF Reports",
    description:
      "Export a clean performance report for your developer portfolio.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-white">
      {/* Navigation */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Dev<span className="text-violet-400">Pulse</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Create portfolio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute left-1/2 top-0 -z-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-28 lg:px-8 lg:pb-36 lg:pt-36">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-sm font-medium text-violet-300">
              Developer Portfolio Analytics
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Build your portfolio.
              <br />
              <span className="text-gray-400">
                Understand your audience.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl">
              Create a premium developer portfolio, publish it with a unique
              URL, and turn real visitor activity into useful insights with
              privacy-friendly anonymous analytics.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-500"
              >
                Start building →
              </Link>

              <a
                href="#features"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-gray-200 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                Explore features
              </a>
            </div>
          </div>

          {/* Small stats */}
          <div className="mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["01", "Create"],
              ["02", "Customize"],
              ["03", "Publish"],
              ["04", "Analyze"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
              >
                <div className="text-sm font-semibold text-violet-400">
                  {number}
                </div>
                <div className="mt-2 text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-white/10 bg-[#0b0c0f]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Features
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to present your work.
            </h2>

            <p className="mt-4 text-lg leading-8 text-gray-400">
              Build a professional developer presence and understand how
              people interact with your work.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="group rounded-2xl border border-white/10 bg-[#101217] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-[#13151b]"
              >
                <div className="text-sm font-semibold text-violet-400">
                  {feature.number}
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="rounded-3xl border border-violet-400/20 bg-violet-500/[0.06] px-6 py-16 text-center sm:px-12">
            <div className="mx-auto max-w-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                Get started
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Turn your work into a professional presence.
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-400">
                Create your portfolio, publish it with a unique URL, and
                understand how visitors interact with your work.
              </p>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  Create your portfolio →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            © {new Date().getFullYear()} DevPulse
          </div>

          <div>
            Developer Portfolio Analytics
          </div>
        </div>
      </footer>
    </main>
  );
}