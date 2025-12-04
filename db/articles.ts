import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { db } from './index';
import { cidzorArticles, cidzorTags, cidzorArticleTags, type Article, type NewArticle, type Tag } from './schema';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface ArticleWithTags extends Article {
  tags: Tag[];
}

/**
 * Get all published articles with their tags, sorted by creation date (newest first)
 */
export async function getPublishedArticles(): Promise<ArticleWithTags[]> {
  const articles = await db
    .select()
    .from(cidzorArticles)
    .where(eq(cidzorArticles.published, true))
    .orderBy(desc(cidzorArticles.createdAt));

  return await Promise.all(articles.map(async (article) => ({
    ...article,
    tags: await getArticleTags(article.id),
  })));
}

/**
 * Get all articles (including unpublished) with their tags, sorted by creation date (newest first)
 */
export async function getAllArticles(): Promise<ArticleWithTags[]> {
  const articles = await db
    .select()
    .from(cidzorArticles)
    .orderBy(desc(cidzorArticles.createdAt));

  return await Promise.all(articles.map(async (article) => ({
    ...article,
    tags: await getArticleTags(article.id),
  })));
}

/**
 * Get a single article by slug with its tags
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithTags | undefined> {
  const articles = await db
    .select()
    .from(cidzorArticles)
    .where(eq(cidzorArticles.slug, slug))
    .limit(1);

  if (!articles[0]) return undefined;

  const tags = await getArticleTags(articles[0].id);
  return { ...articles[0], tags };
}

/**
 * Get a single article by ID with its tags
 */
export async function getArticleById(id: number): Promise<ArticleWithTags | undefined> {
  const articles = await db
    .select()
    .from(cidzorArticles)
    .where(eq(cidzorArticles.id, id))
    .limit(1);

  if (!articles[0]) return undefined;

  const tags = await getArticleTags(id);
  return { ...articles[0], tags };
}

/**
 * Get all tags for a specific article
 */
export async function getArticleTags(articleId: number): Promise<Tag[]> {
  const result = await db
    .select({ tag: cidzorTags })
    .from(cidzorArticleTags)
    .innerJoin(cidzorTags, eq(cidzorArticleTags.tagId, cidzorTags.id))
    .where(eq(cidzorArticleTags.articleId, articleId));

  return result.map((r) => r.tag);
}

/**
 * Find or create a tag by name
 */
async function findOrCreateTag(tagName: string): Promise<Tag> {
  const tagSlug = slugify(tagName);

  // Try to find existing tag
  const existing = await db
    .select()
    .from(cidzorTags)
    .where(eq(cidzorTags.name, tagName))
    .limit(1);

  if (existing[0]) return existing[0];

  // Create new tag
  const [newTag] = await db
    .insert(cidzorTags)
    .values({ name: tagName, slug: tagSlug })
    .returning();

  return newTag;
}

/**
 * Associate tags with an article
 */
async function setArticleTags(articleId: number, tagNames: string[]): Promise<void> {
  // Remove existing associations
  await db
    .delete(cidzorArticleTags)
    .where(eq(cidzorArticleTags.articleId, articleId));

  if (tagNames.length === 0) return;

  // Find or create all tags
  const tags = await Promise.all(tagNames.map((name) => findOrCreateTag(name)));

  // Create new associations
  await db.insert(cidzorArticleTags).values(
    tags.map((tag) => ({
      articleId,
      tagId: tag.id,
    }))
  );
}

/**
 * Create a new article with tags
 */
export async function createArticle(
  article: Omit<NewArticle, 'createdAt' | 'updatedAt'>,
  tagNames: string[] = []
): Promise<ArticleWithTags> {
  const [newArticle] = await db
    .insert(cidzorArticles)
    .values({
      ...article,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  await setArticleTags(newArticle.id, tagNames);

  const tags = await getArticleTags(newArticle.id);
  return { ...newArticle, tags };
}

/**
 * Update an existing article by ID
 */
export async function updateArticle(
  id: number,
  updates: Partial<Omit<NewArticle, 'createdAt' | 'updatedAt'>>,
  tagNames?: string[]
): Promise<ArticleWithTags | undefined> {
  const [updated] = await db
    .update(cidzorArticles)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(cidzorArticles.id, id))
    .returning();

  if (!updated) return undefined;

  if (tagNames !== undefined) {
    await setArticleTags(id, tagNames);
  }

  const tags = await getArticleTags(id);
  return { ...updated, tags };
}

/**
 * Delete an article by ID
 */
export async function deleteArticle(id: number): Promise<boolean> {
  const result = await db
    .delete(cidzorArticles)
    .where(eq(cidzorArticles.id, id))
    .returning();

  return result.length > 0;
}

/**
 * Publish or unpublish an article
 */
export async function toggleArticlePublished(
  id: number,
  published: boolean
): Promise<ArticleWithTags | undefined> {
  return updateArticle(id, { published });
}

/**
 * Get all published articles with a specific tag
 */
export async function getArticlesByTag(tagSlug: string): Promise<ArticleWithTags[]> {
  const tag = await db
    .select()
    .from(cidzorTags)
    .where(eq(cidzorTags.slug, tagSlug))
    .limit(1);

  if (!tag[0]) return [];

  const articleIds = await db
    .select({ articleId: cidzorArticleTags.articleId })
    .from(cidzorArticleTags)
    .where(eq(cidzorArticleTags.tagId, tag[0].id));

  if (articleIds.length === 0) return [];

  const articles = await db
    .select()
    .from(cidzorArticles)
    .where(
      and(
        eq(cidzorArticles.published, true),
        inArray(cidzorArticles.id, articleIds.map((a) => a.articleId))
      )
    )
    .orderBy(desc(cidzorArticles.createdAt));

  return await Promise.all(articles.map(async (article) => ({
    ...article,
    tags: await getArticleTags(article.id),
  })));
}

/**
 * Get all tags used in published articles
 */
export async function getAllTags(): Promise<Tag[]> {
  const tags = await db
    .selectDistinct({ tag: cidzorTags })
    .from(cidzorTags)
    .innerJoin(cidzorArticleTags, eq(cidzorTags.id, cidzorArticleTags.tagId))
    .innerJoin(cidzorArticles, eq(cidzorArticleTags.articleId, cidzorArticles.id))
    .where(eq(cidzorArticles.published, true))
    .orderBy(cidzorTags.name);

  return tags.map((t) => t.tag);
}

/**
 * Get tag usage counts for published articles
 */
export async function getTagCounts(): Promise<Array<{ tag: Tag; count: number }>> {
  const result = await db
    .select({
      tag: cidzorTags,
      count: sql<number>`count(${cidzorArticleTags.articleId})::int`,
    })
    .from(cidzorTags)
    .innerJoin(cidzorArticleTags, eq(cidzorTags.id, cidzorArticleTags.tagId))
    .innerJoin(cidzorArticles, eq(cidzorArticleTags.articleId, cidzorArticles.id))
    .where(eq(cidzorArticles.published, true))
    .groupBy(cidzorTags.id)
    .orderBy(desc(sql`count(${cidzorArticleTags.articleId})`));

  return result;
}

/**
 * Get or create a tag by name
 */
export async function getOrCreateTag(tagName: string): Promise<Tag> {
  return findOrCreateTag(tagName);
}

/**
 * Get a tag by slug
 */
export async function getTagBySlug(slug: string): Promise<Tag | undefined> {
  const tags = await db
    .select()
    .from(cidzorTags)
    .where(eq(cidzorTags.slug, slug))
    .limit(1);

  return tags[0];
}

/**
 * Delete a tag by ID (will cascade delete all article associations)
 */
export async function deleteTag(id: number): Promise<boolean> {
  const result = await db
    .delete(cidzorTags)
    .where(eq(cidzorTags.id, id))
    .returning();

  return result.length > 0;
}
