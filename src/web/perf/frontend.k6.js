import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { browser } from 'k6/browser';

const WEB_URL_PADRAO = __ENV.WEB_URL || 'http://localhost:4200';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@prumo.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || '123456';

// Ativa o cenário de navegador real por padrão, mas permite desativar com -e SKIP_BROWSER=true
const EXECUTAR_BROWSER = __ENV.SKIP_BROWSER !== 'true';

const scenarios = {};

if (EXECUTAR_BROWSER) {
  // 1. Mede Core Web Vitals no navegador real (Brave/Chromium) primeiro, sem interferência do teste de estresse HTTP
  scenarios.metricas_web_vitals = {
    executor: 'shared-iterations',
    vus: 1,
    iterations: 4,
    exec: 'testeNavegadorReal',
    options: {
      browser: {
        type: 'chromium',
      },
    },
  };
}

// 2. Teste de carga HTTP no servidor do Front-end (50 VUs)
scenarios.carga_http_frontend_50vus = {
  executor: 'ramping-vus',
  startTime: EXECUTAR_BROWSER ? '15s' : '0s',
  startVUs: 0,
  stages: [
    { duration: '10s', target: 50 },
    { duration: '20s', target: 50 },
    { duration: '5s', target: 0 },
  ],
  exec: 'testeHttpEstatico',
};

export const options = {
  scenarios,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    ...(EXECUTAR_BROWSER
      ? {
          // Em modo dev (ng serve), os bundles não estão minificados; 2.5s acomoda o cold-start da 1ª aba
          browser_web_vital_lcp: ['p(90)<2500'], // Largest Contentful Paint < 2.5s
          browser_web_vital_fcp: ['p(90)<2500'], // First Contentful Paint < 2.5s
          browser_web_vital_cls: ['p(90)<0.1'],  // Cumulative Layout Shift < 0.1
        }
      : {}),
  },
};

/**
 * No Linux com Node 22+, o `ng serve` escuta por padrão em IPv6 ([::1]:4200).
 * O cliente HTTP do k6 tenta IPv4 (127.0.0.1:4200) primeiro quando recebe 'localhost'.
 * O setup() detecta automaticamente qual endereço responde para o cliente HTTP.
 */
export function setup() {
  const candidatos = [
    WEB_URL_PADRAO,
    'http://[::1]:4200',
    'http://127.0.0.1:4200',
  ];

  for (const url of candidatos) {
    const res = http.get(`${url}/favicon.ico`, { timeout: '2s' });
    if (res.status === 200) {
      return { httpUrl: url, browserUrl: WEB_URL_PADRAO };
    }
  }

  return { httpUrl: 'http://[::1]:4200', browserUrl: WEB_URL_PADRAO };
}

export function testeHttpEstatico(data) {
  const baseUrl = data?.httpUrl || 'http://[::1]:4200';

  group('Carregamento SPA e Assets', () => {
    const resIndex = http.get(`${baseUrl}/login`);
    check(resIndex, {
      'SPA /login status 200': (r) => r.status === 200,
      'Contém <app-root> do Angular': (r) => r.body && r.body.includes('<app-root'),
    });

    const resFavicon = http.get(`${baseUrl}/favicon.ico`);
    check(resFavicon, {
      'Asset favicon.ico status 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}

export async function testeNavegadorReal(data) {
  const baseUrl = data?.browserUrl || WEB_URL_PADRAO;
  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });

    const inputEmail = page.locator('input[type="email"], input[formControlName="email"]');
    const inputSenha = page.locator('input[type="password"], input[formControlName="senha"]');
    const btnSubmit = page.locator('button[type="submit"]');

    if (await inputEmail.isVisible()) {
      await inputEmail.fill(ADMIN_EMAIL);
      await inputSenha.fill(ADMIN_PASSWORD);
      await btnSubmit.click();
      await page.waitForTimeout(1500);
    }
  } finally {
    await page.close();
  }
}
