import Link from "next/link";

export default function TypeScriptTips() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            TypeScript Best Practices
          </h1>
          <time className="text-slate-600 dark:text-slate-400">
            January 10, 2024
          </time>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Why TypeScript?
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                TypeScript adds static typing to JavaScript, helping you catch errors early and write more maintainable code.
                It's become the standard for modern web development, especially in large-scale applications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Essential Tips
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    1. Use Interface over Type when possible
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    Interfaces are more extensible and provide better error messages.
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <pre className="text-sm text-slate-900 dark:text-slate-100 overflow-x-auto">
{`interface User {
  name: string;
  email: string;
}

// Can be extended later
interface Admin extends User {
  role: string;
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    2. Enable Strict Mode
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    Always use strict mode in your tsconfig.json for maximum type safety.
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <pre className="text-sm text-slate-900 dark:text-slate-100 overflow-x-auto">
{`{
  "compilerOptions": {
    "strict": true
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    3. Use Type Inference
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    TypeScript is smart enough to infer types in many cases. Don't over-annotate!
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    4. Avoid 'any' Type
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Using 'any' defeats the purpose of TypeScript. Use 'unknown' or proper types instead.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Conclusion
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Following these best practices will help you write better TypeScript code that's easier to maintain
                and less prone to bugs. Start implementing these tips in your next project!
              </p>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
