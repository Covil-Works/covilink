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

  describe('3. Profundidade de Rolagem (Scroll Depth & Drop-off Rate)', () => {
    it('deve calcular o funil de rolagem e a taxa de abandono (drop-off)', async () => {
      // 4 pageviews de 4 visitantes distintos
      await trackClick({ type: 'pageview', linkId: 'pageview', linkTitle: 'Página', url: '/', visitorId: 'user-1', device: 'mobile', browser: 'Chrome', referrer: 'Direto' });
      await trackClick({ type: 'pageview', linkId: 'pageview', linkTitle: 'Página', url: '/', visitorId: 'user-2', device: 'mobile', browser: 'Chrome', referrer: 'Direto' });
      await trackClick({ type: 'pageview', linkId: 'pageview', linkTitle: 'Página', url: '/', visitorId: 'user-3', device: 'mobile', browser: 'Chrome', referrer: 'Direto' });
      await trackClick({ type: 'pageview', linkId: 'pageview', linkTitle: 'Página', url: '/', visitorId: 'user-4', device: 'mobile', browser: 'Chrome', referrer: 'Direto' });

      // user-1 e user-2 rolaram até 100%
      await trackClick({ type: 'scroll_depth', linkId: 'scroll-100', linkTitle: '100%', url: '/', visitorId: 'user-1', scrollDepth: 100, device: 'mobile', browser: 'Chrome', referrer: 'Direto' });
      await trackClick({ type: 'scroll_depth', linkId: 'scroll-100', linkTitle: '100%', url: '/', visitorId: 'user-2', scrollDepth: 100, device: 'mobile', browser: 'Chrome', referrer: 'Direto' });
      
      // user-3 rolou até 50%
      await trackClick({ type: 'scroll_depth', linkId: 'scroll-50', linkTitle: '50%', url: '/', visitorId: 'user-3', scrollDepth: 50, device: 'mobile', browser: 'Chrome', referrer: 'Direto' });

      // user-4 não rolou além de 25%
      await trackClick({ type: 'scroll_depth', linkId: 'scroll-25', linkTitle: '25%', url: '/', visitorId: 'user-4', scrollDepth: 25, device: 'mobile', browser: 'Chrome', referrer: 'Direto' });

      const summary = await getAnalyticsSummary('all');
      assert.ok(summary.scrollDepth);
      assert.equal(summary.scrollDepth.depth25.count, 4); // todos atingiram >= 25%
      assert.equal(summary.scrollDepth.depth50.count, 3); // user-1, user-2, user-3
      assert.equal(summary.scrollDepth.depth100.count, 2); // user-1, user-2
      assert.equal(summary.scrollDepth.depth100.percentage, 50); // 2 de 4 = 50%
      assert.equal(summary.scrollDepth.dropOffRate, 50); // 50% desistiram antes do fim
    });
  });

  describe('4. Engajamento com Conteúdo Borrado (Blur Reveal Rate & Conversão)', () => {
    it('deve quantificar fotos reveladas e a taxa de conversão em cliques no destino', async () => {
      // 2 pageviews
      await trackClick({ type: 'pageview', linkId: 'pageview', linkTitle: 'Página', url: '/', visitorId: 'v-1', device: 'mobile', browser: 'Chrome', referrer: 'Instagram' });
      await trackClick({ type: 'pageview', linkId: 'pageview', linkTitle: 'Página', url: '/', visitorId: 'v-2', device: 'mobile', browser: 'Chrome', referrer: 'Instagram' });

      // 2 revelações da foto borrada
      await trackClick({ type: 'blur_reveal', linkId: 'card-exclusivo', linkTitle: 'Foto Exclusiva', url: 'https://exemplo.com/conteudo', visitorId: 'v-1', device: 'mobile', browser: 'Chrome', referrer: 'Instagram' });
      await trackClick({ type: 'blur_reveal', linkId: 'card-exclusivo', linkTitle: 'Foto Exclusiva', url: 'https://exemplo.com/conteudo', visitorId: 'v-2', device: 'mobile', browser: 'Chrome', referrer: 'Instagram' });

      // 1 clique subsequente no link de destino
      await trackClick({ type: 'click', linkId: 'card-exclusivo', linkTitle: 'Foto Exclusiva', url: 'https://exemplo.com/conteudo', visitorId: 'v-1', device: 'mobile', browser: 'Chrome', referrer: 'Instagram' });

      const summary = await getAnalyticsSummary('all');
      assert.ok(summary.blurEngagement);
      assert.equal(summary.blurEngagement.totalReveals, 2);
      assert.equal(summary.blurEngagement.revealRate, 100); // 2 reveals / 2 pageviews = 100%
      
      const card = summary.blurEngagement.cardsBreakdown.find((c) => c.id === 'card-exclusivo');
      assert.ok(card);
      assert.equal(card?.reveals, 2);
      assert.equal(card?.clicks, 1);
      assert.equal(card?.conversionRate, 50); // 1 clique / 2 reveals = 50%
    });
  });

  describe('5. Tempo Médio de Permanência (Dwell Time)', () => {
    it('deve calcular o tempo médio de permanência e segmentar em perfis de decisão', async () => {
      // user-1: 3s (Decisão Rápida - Stories)
      await trackClick({ type: 'dwell_time', linkId: 'dwell', linkTitle: 'Dwell', url: '/', visitorId: 'u-1', dwellSeconds: 3, device: 'mobile', browser: 'Safari', referrer: 'Instagram' });
      // user-2: 15s (Navegação Moderada)
      await trackClick({ type: 'dwell_time', linkId: 'dwell', linkTitle: 'Dwell', url: '/', visitorId: 'u-2', dwellSeconds: 15, device: 'mobile', browser: 'Safari', referrer: 'Instagram' });
      // user-3: 42s (Exploração Detalhada)
      await trackClick({ type: 'dwell_time', linkId: 'dwell', linkTitle: 'Dwell', url: '/', visitorId: 'u-3', dwellSeconds: 42, device: 'desktop', browser: 'Chrome', referrer: 'Direto' });

      const summary = await getAnalyticsSummary('all');
      assert.ok(summary.dwellTime);
      assert.equal(summary.dwellTime.averageSeconds, 20); // (3 + 15 + 42) / 3 = 20s
      assert.equal(summary.dwellTime.formattedAverage, '20s');
      assert.equal(summary.dwellTime.distribution.quick.count, 1);
      assert.equal(summary.dwellTime.distribution.medium.count, 1);
      assert.equal(summary.dwellTime.distribution.deep.count, 1);
    });
  });

  describe('6. Audiência e Demografia Anônima (Origem Geográfica & Idioma)', () => {
    it('deve agrupar países, estados e idiomas anônimos', async () => {
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Página',
        url: '/',
        visitorId: 'u-sp',
        country: 'Brasil',
        region: 'São Paulo (SP)',
        language: 'Português (Brasil)',
        device: 'mobile',
        browser: 'Chrome',
        referrer: 'Direto',
      });
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Página',
        url: '/',
        visitorId: 'u-rj',
        country: 'Brasil',
        region: 'Rio de Janeiro (RJ)',
        language: 'Português (Brasil)',
        device: 'mobile',
        browser: 'Chrome',
        referrer: 'Instagram',
      });
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Página',
        url: '/',
        visitorId: 'u-us',
        country: 'Estados Unidos',
        region: 'EUA',
        language: 'Inglês',
        device: 'desktop',
        browser: 'Safari',
        referrer: 'X (Twitter)',
      });

      const summary = await getAnalyticsSummary('all');
      assert.ok(summary.geoCountries.length >= 2);
      assert.equal(summary.geoCountries[0].name, 'Brasil');
      assert.ok(summary.geoRegions.some((r) => r.name === 'São Paulo (SP)'));
      assert.ok(summary.geoRegions.some((r) => r.name === 'Rio de Janeiro (RJ)'));
      assert.ok(summary.languages.some((l) => l.name === 'Português (Brasil)'));
      assert.ok(summary.languages.some((l) => l.name === 'Inglês'));
    });
  });

  describe('7. Inteligência de Horários (Heatmap Semanal & Melhores Momentos)', () => {
    it('deve preencher a matriz 7x24 e eleger os melhores horários para publicar', async () => {
      // Registra acessos em horários específicos
      await trackClick({
        type: 'pageview',
        linkId: 'pageview',
        linkTitle: 'Página',
        url: '/',
        device: 'mobile',
        browser: 'Chrome',
        referrer: 'Instagram',
      });

      const summary = await getAnalyticsSummary('all');
      assert.ok(summary.heatmap);
      assert.equal(summary.heatmap.matrix.length, 7);
      assert.equal(summary.heatmap.matrix[0].length, 24);
      assert.ok(summary.heatmap.bestTimes.length > 0);
      assert.ok(summary.heatmap.bestTimes[0].recommendation);
    });
  });

  describe('8. Alertas de Link em Alta (Spike Detection)', () => {
    it('deve detectar aumentos atípicos no volume de cliques de um link recente', async () => {
      // Simula 4 cliques recentes nas últimas 2 horas no link "link-viral"
      for (let i = 0; i < 4; i++) {
        await trackClick({
          type: 'click',
          linkId: 'link-viral',
          linkTitle: 'Produto Viral',
          url: 'https://exemplo.com/viral',
          device: 'mobile',
          browser: 'Safari',
          referrer: 'TikTok',
        });
      }

      const summary = await getAnalyticsSummary('today');
      assert.ok(Array.isArray(summary.spikes));
      assert.equal(summary.spikes.length, 1);
      assert.equal(summary.spikes[0].linkId, 'link-viral');
      assert.equal(summary.spikes[0].recentClicks, 4);
      assert.ok(summary.spikes[0].increasePercentage >= 100);
      assert.ok(summary.spikes[0].message.includes('salto atípico'));
    });
  });
});

