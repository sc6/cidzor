import { notFound } from 'next/navigation';
import { getArticleById } from '@/db/articles';
import Header from '@/app/components/Header';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to create URL-friendly slugs from heading text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    return {
      title: 'Article Not Found',
    };
  }

  const article = await getArticleById(articleId);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    notFound();
  }

  const article = await getArticleById(articleId);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header showBackButton={true} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {article.title}
            </h1>

            {article.description && (
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">
                {article.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
              {article.author && (
                <span>By {article.author}</span>
              )}
              <span>•</span>
              <time dateTime={article.createdAt.toISOString()}>
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, children, ...props}) => {
                  const text = children?.toString() || '';
                  const id = slugify(text);
                  return <h1 id={id} className="text-4xl font-bold mb-6 mt-8 text-slate-900 dark:text-slate-100 scroll-mt-20" {...props}>{children}</h1>;
                },
                h2: ({node, children, ...props}) => {
                  const text = children?.toString() || '';
                  const id = slugify(text);
                  return <h2 id={id} className="text-3xl font-bold mb-4 mt-8 text-slate-900 dark:text-slate-100 scroll-mt-20" {...props}>{children}</h2>;
                },
                h3: ({node, children, ...props}) => {
                  const text = children?.toString() || '';
                  const id = slugify(text);
                  return <h3 id={id} className="text-2xl font-semibold mb-3 mt-6 text-slate-900 dark:text-slate-100 scroll-mt-20" {...props}>{children}</h3>;
                },
                h4: ({node, children, ...props}) => {
                  const text = children?.toString() || '';
                  const id = slugify(text);
                  return <h4 id={id} className="text-xl font-semibold mb-2 mt-4 text-slate-900 dark:text-slate-100 scroll-mt-20" {...props}>{children}</h4>;
                },
                p: ({node, children, ...props}) => {
                  // Check if this is the first paragraph (TOC) by checking if it starts with a link and contains bullets
                  const hasLinks = Array.isArray(children) && children.some((child: any) => child?.type === 'a');
                  const textContent = children?.toString() || '';
                  const hasBullets = textContent.includes('•');
                  const isTOC = hasLinks && hasBullets && (textContent.includes('Overview') || textContent.includes('Key Facts'));

                  if (isTOC) {
                    return (
                      <p className="mb-6 p-4 text-sm leading-relaxed text-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" {...props}>
                        {children}
                      </p>
                    );
                  }
                  return <p className="mb-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300" {...props} />;
                },
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />,
                a: ({node, href, ...props}) => (
                  <a
                    href={href}
                    className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    {...props}
                  />
                ),
                strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />,
                em: ({node, ...props}) => <em className="italic text-slate-700 dark:text-slate-300" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-2 my-4 italic text-slate-600 dark:text-slate-400" {...props} />
                ),
                code: ({node, inline, ...props}: any) =>
                  inline ? (
                    <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200" {...props} />
                  ) : (
                    <code className="block bg-slate-900 dark:bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm font-mono text-slate-100" {...props} />
                  ),
                pre: ({node, ...props}) => <pre className="mb-4 overflow-x-auto" {...props} />,
                hr: ({node, ...props}) => <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />,
              }}
            >
              {article.body}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
