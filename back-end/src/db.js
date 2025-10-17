// src/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Création du pool de connexions PostgreSQL
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // ⚙️ Si tu es hébergé sur un service type Render, Railway ou Supabase,
  // décommente la ligne ci-dessous :
  // ssl: { rejectUnauthorized: false },
});

/**
 * Exécute une requête simple (hors transaction)
 * @param {string} text - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise<QueryResult>}
 */
export async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
