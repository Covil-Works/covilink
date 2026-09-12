import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERRO: DATABASE_URL não configurada no ambiente (.env)');
    process.exit(1);
  }

  console.log('Conectando ao PostgreSQL / Neon DB...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log('Conexão estabelecida com sucesso!');

    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executando migração do schema (criando tabelas sem mock data)...');
    await client.query(sql);
    await client.query('ALTER TABLE portal_links ADD COLUMN IF NOT EXISTS has_blur BOOLEAN DEFAULT false;');

    console.log('Schema aplicado com sucesso!');

    // Verifica tabelas existentes
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nTabelas no banco de dados:');
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT count(*) as count FROM "${row.table_name}";`);
      console.log(`- ${row.table_name}: ${countRes.rows[0].count} registros`);
    }

    client.release();
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
