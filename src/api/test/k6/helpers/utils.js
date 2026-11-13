import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@prumo.com';
export const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || '123456';

/**
 * Realiza login como administrador e retorna os headers de autenticação
 * compatíveis tanto com JWT Bearer quanto com Cookies HttpOnly.
 */
export function autenticarAdmin() {
  const payload = JSON.stringify({
    email: ADMIN_EMAIL,
    senha: ADMIN_PASSWORD,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  check(res, {
    'login status é 200 ou 201': (r) => r.status === 200 || r.status === 201,
  });

  let token = null;
  try {
    const body = res.json();
    token = body?.access_token || null;
  } catch (_) {
    token = null;
  }

  // Captura cookies (inclusive HttpOnly) enviados no header Set-Cookie
  const cookies = {};
  if (res.cookies) {
    for (const [nome, lista] of Object.entries(res.cookies)) {
      if (lista && lista.length > 0) {
        cookies[nome] = lista[0].value;
      }
    }
  }

  return { token, cookies };
}

/**
 * Monta os parâmetros de requisição HTTP com Authorization Bearer e/ou Cookie HttpOnly.
 */
export function buildAuthParams(authData, tags = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authData?.token) {
    headers['Authorization'] = `Bearer ${authData.token}`;
  }

  if (authData?.cookies && Object.keys(authData.cookies).length > 0) {
    headers['Cookie'] = Object.entries(authData.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  return { headers, tags };
}

/**
 * Gera um CNPJ matematicamente válido (com dígitos verificadores reais)
 * para evitar erro 400 (@IsCnpj) ou 409 (conflito) em testes concorrentes.
 */
export function gerarCnpjValido(vu, iter) {
  // 12 dígitos de base (8 da raiz + 4 da filial) => 1 trilhão de combinações sem colisão
  const raiz6 = String(Date.now() % 1000000).padStart(6, '0');
  const rand2 = String(Math.floor(Math.random() * 90) + 10);
  const filial4 = String(((vu * 103 + iter) % 9998) + 1).padStart(4, '0');
  const base12 = `${raiz6}${rand2}${filial4}`;

  const calcularDigito = (base, pesos) => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) {
      soma += Number(base[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcularDigito(base12, pesos1);
  const d2 = calcularDigito(`${base12}${d1}`, pesos2);
  const d = `${base12}${d1}${d2}`;

  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/**
 * Gera um sufixo curto e único por VU, iteração e timestamp, respeitando limites de @MaxLength.
 */
export function sufixoUnico(vu, iter) {
  const ts = (Date.now() % 1000000).toString(36);
  const rand = Math.floor(Math.random() * 1296).toString(36);
  return `${vu}_${iter}_${ts}${rand}`;
}

