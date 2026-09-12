import dotenv from 'dotenv';
dotenv.config();
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeProfile } from '../lib/profile-store';
import { sanitizeLinks } from '../lib/links-store';
import { sanitizeSocials } from '../lib/socials-store';
import { isNeonDatabaseConnected, queryDb, closePgPool } from '../lib/db';

describe('Teste de Integridade e Modelos - Operações Seguras (Non-Destructive)', () => {
  after(async () => {
    await closePgPool();
  });

  it('deve validar conexão segura com Neon PostgreSQL quando configurado', async () => {
    const isConnected = isNeonDatabaseConnected();
    if (isConnected) {
      // Teste de leitura seguro (SELECT 1) sem alterar nenhum dado real
      const result = await queryDb<{ health_check: number }>('SELECT 1 as health_check;');
      assert.equal(result.length, 1);
      assert.equal(result[0].health_check, 1);
    } else {
      assert.equal(typeof isConnected, 'boolean');
    }
  });

  it('deve sanitizar e proteger dados de perfil (sanitizeProfile)', () => {
    const rawData = {
      name: '  Kourtney Reppert  ',
      handle: '@kourtneyreppert',
      followers_count: '2.4M',
      bio: 'Bio teste',
      avatar_url: 'https://example.com/avatar.jpg',
      cover_image_url: 'https://example.com/cover.jpg',
      contact_email: 'contato@exemplo.com',
    };

    const sanitized = sanitizeProfile(rawData);
    assert.equal(sanitized.name, '  Kourtney Reppert  ');
    assert.equal(sanitized.handle, '@kourtneyreppert');
    assert.equal(sanitized.followersCount, '2.4M');
    assert.equal(sanitized.avatarUrl, 'https://example.com/avatar.jpg');
    assert.equal(sanitized.coverImageUrl, 'https://example.com/cover.jpg');
    assert.equal(sanitized.showHandle, true);
    assert.equal(sanitized.showBio, true);
    assert.equal(sanitized.showContactEmail, true);
  });

  it('deve proteger sanitização de perfil contra valores nulos e inválidos', () => {
    const fallback = sanitizeProfile(null);
    assert.ok(fallback.name);
    assert.ok(fallback.handle);
    assert.equal(typeof fallback.showBio, 'boolean');

    const empty = sanitizeProfile({});
    assert.ok(empty.name);
    assert.ok(empty.handle);
  });

  it('deve sanitizar lista de botões/links (sanitizeLinks)', () => {
    const rawLinks = [
      {
        id: 'link-1',
        title: 'Botão de Mentoria',
        url: 'https://exemplo.com',
        type: 'cta-primary',
        active: true,
      },
      {
        id: 'link-2',
        title: 'Curso VIP',
        url: 'https://exemplo.com/curso',
        type: 'card-photo',
        image: 'https://example.com/photo.jpg',
        hasBlur: true,
        blurText: 'Revelar Conteúdo Exclusivo',
        badge: 'Populares',
        badgeColor: 'purple',
      },
      null,
      undefined,
    ];

    const sanitized = sanitizeLinks(rawLinks);
    assert.equal(sanitized.length, 2);
    assert.equal(sanitized[0].id, 'link-1');
    assert.equal(sanitized[0].title, 'Botão de Mentoria');
    assert.equal(sanitized[0].type, 'cta-primary');
    assert.equal(sanitized[1].id, 'link-2');
    assert.equal(sanitized[1].hasBlur, true);
    assert.equal(sanitized[1].blurText, 'Revelar Conteúdo Exclusivo');
    assert.equal(sanitized[1].badge, 'Populares');
    assert.equal(sanitized[1].badgeColor, 'purple');
  });

  it('deve sanitizar lista de redes sociais (sanitizeSocials)', () => {
    const rawSocials = [
      {
        id: 'soc-1',
        platform: 'instagram',
        title: 'Instagram',
        url: 'https://instagram.com/kourtneyreppert',
        active: true,
      },
      {
        id: 'soc-2',
        platform: 'youtube',
        title: 'YouTube',
        url: 'https://youtube.com/@kourtneyreppert',
      },
    ];

    const sanitized = sanitizeSocials(rawSocials);
    assert.equal(sanitized.length, 2);
    assert.equal(sanitized[0].platform, 'instagram');
    assert.equal(sanitized[1].platform, 'youtube');
    assert.equal(sanitized[1].active, true);
  });
});
