import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { extractToken, verifyAuth, unauthorizedResponse } from '../lib/auth-server';
import { GET as getLinks, POST as postLinks } from '../app/api/links/route';
import { GET as getProfile, POST as postProfile } from '../app/api/profile/route';
import { GET as getSocials, POST as postSocials } from '../app/api/socials/route';
import { GET as getMetrics, POST as postMetrics } from '../app/api/metrics/route';
import { GET as getUpload, POST as postUpload, DELETE as deleteUpload } from '../app/api/upload/route';

describe('Segurança e Autenticação Firebase - Rotas de API e Validação de Tokens', () => {
  describe('1. Extração de Token (extractToken)', () => {
    it('deve extrair token do cabeçalho Authorization no formato Bearer', () => {
      const req = new NextRequest('http://localhost:3000/api/links', {
        headers: {
          authorization: 'Bearer token-de-teste-12345',
        },
      });
      const token = extractToken(req);
      assert.equal(token, 'token-de-teste-12345');
    });

    it('deve extrair token do cookie firebase_token quando cabeçalho não estiver presente', () => {
      const req = new NextRequest('http://localhost:3000/api/links', {
        headers: {
          cookie: 'firebase_token=token-do-cookie-67890; other=value',
        },
      });
      const token = extractToken(req);
      assert.equal(token, 'token-do-cookie-67890');
    });

    it('deve retornar null se não houver cabeçalho de autorização nem cookie', () => {
      const req = new NextRequest('http://localhost:3000/api/links');
      const token = extractToken(req);
      assert.equal(token, null);
    });
  });

  describe('2. Validação e Rejeição de Tokens Inválidos (verifyAuth)', () => {
    it('deve rejeitar requisição sem token com erro 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/links');
      const result = await verifyAuth(req);
      assert.equal(result.authenticated, false);
      assert.match(result.error || '', /Token de autenticação não fornecido/i);
    });

    it('deve rejeitar tokens malformados que não possuem formato JWT', async () => {
      const req = new NextRequest('http://localhost:3000/api/links', {
        headers: {
          authorization: 'Bearer token-invalido-sem-pontos',
        },
      });
      const result = await verifyAuth(req);
      assert.equal(result.authenticated, false);
      assert.match(result.error || '', /malformado/i);
    });

    it('deve rejeitar tokens expirados no payload JWT', async () => {
      const expiredPayload = Buffer.from(
        JSON.stringify({
          aud: 'link-juju',
          exp: Math.floor(Date.now() / 1000) - 3600, // expirou há 1 hora
          sub: 'user-expired-123',
        })
      ).toString('base64');

      const mockJwt = `eyJhbGciOiJSUzI1NiJ9.${expiredPayload}.signaturemock`;

      const req = new NextRequest('http://localhost:3000/api/links', {
        headers: {
          authorization: `Bearer ${mockJwt}`,
        },
      });
      const result = await verifyAuth(req);
      assert.equal(result.authenticated, false);
      assert.match(result.error || '', /expirad/i);
    });

    it('deve rejeitar tokens com audience de projeto diferente', async () => {
      const wrongAudPayload = Buffer.from(
        JSON.stringify({
          aud: 'outro-projeto-firebase',
          exp: Math.floor(Date.now() / 1000) + 3600,
          sub: 'user-123',
        })
      ).toString('base64');

      const mockJwt = `eyJhbGciOiJSUzI1NiJ9.${wrongAudPayload}.signaturemock`;

      const req = new NextRequest('http://localhost:3000/api/links', {
        headers: {
          authorization: `Bearer ${mockJwt}`,
        },
      });
      const result = await verifyAuth(req);
      assert.equal(result.authenticated, false);
      assert.match(result.error || '', /inválido para este projeto/i);
    });
  });

  describe('3. Proteção das Rotas de API Administrativas (HTTP 401 para Acesso Não-Autenticado)', () => {
    it('/api/links: GET e POST devem exigir autenticação', async () => {
      const unauthReq = new NextRequest('http://localhost:3000/api/links');
      const getRes = await getLinks(unauthReq);
      assert.equal(getRes.status, 401);

      const postReq = new NextRequest('http://localhost:3000/api/links', {
        method: 'POST',
        body: JSON.stringify({ links: [] }),
      });
      const postRes = await postLinks(postReq);
      assert.equal(postRes.status, 401);
    });

    it('/api/profile: GET e POST devem exigir autenticação', async () => {
      const unauthReq = new NextRequest('http://localhost:3000/api/profile');
      const getRes = await getProfile(unauthReq);
      assert.equal(getRes.status, 401);

      const postReq = new NextRequest('http://localhost:3000/api/profile', {
        method: 'POST',
        body: JSON.stringify({ profile: {} }),
      });
      const postRes = await postProfile(postReq);
      assert.equal(postRes.status, 401);
    });

    it('/api/socials: GET e POST devem exigir autenticação', async () => {
      const unauthReq = new NextRequest('http://localhost:3000/api/socials');
      const getRes = await getSocials(unauthReq);
      assert.equal(getRes.status, 401);

      const postReq = new NextRequest('http://localhost:3000/api/socials', {
        method: 'POST',
        body: JSON.stringify({ socials: [] }),
      });
      const postRes = await postSocials(postReq);
      assert.equal(postRes.status, 401);
    });

    it('/api/metrics: GET e POST devem exigir autenticação', async () => {
      const unauthReq = new NextRequest('http://localhost:3000/api/metrics');
      const getRes = await getMetrics(unauthReq);
      assert.equal(getRes.status, 401);

      const postReq = new NextRequest('http://localhost:3000/api/metrics', {
        method: 'POST',
        body: JSON.stringify({ action: 'reset' }),
      });
      const postRes = await postMetrics(postReq);
      assert.equal(postRes.status, 401);
    });

    it('/api/upload: GET, POST e DELETE devem exigir autenticação', async () => {
      const unauthReq = new NextRequest('http://localhost:3000/api/upload');
      const getRes = await getUpload(unauthReq);
      assert.equal(getRes.status, 401);

      const postRes = await postUpload(unauthReq);
      assert.equal(postRes.status, 401);

      const deleteRes = await deleteUpload(unauthReq);
      assert.equal(deleteRes.status, 401);
    });
  });
});
