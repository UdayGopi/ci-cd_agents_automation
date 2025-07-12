import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error("Available environment variables:", Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('DB')
  ));
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("🔌 Connecting to database...");
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Test database connection on startup
const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

// Only test connection in production to avoid issues during build
if (process.env.NODE_ENV === 'production') {
  testConnection().catch(console.error);
}