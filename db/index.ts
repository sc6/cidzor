import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sslConfig = process.env.DB_SSL === 'true' ? {
  ssl: { rejectUnauthorized: false }
} : {};

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`;

// For query purposes
const queryClient = postgres(connectionString, sslConfig);
export const db = drizzle(queryClient, { schema });

// For migrations
export const migrationClient = postgres(connectionString, { max: 1, ...sslConfig });
