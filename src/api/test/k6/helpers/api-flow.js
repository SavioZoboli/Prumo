import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  BASE_URL,
  buildAuthParams,
  gerarCnpjValido,
  sufixoUnico,
} from './utils.js';

/**
 * Executa o fluxo completo de testes nas principais rotas da API
 * cobrindo POST, GET, PUT (e PATCH) e DELETE.
 */
export function executarFluxoPrincipal(authData) {
  const idUnico = sufixoUnico(__VU, __ITER);

  let fabricanteId = null;
  let fornecedorId = null;
  let materialId = null;
  let ordemCompraId = null;
  let movimentacaoId = null;

  // 1. FABRICANTES (POST, GET, PATCH)
  group('01. Fabricantes', () => {
    const resPost = http.post(
      `${BASE_URL}/fabricantes`,
      JSON.stringify({
        nome: `Fab_${idUnico}`.slice(0, 40),
        ativo: true,
      }),
      buildAuthParams(authData, { name: 'POST /fabricantes', method: 'POST' }),
    );

    check(resPost, {
      'POST /fabricantes status 201': (r) => r.status === 201,
    });

    if (resPost.status === 201) {
      fabricanteId = resPost.json('id');
    }

    const resGet = http.get(
      `${BASE_URL}/fabricantes`,
      buildAuthParams(authData, { name: 'GET /fabricantes', method: 'GET' }),
    );
    check(resGet, {
      'GET /fabricantes status 200': (r) => r.status === 200,
    });

    if (fabricanteId) {
      const resPatch = http.patch(
        `${BASE_URL}/fabricantes/${fabricanteId}`,
        JSON.stringify({
          nome: `FabU_${idUnico}`.slice(0, 40),
        }),
        buildAuthParams(authData, { name: 'PATCH /fabricantes/:id', method: 'PATCH' }),
      );
      check(resPatch, {
        'PATCH /fabricantes/:id status 200': (r) => r.status === 200,
      });
    }
  });

  // 2. FORNECEDORES (POST, GET, PATCH)
  group('02. Fornecedores', () => {
    const resPost = http.post(
      `${BASE_URL}/fornecedores`,
      JSON.stringify({
        nome: `Forn_${idUnico}`.slice(0, 40),
        cnpj: gerarCnpjValido(__VU, __ITER),
        ativo: true,
      }),
      buildAuthParams(authData, { name: 'POST /fornecedores', method: 'POST' }),
    );

    check(resPost, {
      'POST /fornecedores status 201': (r) => r.status === 201,
    });

    if (resPost.status === 201) {
      fornecedorId = resPost.json('id');
    }

    const resGetAll = http.get(
      `${BASE_URL}/fornecedores`,
      buildAuthParams(authData, { name: 'GET /fornecedores', method: 'GET' }),
    );
    check(resGetAll, {
      'GET /fornecedores status 200': (r) => r.status === 200,
    });

    if (fornecedorId) {
      const resGetOne = http.get(
        `${BASE_URL}/fornecedores/${fornecedorId}`,
        buildAuthParams(authData, { name: 'GET /fornecedores/:id', method: 'GET' }),
      );
      check(resGetOne, {
        'GET /fornecedores/:id status 200': (r) => r.status === 200,
      });

      const resPatch = http.patch(
        `${BASE_URL}/fornecedores/${fornecedorId}`,
        JSON.stringify({
          nome: `FornU_${idUnico}`.slice(0, 40),
        }),
        buildAuthParams(authData, { name: 'PATCH /fornecedores/:id', method: 'PATCH' }),
      );
      check(resPatch, {
        'PATCH /fornecedores/:id status 200': (r) => r.status === 200,
      });
    }
  });

  // 3. MATERIAIS (POST, GET, PATCH)
  group('03. Materiais', () => {
    if (fabricanteId) {
      const resPost = http.post(
        `${BASE_URL}/materiais`,
        JSON.stringify({
          nome: `Mat_${idUnico}`.slice(0, 30),
          codigo: `C_${idUnico}`.slice(0, 20),
          equipamento: 'Torno CNC',
          estoqueMinimo: 5,
          fabricanteId: Number(fabricanteId),
          unidadeMedida: 'UN',
          localizacao: 'A12',
        }),
        buildAuthParams(authData, { name: 'POST /materiais', method: 'POST' }),
      );

      check(resPost, {
        'POST /materiais status 201': (r) => r.status === 201,
      });

      if (resPost.status === 201) {
        materialId = resPost.json('id');
      }
    }

    const resGetAll = http.get(
      `${BASE_URL}/materiais`,
      buildAuthParams(authData, { name: 'GET /materiais', method: 'GET' }),
    );
    check(resGetAll, {
      'GET /materiais status 200': (r) => r.status === 200,
    });

    const resRelatorio = http.get(
      `${BASE_URL}/materiais/relatorio-minimo`,
      buildAuthParams(authData, { name: 'GET /materiais/relatorio-minimo', method: 'GET' }),
    );
    check(resRelatorio, {
      'GET /materiais/relatorio-minimo status 200': (r) => r.status === 200,
    });

    if (materialId) {
      const resGetOne = http.get(
        `${BASE_URL}/materiais/${materialId}`,
        buildAuthParams(authData, { name: 'GET /materiais/:id', method: 'GET' }),
      );
      check(resGetOne, {
        'GET /materiais/:id status 200': (r) => r.status === 200,
      });

      const resPatch = http.patch(
        `${BASE_URL}/materiais/${materialId}`,
        JSON.stringify({
          estoqueMinimo: 8,
          localizacao: 'B01',
        }),
        buildAuthParams(authData, { name: 'PATCH /materiais/:id', method: 'PATCH' }),
      );
      check(resPatch, {
        'PATCH /materiais/:id status 200': (r) => r.status === 200,
      });
    }
  });

  // 4. ORDENS DE COMPRA (POST, GET, PUT, PATCH)
  group('04. Ordens de Compra (inclui PUT)', () => {
    if (fornecedorId && materialId) {
      const resPost = http.post(
        `${BASE_URL}/ordens-compra`,
        JSON.stringify({
          fornecedor_id: Number(fornecedorId),
          dt_entrega_prevista: '2026-12-31T00:00:00.000Z',
          itens: [
            {
              material_id: Number(materialId),
              quantidade: 20,
              valor: 45.9,
            },
          ],
        }),
        buildAuthParams(authData, { name: 'POST /ordens-compra', method: 'POST' }),
      );

      check(resPost, {
        'POST /ordens-compra status 201': (r) => r.status === 201,
      });

      if (resPost.status === 201) {
        ordemCompraId = resPost.json('id');
      }
    }

    const resGetAll = http.get(
      `${BASE_URL}/ordens-compra`,
      buildAuthParams(authData, { name: 'GET /ordens-compra', method: 'GET' }),
    );
    check(resGetAll, {
      'GET /ordens-compra status 200': (r) => r.status === 200,
    });

    if (ordemCompraId && materialId) {
      const resGetOne = http.get(
        `${BASE_URL}/ordens-compra/${ordemCompraId}`,
        buildAuthParams(authData, { name: 'GET /ordens-compra/:id', method: 'GET' }),
      );
      check(resGetOne, {
        'GET /ordens-compra/:id status 200': (r) => r.status === 200,
      });

      // Teste explícito do método PUT na rota PUT /ordens-compra/:id
      const resPut = http.put(
        `${BASE_URL}/ordens-compra/${ordemCompraId}`,
        JSON.stringify({
          dt_entrega_prevista: '2027-01-15T00:00:00.000Z',
          itens: [
            {
              material_id: Number(materialId),
              quantidade: 25,
              valor: 42.5,
            },
          ],
        }),
        buildAuthParams(authData, { name: 'PUT /ordens-compra/:id', method: 'PUT' }),
      );
      check(resPut, {
        'PUT /ordens-compra/:id status 200': (r) => r.status === 200,
      });
    }
  });

  // 5. MOVIMENTAÇÕES DE ESTOQUE (POST, GET, PATCH Estorno)
  group('05. Movimentacoes', () => {
    if (materialId) {
      const resPost = http.post(
        `${BASE_URL}/movimentacoes`,
        JSON.stringify({
          operacao: 'E',
          motivo: 'Entrada de teste de carga k6',
          ordem_producao: `OP-${idUnico}`.slice(0, 100),
          itens: [
            {
              material_id: Number(materialId),
              quantidade: 15,
            },
          ],
        }),
        buildAuthParams(authData, { name: 'POST /movimentacoes', method: 'POST' }),
      );

      check(resPost, {
        'POST /movimentacoes status 201': (r) => r.status === 201,
      });

      if (resPost.status === 201) {
        movimentacaoId = resPost.json('id');
      }
    }

    const resGetAll = http.get(
      `${BASE_URL}/movimentacoes`,
      buildAuthParams(authData, { name: 'GET /movimentacoes', method: 'GET' }),
    );
    check(resGetAll, {
      'GET /movimentacoes status 200': (r) => r.status === 200,
    });

    if (movimentacaoId) {
      const resGetOne = http.get(
        `${BASE_URL}/movimentacoes/${movimentacaoId}`,
        buildAuthParams(authData, { name: 'GET /movimentacoes/:id', method: 'GET' }),
      );
      check(resGetOne, {
        'GET /movimentacoes/:id status 200': (r) => r.status === 200,
      });
    }
  });

  // 6. DASHBOARD E INDICADORES (GET)
  group('06. Dashboard', () => {
    const resResumo = http.get(
      `${BASE_URL}/dashboard/resumo`,
      buildAuthParams(authData, { name: 'GET /dashboard/resumo', method: 'GET' }),
    );
    check(resResumo, {
      'GET /dashboard/resumo status 200': (r) => r.status === 200,
    });

    const resCriticos = http.get(
      `${BASE_URL}/dashboard/itens-criticos`,
      buildAuthParams(authData, { name: 'GET /dashboard/itens-criticos', method: 'GET' }),
    );
    check(resCriticos, {
      'GET /dashboard/itens-criticos status 200': (r) => r.status === 200,
    });

    const resUltimas = http.get(
      `${BASE_URL}/dashboard/ultimas-movimentacoes`,
      buildAuthParams(authData, { name: 'GET /dashboard/ultimas-movimentacoes', method: 'GET' }),
    );
    check(resUltimas, {
      'GET /dashboard/ultimas-movimentacoes status 200': (r) => r.status === 200,
    });
  });

  // 7. LIMPEZA / EXCLUSÃO LÓGICA (DELETE)
  group('07. Exclusao Logica (DELETE)', () => {
    if (materialId) {
      const resDelMaterial = http.del(
        `${BASE_URL}/materiais/${materialId}`,
        null,
        buildAuthParams(authData, { name: 'DELETE /materiais/:id', method: 'DELETE' }),
      );
      check(resDelMaterial, {
        'DELETE /materiais/:id status 200': (r) => r.status === 200,
      });
    }

    if (fornecedorId) {
      const resDelFornecedor = http.del(
        `${BASE_URL}/fornecedores/${fornecedorId}`,
        null,
        buildAuthParams(authData, { name: 'DELETE /fornecedores/:id', method: 'DELETE' }),
      );
      check(resDelFornecedor, {
        'DELETE /fornecedores/:id status 200': (r) => r.status === 200,
      });
    }

    if (fabricanteId) {
      const resDelFabricante = http.del(
        `${BASE_URL}/fabricantes/${fabricanteId}`,
        null,
        buildAuthParams(authData, { name: 'DELETE /fabricantes/:id', method: 'DELETE' }),
      );
      check(resDelFabricante, {
        'DELETE /fabricantes/:id status 200': (r) => r.status === 200,
      });
    }
  });

  sleep(1);
}

