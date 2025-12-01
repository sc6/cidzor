import Link from "next/link";
import Logo from "./Logo";

export default function Header({ showBackButton = true, forceReload = false }: { showBackButton?: boolean; forceReload?: boolean }) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {showBackButton ? (
          forceReload ? (
            <a
              href="/"
              className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:underline w-fit"
            >
              <Logo className="w-8 h-8" />
              <span>← Back to Home</span>
            </a>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:underline w-fit"
            >
              <Logo className="w-8 h-8" />
              <span>← Back to Home</span>
            </Link>
          )
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Logo className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                cidzor
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              A collection of apps, articles, and experiments
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
