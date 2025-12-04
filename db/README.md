# Database

This directory contains the database schema, migrations, and utility functions for the Cidzor application.

## Setup

The database is configured to use PostgreSQL with Drizzle ORM. Connection details are stored in `.env.local`.

## Schema

### cidzor_articles

Stores article content with the following fields:

- `id` - Auto-incrementing primary key
- `title` - Article title (max 255 chars)
- `slug` - Unique URL-friendly identifier (max 255 chars)
- `description` - Short description/summary
- `body` - Article content in Markdown format
- `author` - Author name (max 100 chars)
- `published` - Boolean flag for publication status
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### cidzor_tags

Stores unique tags with the following fields:

- `id` - Auto-incrementing primary key
- `name` - Tag name (max 50 chars, unique)
- `slug` - URL-friendly identifier (max 50 chars, unique)
- `created_at` - Timestamp of creation

### cidzor_article_tags

Junction table for many-to-many relationship between articles and tags:

- `article_id` - Foreign key to cidzor_articles (cascades on delete)
- `tag_id` - Foreign key to cidzor_tags (cascades on delete)
- Composite primary key on (article_id, tag_id)

## Usage

### Import the utility functions

```typescript
import {
  getPublishedArticles,
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleArticlePublished,
  getArticlesByTag,
  getAllTags,
  getTagCounts,
  getOrCreateTag,
  getTagBySlug,
  deleteTag,
  type ArticleWithTags,
  type Tag
} from '@/db/articles';
```

### Example: Fetch all published articles

```typescript
const articles = await getPublishedArticles();
// Returns: ArticleWithTags[] - each article includes its tags
```

### Example: Get a specific article by slug

```typescript
const article = await getArticleBySlug('nextjs-intro');
// Returns: ArticleWithTags | undefined
```

### Example: Create a new article with tags

```typescript
const newArticle = await createArticle(
  {
    title: 'My New Article',
    slug: 'my-new-article',
    description: 'A short description',
    body: '# Article Title\n\nMarkdown content here...',
    author: 'John Doe',
    published: false
  },
  ['nextjs', 'typescript', 'tutorial'] // Tag names
);
// Tags are automatically created if they don't exist
```

### Example: Update an article with new tags

```typescript
const updated = await updateArticle(
  1,
  {
    title: 'Updated Title',
    body: '# New content...'
  },
  ['react', 'nextjs'] // New tags (replaces existing tags)
);
```

### Example: Update article without changing tags

```typescript
const updated = await updateArticle(
  1,
  { title: 'Updated Title' }
  // Don't pass tagNames parameter to keep existing tags
);
```

### Example: Publish an article

```typescript
await toggleArticlePublished(1, true);
```

### Example: Get articles by tag

```typescript
const articles = await getArticlesByTag('nextjs');
// Pass the tag slug, not the tag name
```

### Example: Get all tags

```typescript
const tags = await getAllTags();
// Returns: Tag[] - array of tag objects { id, name, slug, createdAt }
```

### Example: Get tag usage counts

```typescript
const tagCounts = await getTagCounts();
// Returns: Array<{ tag: Tag, count: number }>
// Sorted by usage count (descending)
```

### Example: Get or create a tag

```typescript
const tag = await getOrCreateTag('TypeScript');
// Returns existing tag or creates a new one
```

### Example: Get a tag by slug

```typescript
const tag = await getTagBySlug('typescript');
// Returns: Tag | undefined
```

### Example: Delete a tag

```typescript
await deleteTag(5);
// Cascade deletes all article associations
```

## Type Definitions

### ArticleWithTags

```typescript
interface ArticleWithTags extends Article {
  tags: Tag[];
}
```

### Tag

```typescript
interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
}
```

## Scripts

- `npm run db:push` - Push schema changes to the database
- `npm run db:generate` - Generate migrations from schema
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Migrations

### Initial setup

```bash
npx tsx db/migrate.ts
```

### Add tags structure (normalized)

```bash
npx tsx db/migrate-tags.ts
```

This migration:
- Creates `cidzor_tags` table
- Creates `cidzor_article_tags` junction table
- Migrates any existing tag data
- Creates indexes for optimal query performance
