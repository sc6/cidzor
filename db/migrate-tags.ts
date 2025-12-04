import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sslConfig = process.env.DB_SSL === 'true' ? {
  ssl: { rejectUnauthorized: false }
} : {};

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`;

const sql = postgres(connectionString, sslConfig);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function migrateTags() {
  try {
    console.log('Creating cidzor_tags table...');

    await sql`
      CREATE TABLE IF NOT EXISTS cidzor_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        slug VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('✓ Table cidzor_tags created successfully!');

    console.log('Creating cidzor_article_tags junction table...');

    await sql`
      CREATE TABLE IF NOT EXISTS cidzor_article_tags (
        article_id INTEGER NOT NULL REFERENCES cidzor_articles(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES cidzor_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
      )
    `;

    console.log('✓ Table cidzor_article_tags created successfully!');

    // Migrate existing tags from the tags array to the new structure
    console.log('Migrating existing tags from articles...');

    const articles = await sql`
      SELECT id, tags FROM cidzor_articles WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    `;

    const tagMap = new Map<string, number>();

    // First, collect all unique tags and insert them into cidzor_tags
    for (const article of articles) {
      if (article.tags && Array.isArray(article.tags)) {
        for (const tagName of article.tags) {
          if (!tagMap.has(tagName)) {
            const tagSlug = slugify(tagName);
            const [tag] = await sql`
              INSERT INTO cidzor_tags (name, slug)
              VALUES (${tagName}, ${tagSlug})
              ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
              RETURNING id
            `;
            tagMap.set(tagName, tag.id);
          }
        }
      }
    }

    console.log(`✓ Inserted ${tagMap.size} unique tags`);

    // Now create the relationships in cidzor_article_tags
    let relationshipCount = 0;
    for (const article of articles) {
      if (article.tags && Array.isArray(article.tags)) {
        for (const tagName of article.tags) {
          const tagId = tagMap.get(tagName);
          if (tagId) {
            await sql`
              INSERT INTO cidzor_article_tags (article_id, tag_id)
              VALUES (${article.id}, ${tagId})
              ON CONFLICT DO NOTHING
            `;
            relationshipCount++;
          }
        }
      }
    }

    console.log(`✓ Created ${relationshipCount} article-tag relationships`);

    // Drop the old tags array column
    console.log('Removing old tags array column...');
    await sql`
      ALTER TABLE cidzor_articles DROP COLUMN IF EXISTS tags
    `;

    console.log('✓ Old tags column removed successfully!');

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_cidzor_tags_slug ON cidzor_tags(slug)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cidzor_article_tags_article_id ON cidzor_article_tags(article_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cidzor_article_tags_tag_id ON cidzor_article_tags(tag_id)
    `;

    console.log('✓ Indexes created successfully!');

    console.log('\n✅ Tag migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrateTags();
