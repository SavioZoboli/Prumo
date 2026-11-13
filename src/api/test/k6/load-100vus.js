import { autenticarAdmin } from './helpers/utils.js';
import { executarFluxoPrincipal } from './helpers/api-flow.js';

export const options = {
  scenarios: {
    carga_100_usuarios: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 100 }, // Ramp-up até 100 usuários simultâneos
        { duration: '60s', target: 100 }, // Sustentação em 100 usuários simultâneos
        { duration: '15s', target: 0 },   // Ramp-down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Taxa de falha inferior a 5%
    http_req_duration: ['p(95)<2500'], // 95% das requisições abaixo de 2.5s sob 100 VUs
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

