import { autenticarAdmin } from './helpers/utils.js';
import { executarFluxoPrincipal } from './helpers/api-flow.js';

export const options = {
  scenarios: {
    cenario_50_usuarios: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 50 },
        { duration: '45s', target: 50 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
      tags: { cenario: '50_vus' },
    },
    cenario_100_usuarios: {
      executor: 'ramping-vus',
      startTime: '75s', // Inicia após o término do cenário de 50 VUs
      startVUs: 0,
      stages: [
        { duration: '20s', target: 100 },
        { duration: '60s', target: 100 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
      tags: { cenario: '100_vus' },
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    'http_req_duration{cenario:50_vus}': ['p(95)<1500'],
    'http_req_duration{cenario:100_vus}': ['p(95)<2500'],
    'http_req_duration{method:GET}': ['p(95)<1500'],
    'http_req_duration{method:POST}': ['p(95)<2500'],
    'http_req_duration{method:PUT}': ['p(95)<2500'],
    'http_req_duration{method:DELETE}': ['p(95)<2000'],
  },
};

export function setup() {
  return autenticarAdmin();
}

export default function (authData) {
  executarFluxoPrincipal(authData);
}

