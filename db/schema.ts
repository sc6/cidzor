import { pgTable, serial, text, timestamp, boolean, varchar, integer, primaryKey } from 'drizzle-orm/pg-core';

export const cidzorArticles = pgTable('cidzor_articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  body: text('body').notNull(), // Markdown content
  author: varchar('author', { length: 100 }),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cidzorTags = pgTable('cidzor_tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cidzorArticleTags = pgTable('cidzor_article_tags', {
  articleId: integer('article_id').notNull().references(() => cidzorArticles.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => cidzorTags.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
  };
});

export type Article = typeof cidzorArticles.$inferSelect;
export type NewArticle = typeof cidzorArticles.$inferInsert;
export type Tag = typeof cidzorTags.$inferSelect;
export type NewTag = typeof cidzorTags.$inferInsert;
export type ArticleTag = typeof cidzorArticleTags.$inferSelect;
export type NewArticleTag = typeof cidzorArticleTags.$inferInsert;
