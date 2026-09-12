import { describe, it, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import {
  validateDatabaseUrl,
  isNeonDatabaseConnected,
  checkPostgresConnection,
  checkFirebaseConnection,
  checkLocalStorageConnection,
  checkDatabaseConnection,
  closePgPool,
} from '../lib/db';

describe('Teste Unitário - Conexão com o Banco de Dados', () => {
  const originalEnv = { ...process.env };

  after(async () => {
    await closePgPool();
  });

  beforeEach(() => {
    // Restaura o ambiente antes de cada teste
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Garante que o ambiente volte ao estado original
    process.env = { ...originalEnv };
  });

  describe('1. Validação da URL do PostgreSQL / Neon (validateDatabaseUrl)', () => {
    it('deve retornar inválido se a DATABASE_URL for nula, vazia ou indefinida', () => {
      assert.equal(validateDatabaseUrl(undefined).isValid, false);
      assert.equal(validateDatabaseUrl('').isValid, false);
      assert.equal(validateDatabaseUrl('   ').isValid, false);
    });

    it('deve rejeitar URLs com protocolo incompatível (não-postgres)', () => {
      const httpUrl = validateDatabaseUrl('https://example.com/db');
      assert.equal(httpUrl.isValid, false);
      assert.match(httpUrl.error || '', /Protocolo inválido/);

      const mysqlUrl = validateDatabaseUrl('mysql://root:pass@localhost:3306/covilink');
      assert.equal(mysqlUrl.isValid, false);
    });

    it('deve validar corretamente uma URL padrão postgres://', () => {
      const validUrl = 'postgres://user_covilink:secretpass@ep-cool-pool-123.us-east-2.aws.neon.tech:5432/covilink_prod?sslmode=require';
      const result = validateDatabaseUrl(validUrl);

      assert.equal(result.isValid, true);
      assert.equal(result.protocol, 'postgres');
      assert.equal(result.host, 'ep-cool-pool-123.us-east-2.aws.neon.tech');
      assert.equal(result.port, '5432');
      assert.equal(result.database, 'covilink_prod');
      assert.equal(result.user, 'user_covilink');
    });

    it('deve validar corretamente uma URL postgresql://', () => {
      const validUrl = 'postgresql://artur:mypassword@localhost:5432/covilink';
      const result = validateDatabaseUrl(validUrl);

      assert.equal(result.isValid, true);
      assert.equal(result.protocol, 'postgresql');
      assert.equal(result.host, 'localhost');
      assert.equal(result.port, '5432');
      assert.equal(result.database, 'covilink');
    });

    it('deve identificar URLs malformadas sem hostname', () => {
      const malformedUrl = 'postgres:///covilink';
      const result = validateDatabaseUrl(malformedUrl);

      assert.equal(result.isValid, false);
      assert.ok(result.error);
    });
  });

  describe('2. Verificação do Status do Neon DB no Ambiente (isNeonDatabaseConnected)', () => {
    it('deve retornar false quando DATABASE_URL não está configurada no .env', () => {
      delete process.env.DATABASE_URL;
      assert.equal(isNeonDatabaseConnected(), false);
    });

    it('deve retornar false quando DATABASE_URL possui formato inválido', () => {
      process.env.DATABASE_URL = 'invalid-connection-string';
      assert.equal(isNeonDatabaseConnected(), false);
    });

    it('deve retornar true quando DATABASE_URL é uma URL PostgreSQL válida', () => {
      process.env.DATABASE_URL = 'postgresql://admin:supersecret@neon.tech:5432/covilink';
      assert.equal(isNeonDatabaseConnected(), true);
    });
  });

  describe('3. Checagem de Conexão PostgreSQL (checkPostgresConnection)', () => {
    it('deve retornar erro quando não há DATABASE_URL', async () => {
      delete process.env.DATABASE_URL;
      const result = await checkPostgresConnection();

      assert.equal(result.isConnected, false);
      assert.ok(result.message.length > 0);
    });

    it('deve reportar conectado quando URL válida é fornecida', async () => {
      const testUrl = 'postgresql://neon_user:pwd@neon.tech:5432/covilink_test';
      const result = await checkPostgresConnection(testUrl);

      assert.equal(result.isConnected, true);
      assert.equal(result.host, 'neon.tech');
      assert.equal(result.database, 'covilink_test');
    });
  });

  describe('4. Verificação da Conexão com o Firebase (checkFirebaseConnection)', () => {
    it('deve validar configuração padrão existente do Firebase', () => {
      const result = checkFirebaseConnection();
      assert.equal(result.isConnected, true);
      assert.ok(result.projectId);
      assert.ok(result.authDomain);
    });

    it('deve reportar não conectado se apiKey ou projectId estiverem ausentes', () => {
      const invalidConfig = {
        apiKey: '',
        authDomain: 'test.firebaseapp.com',
        projectId: '',
      } as any;

      const result = checkFirebaseConnection(invalidConfig);
      assert.equal(result.isConnected, false);
      assert.ok(result.error);
    });
  });

  describe('5. Verificação do Armazenamento Local (checkLocalStorageConnection)', () => {
    it('deve validar permissões de leitura/escrita no diretório data', () => {
      const result = checkLocalStorageConnection();
      assert.equal(result.isConnected, true);
      assert.ok(result.directory.includes('data'));
    });

    it('deve retornar falha se o diretório for inacessível/inválido', () => {
      // Cria caminho inválido no Windows
      const invalidPath = 'Z:\\diretorio_inexistente_impossivel_123456\\data';
      const result = checkLocalStorageConnection(invalidPath);
      assert.equal(result.isConnected, false);
      assert.ok(result.error);
    });
  });

  describe('6. Diagnóstico Abrangente (checkDatabaseConnection)', () => {
    it('deve reportar fallback_local quando DATABASE_URL não está configurada mas data store está ativo', async () => {
      delete process.env.DATABASE_URL;
      const result = await checkDatabaseConnection();

      assert.equal(result.isConnected, true);
      assert.equal(result.status, 'fallback_local');
      assert.equal(result.databaseType, 'local_json');
      assert.equal(result.details.localStorage?.isConnected, true);
      assert.ok(result.timestamp);
    });

    it('deve priorizar PostgreSQL quando DATABASE_URL válida está configurada', async () => {
      process.env.DATABASE_URL = 'postgresql://app:token@db.neon.tech:5432/covilink_main';
      const result = await checkDatabaseConnection();

      assert.equal(result.isConnected, true);
      assert.equal(result.status, 'connected');
      assert.equal(result.databaseType, 'postgres');
      assert.equal(result.details.postgres?.isConnected, true);
      assert.equal(result.details.postgres?.host, 'db.neon.tech');
    });

    it('deve reportar erro se PostgreSQL estiver ausente e o armazenamento local falhar', async () => {
      delete process.env.DATABASE_URL;
      const result = await checkDatabaseConnection({
        databaseUrl: '',
        customDataDir: 'Z:\\caminho_invalido_teste\\data',
      });

      assert.equal(result.isConnected, false);
      assert.equal(result.status, 'error');
      assert.equal(result.databaseType, 'none');
    });
  });
});
