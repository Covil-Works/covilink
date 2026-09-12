import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

async function verify() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    // Verifica tabelas e contagem de registros de forma segura e somente-leitura

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('=== Status Atual das Tabelas no Neon PostgreSQL ===');
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT count(*) as count FROM "${row.table_name}";`);
      console.log(`✓ Tabela ${row.table_name}: ${countRes.rows[0].count} registros`);
    }
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

verify();
