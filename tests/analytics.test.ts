import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cleanReferrer, trackClick, getAnalyticsSummary, resetAnalyticsData } from '../lib/analytics';

describe('Métricas & Analytics - Funcionalidades e Classificação', () => {
  beforeEach(async () => {
    await resetAnalyticsData();
  });

  describe('1. Classificação de Fontes de Tráfego (cleanReferrer)', () => {
    it('deve identificar acessos diretos quando referrer estiver ausente ou vazio', () => {
      assert.equal(cleanReferrer(''), 'Direto');
      assert.equal(cleanReferrer(undefined), 'Direto');
      assert.equal(cleanReferrer('Direto'), 'Direto');
      assert.equal(cleanReferrer('Direto / Rede Social'), 'Direto');
    });

    it('deve identificar Instagram a partir de URLs do Instagram', () => {
      assert.equal(cleanReferrer('https://l.instagram.com/'), 'Instagram');
      assert.equal(cleanReferrer('https://www.instagram.com/stories'), 'Instagram');
    });

    it('deve identificar TikTok a partir de referrers do TikTok', () => {
      assert.equal(cleanReferrer('https://www.tiktok.com/@creator'), 'TikTok');
      assert.equal(cleanReferrer('android-app://com.zhiliaoapp.musically'), 'TikTok');
    });

    it('deve identificar X (Twitter) a partir de links encurtados ou domínio', () => {
      assert.equal(cleanReferrer('https://t.co/abc1234'), 'X (Twitter)');
      assert.equal(cleanReferrer('https://x.com/covilink'), 'X (Twitter)');
      assert.equal(cleanReferrer('https://twitter.com'), 'X (Twitter)');
    });

    it('deve identificar WhatsApp a partir de wa.me ou whatsapp web', () => {
      assert.equal(cleanReferrer('https://wa.me/5511999999999'), 'WhatsApp');
      assert.equal(cleanReferrer('https://web.whatsapp.com'), 'WhatsApp');
    });

    it('deve identificar YouTube a partir de youtu.be ou youtube.com', () => {
      assert.equal(cleanReferrer('https://www.youtube.com/watch?v=123'), 'YouTube');
      assert.equal(cleanReferrer('https://youtu.be/123'), 'YouTube');
    });
  });

  describe('2. Registro de Eventos e CTR Real (Clicks vs PageViews)', () => {
    it('deve registrar visualizações de página (pageviews) e cliques separadamente', async () => {
      // Registra 4 visualizações de página
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Visualização da Página',
        url: 'https://covilink.com',
        device: 'mobile',
        browser: 'Safari',
        referrer: 'https://l.instagram.com',
      });
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Visualização da Página',
        url: 'https://covilink.com',
        device: 'mobile',
        browser: 'Safari',
        referrer: 'https://l.instagram.com',
      });
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Visualização da Página',
        url: 'https://covilink.com',
        device: 'desktop',
        browser: 'Chrome',
        referrer: 'Direto',
      });
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Visualização da Página',
        url: 'https://covilink.com',
        device: 'desktop',
        browser: 'Chrome',
        referrer: 'Direto',
      });

      // Registra 1 clique em um link
      await trackClick({
        type: 'click',
        linkId: 'link-vip',
        linkTitle: 'Curso VIP',
        url: 'https://exemplo.com/vip',
        device: 'mobile',
        browser: 'Safari',
        referrer: 'https://l.instagram.com',
      });

      const summary = await getAnalyticsSummary('7d');
      assert.equal(summary.totalClicks, 1);
      assert.equal(summary.totalPageViews, 4);
      // CTR: 1 clique / 4 pageviews = 25%
      assert.equal(summary.ctr, 25);
      assert.ok(summary.clicksByLink['link-vip']);
      assert.equal(summary.clicksByLink['link-vip'].clicks, 1);
      assert.equal(summary.topPerformingLink?.id, 'link-vip');
    });

    it('deve filtrar eventos por período (today, 7d, 30d, all)', async () => {
      await trackClick({
        type: 'click',
        linkId: 'link-1',
        linkTitle: 'Botão 1',
        url: 'https://exemplo.com/1',
        device: 'mobile',
        browser: 'Chrome',
        referrer: 'https://l.instagram.com',
      });

      const todaySummary = await getAnalyticsSummary('today');
      assert.equal(todaySummary.period, 'today');
      assert.equal(todaySummary.totalClicks, 1);

      const weekSummary = await getAnalyticsSummary('7d');
      assert.equal(weekSummary.period, '7d');
      assert.equal(weekSummary.totalClicks, 1);
    });

    it('deve permitir resetar todas as métricas com resetAnalyticsData', async () => {
      await trackClick({
        type: 'click',
        linkId: 'link-test',
        linkTitle: 'Botão Teste',
        url: 'https://exemplo.com',
        device: 'desktop',
        browser: 'Firefox',
        referrer: 'Direto',
      });

      let summary = await getAnalyticsSummary('all');
      assert.equal(summary.totalClicks, 1);

      await resetAnalyticsData();

      summary = await getAnalyticsSummary('all');
      assert.equal(summary.totalClicks, 0);
      assert.equal(summary.totalPageViews, 0);
      assert.equal(summary.ctr, 0);
      assert.equal(Object.keys(summary.clicksByLink).length, 0);
    });
  });
});
