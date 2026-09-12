import { NextRequest, NextResponse } from 'next/server';
import { trackClick, AnalyticsEventType } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      linkId,
      linkTitle,
      url,
      type,
      visitorId,
      scrollDepth,
      dwellSeconds,
      timeZone,
      language: clientLanguage,
    } = body;

    const validTypes: AnalyticsEventType[] = ['click', 'pageview', 'scroll_depth', 'blur_reveal', 'dwell_time'];
    const eventType: AnalyticsEventType = validTypes.includes(type)
      ? type
      : (linkId === 'pageview' ? 'pageview' : 'click');

    if (eventType === 'click' && (!linkId || !url)) {
      return NextResponse.json({ error: 'linkId and url are required for click events' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);

    const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    
    let browser = 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    if (userAgent.includes('Edge') || userAgent.includes('Edg/')) browser = 'Edge';

    const referrer = req.headers.get('referer') || 'Direto';

    // Edge Geolocation Headers (Vercel / Cloudflare)
    const vercelCountry = req.headers.get('x-vercel-ip-country');
    const vercelRegion = req.headers.get('x-vercel-ip-country-region');
    const vercelCity = req.headers.get('x-vercel-ip-city');
    const cfCountry = req.headers.get('cf-ipcountry');

    let country = vercelCountry || cfCountry || '';
    let region = vercelRegion || '';
    let city = vercelCity || '';

    const stateNames: Record<string, string> = {
      SP: 'São Paulo (SP)',
      RJ: 'Rio de Janeiro (RJ)',
      MG: 'Minas Gerais (MG)',
      RS: 'Rio Grande do Sul (RS)',
      PR: 'Paraná (PR)',
      BA: 'Bahia (BA)',
      SC: 'Santa Catarina (SC)',
      GO: 'Goiás (GO)',
      DF: 'Distrito Federal (DF)',
      PE: 'Pernambuco (PE)',
      CE: 'Ceará (CE)',
      PA: 'Pará (PA)',
      MA: 'Maranhão (MA)',
      MT: 'Mato Grosso (MT)',
      MS: 'Mato Grosso do Sul (MS)',
      ES: 'Espírito Santo (ES)',
      PB: 'Paraíba (PB)',
      RN: 'Rio Grande do Norte (RN)',
      AL: 'Alagoas (AL)',
      PI: 'Piauí (PI)',
      SE: 'Sergipe (SE)',
      RO: 'Rondônia (RO)',
      TO: 'Tocantins (TO)',
      AC: 'Acre (AC)',
      AP: 'Amapá (AP)',
      RR: 'Roraima (RR)',
      AM: 'Amazonas (AM)',
    };

    const countryNames: Record<string, string> = {
      BR: 'Brasil',
      US: 'Estados Unidos',
      PT: 'Portugal',
      ES: 'Espanha',
      AR: 'Argentina',
      UY: 'Uruguai',
      PY: 'Paraguai',
      CL: 'Chile',
      CO: 'Colômbia',
      MX: 'México',
      GB: 'Reino Unido',
      FR: 'França',
      DE: 'Alemanha',
      IT: 'Itália',
      CA: 'Canadá',
      JP: 'Japão',
    };

    if (country && countryNames[country.toUpperCase()]) {
      country = countryNames[country.toUpperCase()];
    }

    if (region && stateNames[region.toUpperCase()]) {
      region = stateNames[region.toUpperCase()];
    }

    // Timezone fallback when Edge headers are unavailable (e.g. Localhost / VPS)
    if (!country || !region) {
      const tz = (timeZone || '').toLowerCase();
      if (tz.includes('sao_paulo')) {
        country = country || 'Brasil';
        region = region || 'São Paulo (SP)';
      } else if (tz.includes('bahia')) {
        country = country || 'Brasil';
        region = region || 'Bahia (BA)';
      } else if (tz.includes('fortaleza')) {
        country = country || 'Brasil';
        region = region || 'Ceará (CE)';
      } else if (tz.includes('recife')) {
        country = country || 'Brasil';
        region = region || 'Pernambuco (PE)';
      } else if (tz.includes('belem')) {
        country = country || 'Brasil';
        region = region || 'Pará (PA)';
      } else if (tz.includes('manaus')) {
        country = country || 'Brasil';
        region = region || 'Amazonas (AM)';
      } else if (tz.includes('cuiaba')) {
        country = country || 'Brasil';
        region = region || 'Mato Grosso (MT)';
      } else if (tz.includes('porto_velho')) {
        country = country || 'Brasil';
        region = region || 'Rondônia (RO)';
      } else if (tz.includes('rio_branco')) {
        country = country || 'Brasil';
        region = region || 'Acre (AC)';
      } else if (tz.includes('new_york') || tz.includes('chicago') || tz.includes('los_angeles')) {
        country = country || 'Estados Unidos';
        region = region || 'EUA';
      } else if (tz.includes('lisbon')) {
        country = country || 'Portugal';
        region = region || 'Lisboa';
      } else {
        country = country || 'Brasil';
        region = region || 'São Paulo (SP)';
      }
    }

    // Idioma preferencial do navegador
    const acceptLanguage = req.headers.get('accept-language') || '';
    const rawLang = (clientLanguage || acceptLanguage || 'pt-BR').split(',')[0].trim();
    let language = 'Português (Brasil)';
    if (rawLang.toLowerCase().startsWith('pt-br') || rawLang.toLowerCase() === 'pt') {
      language = 'Português (Brasil)';
    } else if (rawLang.toLowerCase().startsWith('pt-pt')) {
      language = 'Português (Portugal)';
    } else if (rawLang.toLowerCase().startsWith('en')) {
      language = 'Inglês';
    } else if (rawLang.toLowerCase().startsWith('es')) {
      language = 'Espanhol';
    } else if (rawLang.toLowerCase().startsWith('fr')) {
      language = 'Francês';
    } else if (rawLang.toLowerCase().startsWith('de')) {
      language = 'Alemão';
    } else if (rawLang.toLowerCase().startsWith('it')) {
      language = 'Italiano';
    }

    const clickEvent = await trackClick({
      type: eventType,
      linkId: linkId || eventType,
      linkTitle: linkTitle || (eventType === 'pageview' ? 'Visualização do Perfil' : linkId || 'Evento'),
      url: url || '/',
      device,
      browser,
      referrer,
      visitorId,
      country,
      region,
      city,
      language,
      scrollDepth: typeof scrollDepth === 'number' ? scrollDepth : undefined,
      dwellSeconds: typeof dwellSeconds === 'number' ? dwellSeconds : undefined,
    });

    return NextResponse.json({ success: true, event: clickEvent });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 });
  }
}
