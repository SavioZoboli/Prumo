import { autenticarAdmin } from './helpers/utils.js';
import { executarFluxoPrincipal } from './helpers/api-flow.js';

export const options = {
  scenarios: {
    carga_50_usuarios: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 50 }, // Ramp-up até 50 usuários simultâneos
        { duration: '45s', target: 50 }, // Sustentação em 50 usuários simultâneos
        { duration: '10s', target: 0 },  // Ramp-down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Taxa de falha inferior a 5%
    http_req_duration: ['p(95)<1500'], // 95% das requisições abaixo de 1.5s
    'http_req_duration{method:GET}': ['p(95)<1000'],
    'http_req_duration{method:POST}': ['p(95)<1500'],
    'http_req_duration{method:PUT}': ['p(95)<1500'],
    'http_req_duration{method:DELETE}': ['p(95)<1200'],
  },
};

export function setup() {
  return autenticarAdmin();
}

export default function (authData) {
  executarFluxoPrincipal(authData);
}

