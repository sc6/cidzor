import Link from "next/link";

export default function WIP() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Work in Progress
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            A new game is coming soon...
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              This game is under construction
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-slate-600 dark:text-slate-400">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
