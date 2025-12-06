import Link from "next/link";
import Header from "./components/Header";
import { getPublishedArticles } from "@/db/articles";

// Force dynamic rendering since we fetch from database
export const dynamic = 'force-dynamic';

export default async function Home() {
  const games = [
    {
      title: "Merger",
      description: "A physics-based ball merging game",
      href: "/apps/merger",
      tags: ["Physics", "Puzzle"],
    },
    {
      title: "Snake",
      description: "Control the square and eat balls to grow your tail",
      href: "/apps/snake",
      tags: ["Classic", "Arcade"],
    },
  ];

  const apps = [
    {
      title: "Texas Hold 'Em Poker Pot Odds Puzzle",
      description: "Test your poker pot odds calculation skills",
      href: "/apps/poker-pot-odds-puzzle",
      tags: ["Puzzle", "Strategy"],
    },
    {
      title: "Simigram",
      description: "Easily create chat channels and share chats without logging in",
      href: "https://simigram.com",
      tags: ["Communication", "Social"],
      external: true,
    },
    {
      title: "StringTypes",
      description: "Organize contacts by interest",
      href: "https://stringtypes.com",
      tags: ["Productivity", "Social"],
      external: true,
    },
    {
      title: "1kChallenger",
      description: "Create your own $1k challenge and track your project progress",
      href: "https://1kchallenger.com",
      tags: ["Productivity", "Goals"],
      external: true,
    },
    {
      title: "CardsEverywhere",
      description: "Save and organize bookmarks by tab, share with others",
      href: "https://cardseverywhere.com",
      tags: ["Productivity", "Organization"],
      external: true,
    },
  ];

  // Fetch articles from database
  const dbArticles = await getPublishedArticles();

  const articles = dbArticles.map((article) => ({
    title: article.title,
    description: article.description || '',
    href: `/articles/${article.id}/${article.slug}`,
    date: article.createdAt.toISOString(),
    tags: article.tags,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header showBackButton={false} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to cidzor
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
            Explore my portfolio of games, technical articles, and creative projects.
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

        {/* Apps Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Apps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <Link
                key={app.href}
                href={app.href}
                target={app.external ? "_blank" : undefined}
                rel={app.external ? "noopener noreferrer" : undefined}
                className="group block p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg"
              >
                <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {app.title}
                  {app.external && (
                    <span className="ml-2 text-sm text-slate-400">↗</span>
                  )}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {app.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {app.tags.map((tag) => (
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
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      {article.description}
                    </p>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
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
