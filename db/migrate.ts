import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sslConfig = process.env.DB_SSL === 'true' ? {
  ssl: { rejectUnauthorized: false }
} : {};

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`;

const sql = postgres(connectionString, sslConfig);

async function migrate() {
  try {
    console.log('Creating cidzor_articles table...');

    await sql`
      CREATE TABLE IF NOT EXISTS cidzor_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        body TEXT NOT NULL,
        author VARCHAR(100),
        published BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('✓ Table cidzor_articles created successfully!');

    // Create an index on slug for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_cidzor_articles_slug ON cidzor_articles(slug)
    `;

    console.log('✓ Index on slug created successfully!');

    // Create an index on published for filtering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_cidzor_articles_published ON cidzor_articles(published)
    `;

    console.log('✓ Index on published created successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
