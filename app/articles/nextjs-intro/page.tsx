import Header from "../../components/Header";

export default function NextJsIntro() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <article className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Getting Started with Next.js
          </h1>
          <time className="text-slate-600 dark:text-slate-400">
            January 15, 2024
          </time>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                What is Next.js?
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Next.js is a powerful React framework that enables you to build full-stack web applications.
                It provides features like server-side rendering, static site generation, and API routes out of the box.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Key Features
              </h2>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span><strong>App Router:</strong> A new paradigm for building applications with React Server Components</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span><strong>Server Components:</strong> Render components on the server for better performance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span><strong>File-based Routing:</strong> Intuitive routing based on your file structure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span><strong>API Routes:</strong> Build your backend API alongside your frontend code</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Creating Your First Next.js App
              </h2>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <code className="text-sm text-slate-900 dark:text-slate-100">
                  npx create-next-app@latest my-app
                </code>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                This command creates a new Next.js application with all the necessary configuration and dependencies.
                You'll be prompted to choose options like TypeScript, ESLint, and Tailwind CSS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Conclusion
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Next.js makes it easy to build modern web applications with React. Whether you're building a simple
                static site or a complex full-stack application, Next.js provides the tools you need to succeed.
              </p>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
