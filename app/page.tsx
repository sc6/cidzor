import Link from "next/link";

export default function Home() {
  const games = [
    {
      title: "Merger",
      description: "A physics-based ball merging game",
      href: "/apps/merger",
      tags: ["Physics", "Puzzle"],
    },
    {
      title: "WIP",
      description: "New game coming soon...",
      href: "/apps/wip",
      tags: ["Coming Soon"],
    },
  ];

  const articles = [
    {
      title: "Getting Started with Next.js",
      description: "Learn the basics of Next.js and React",
      href: "/articles/nextjs-intro",
      date: "2024-01-15",
    },
    {
      title: "TypeScript Best Practices",
      description: "Tips for writing better TypeScript code",
      href: "/articles/typescript-tips",
      date: "2024-01-10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            cidzor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            A collection of apps, articles, and experiments
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to cidzor
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
            Explore my portfolio of games, technical articles, and creative projects.
            Each piece is crafted to learn, experiment, and share knowledge.
          </p>
        </section>

        {/* Games Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Games
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link
                key={game.href}
                href={game.href}
                className="group block p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg"
              >
                <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {game.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {game.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Articles Section */}
        <section>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Articles
          </h3>
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="group block p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {article.description}
                    </p>
                  </div>
                  <time className="text-sm text-slate-500 dark:text-slate-500 whitespace-nowrap ml-4">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
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
