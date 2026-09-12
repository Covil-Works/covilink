import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { firebaseConfig } from './firebase';

export interface PostgresConfigDetails {
  isValid: boolean;
  error?: string;
  protocol?: string;
  host?: string;
  port?: string;
  database?: string;
  user?: string;
}

export interface DatabaseConnectionResult {
  isConnected: boolean;
  status: 'connected' | 'fallback_local' | 'disconnected' | 'error';
  databaseType: 'postgres' | 'firebase' | 'local_json' | 'none';
  message: string;
  details: {
    postgres?: {
      isConnected: boolean;
      host?: string;
      database?: string;
      error?: string;
    };
    firebase?: {
      isConnected: boolean;
      projectId?: string;
      authDomain?: string;
      error?: string;
    };
    localStorage?: {
      isConnected: boolean;
      directory?: string;
      error?: string;
    };
  };
  timestamp: string;
}

let pgPool: Pool | null = null;

/**
 * Retorna o pool de conexão do PostgreSQL (singleton).
 */
export function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || typeof connectionString !== 'string' || connectionString.trim() === '') {
    return null;
  }

  if (!pgPool) {
    pgPool = new Pool({
      connectionString: connectionString.trim(),
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pgPool.on('error', (err) => {
      console.error('[DB Pool Error]', err);
    });
  }

  return pgPool;
}

/**
 * Encerra o pool de conexão do PostgreSQL (útil para testes e encerramento gracioso).
 */
export async function closePgPool(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}



/**
 * Executa uma query SQL segura no PostgreSQL / Neon.
 */
export async function queryDb<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const pool = getPgPool();
  if (!pool) {
    throw new Error('DATABASE_URL não configurada');
  }

  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Valida o formato e estrutura da string de conexão do PostgreSQL / Neon DB.
 */
export function validateDatabaseUrl(url?: string): PostgresConfigDetails {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return {
      isValid: false,
      error: 'DATABASE_URL não foi informada ou está vazia.',
    };
  }

  const trimmed = url.trim();

  // Verifica protocolo
  if (!trimmed.startsWith('postgres://') && !trimmed.startsWith('postgresql://')) {
    return {
      isValid: false,
      error: 'Protocolo inválido. A URL de conexão deve iniciar com postgres:// ou postgresql://',
    };
  }

  try {
    const parsed = new URL(trimmed);
    const database = parsed.pathname ? parsed.pathname.replace(/^\//, '') : '';

    if (!parsed.hostname) {
      return {
        isValid: false,
        error: 'Hostname do banco de dados não encontrado na URL.',
      };
    }

    return {
      isValid: true,
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.hostname,
      port: parsed.port || '5432',
      database: database || undefined,
      user: parsed.username || undefined,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Formato de URL inválido: ${err?.message || 'Erro ao parsear DATABASE_URL'}`,
    };
  }
}

/**
 * Verifica se a variável DATABASE_URL está configurada e válida.
 */
export function isNeonDatabaseConnected(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false;
  const validation = validateDatabaseUrl(dbUrl);
  return validation.isValid;
}

/**
 * Checa o status da conexão com o banco de dados PostgreSQL / Neon.
 */
export async function checkPostgresConnection(connectionUrl?: string, checkLive = false): Promise<{
  isConnected: boolean;
  message: string;
  host?: string;
  database?: string;
  error?: string;
}> {
  const url = connectionUrl || process.env.DATABASE_URL;
  const validation = validateDatabaseUrl(url);

  if (!validation.isValid) {
    return {
      isConnected: false,
      message: validation.error || 'DATABASE_URL inválida',
      error: validation.error,
    };
  }

  if (checkLive) {
    try {
      const pool = getPgPool();
      if (pool) {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1 as health_check;');
        } finally {
          client.release();
        }
      }
    } catch (err: any) {
      return {
        isConnected: false,
        message: `Falha na conexão ativa com PostgreSQL: ${err?.message || 'Erro desconhecido'}`,
        host: validation.host,
        database: validation.database,
        error: err?.message,
      };
    }
  }

  return {
    isConnected: true,
    message: `Conexão configurada com sucesso para o host: ${validation.host}`,
    host: validation.host,
    database: validation.database,
  };
}

/**
 * Checa a configuração do Firebase.
 */
export function checkFirebaseConnection(config: typeof firebaseConfig = firebaseConfig): {
  isConnected: boolean;
  message: string;
  projectId?: string;
  authDomain?: string;
  error?: string;
} {
  if (!config || !config.apiKey || !config.projectId) {
    return {
      isConnected: false,
      message: 'Firebase não configurado (apiKey ou projectId ausentes).',
      error: 'Configuração incompleta',
    };
  }

  return {
    isConnected: true,
    message: `Firebase inicializado para o projeto: ${config.projectId}`,
    projectId: config.projectId,
    authDomain: config.authDomain,
  };
}

/**
 * Checa o acesso ao armazenamento local de arquivos JSON (Data Store).
 */
export function checkLocalStorageConnection(customPath?: string): {
  isConnected: boolean;
  message: string;
  directory: string;
  error?: string;
} {
  const dataDir = customPath || path.join(process.cwd(), 'data');

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Testa permissão de escrita e leitura temporária
    const testFile = path.join(dataDir, `.healthcheck-${Date.now()}.tmp`);
    fs.writeFileSync(testFile, JSON.stringify({ status: 'ok', time: Date.now() }), 'utf-8');
    fs.readFileSync(testFile, 'utf-8');
    fs.unlinkSync(testFile);

    return {
      isConnected: true,
      message: 'Armazenamento local acessível com permissões de leitura/escrita.',
      directory: dataDir,
    };
  } catch (err: any) {
    return {
      isConnected: false,
      message: `Falha no armazenamento local: ${err?.message || 'Erro desconhecido'}`,
      directory: dataDir,
      error: err?.message,
    };
  }
}

/**
 * Checagem abrangente da saúde da conexão com o banco de dados e stores.
 */
export async function checkDatabaseConnection(options?: {
  databaseUrl?: string;
  customDataDir?: string;
  checkLive?: boolean;
}): Promise<DatabaseConnectionResult> {
  const pgCheck = await checkPostgresConnection(options?.databaseUrl, options?.checkLive);
  const fbCheck = checkFirebaseConnection();
  const localCheck = checkLocalStorageConnection(options?.customDataDir);

  const timestamp = new Date().toISOString();

  if (pgCheck.isConnected) {
    return {
      isConnected: true,
      status: 'connected',
      databaseType: 'postgres',
      message: `Conectado ao PostgreSQL/Neon (${pgCheck.host || 'remoto'})`,
      details: {
        postgres: {
          isConnected: true,
          host: pgCheck.host,
          database: pgCheck.database,
        },
        firebase: {
          isConnected: fbCheck.isConnected,
          projectId: fbCheck.projectId,
        },
        localStorage: {
          isConnected: localCheck.isConnected,
          directory: localCheck.directory,
        },
      },
      timestamp,
    };
  }

  if (localCheck.isConnected) {
    return {
      isConnected: true,
      status: 'fallback_local',
      databaseType: 'local_json',
      message: 'Operando em modo local (JSON Data Store). DATABASE_URL não configurada.',
      details: {
        postgres: {
          isConnected: false,
          error: pgCheck.error,
        },
        firebase: {
          isConnected: fbCheck.isConnected,
          projectId: fbCheck.projectId,
        },
        localStorage: {
          isConnected: true,
          directory: localCheck.directory,
        },
      },
      timestamp,
    };
  }

  return {
    isConnected: false,
    status: 'error',
    databaseType: 'none',
    message: 'Nenhum mecanismo de armazenamento disponível.',
    details: {
      postgres: { isConnected: false, error: pgCheck.error },
      firebase: { isConnected: fbCheck.isConnected, error: fbCheck.error },
      localStorage: { isConnected: false, directory: localCheck.directory, error: localCheck.error },
    },
    timestamp,
  };
}
