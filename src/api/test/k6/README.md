# Testes de Desempenho da API (k6)

Esta pasta contém os scripts de teste de carga e desempenho utilizando o [Grafana k6](https://k6.io/), cobrindo os métodos `POST`, `GET`, `PUT` (além de `PATCH`) e `DELETE` nas principais rotas da API Prumo para cenários de **50** e **100 usuários simultâneos (VUs)**.

## Estrutura dos Arquivos

- `helpers/utils.js`: Funções utilitárias de autenticação (compatível com **JWT Bearer** e **Cookies HttpOnly**), geração de CNPJ válido (`@IsCnpj`) e identificadores únicos por VU/iteração.
- `helpers/api-flow.js`: Fluxo completo de ponta a ponta exercitando `Fabricantes`, `Fornecedores`, `Materiais`, `Ordens de Compra`, `Movimentações`, `Dashboard` e exclusão lógica (`DELETE`).
- `load-50vus.js`: Teste de carga para **50 usuários simultâneos**.
- `load-100vus.js`: Teste de carga para **100 usuários simultâneos**.
- `api-complete.k6.js`: Executa em sequência os cenários de 50 VUs e 100 VUs com métricas segmentadas por método HTTP e cenário.

## ⚠️ Atenção ao Rate Limiting (`ThrottlerGuard`)

Em `src/api/src/app.module.ts`, o `ThrottlerModule` está configurado globalmente com limite de **30 requisições por minuto por IP**:

```ts
ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60_000, limit: 30 }],
})
```

Ao executar 50 ou 100 usuários simultâneos a partir da mesma máquina, a API passará a retornar `429 Too Many Requests` após a 30ª requisição dentro da janela de 60 segundos. Para avaliar o desempenho real do banco e do NestJS sem bloqueio do rate limiter durante a bateria de carga, aumente temporariamente o `limit` (por exemplo, para `100_000`) ou desative o `ThrottlerGuard` no ambiente de teste.

## Como Executar

### Com o k6 instalado localmente

```bash
# Cenário de 50 usuários simultâneos
k6 run src/api/test/k6/load-50vus.js

# Cenário de 100 usuários simultâneos
k6 run src/api/test/k6/load-100vus.js

# Bateria completa (50 VUs seguido de 100 VUs)
k6 run src/api/test/k6/api-complete.k6.js
```

### Usando outra credencial ou URL

Por padrão, os scripts utilizam o administrador criado pelas migrations (`admin@prumo.com` / `123456`). Para sobrescrever:

```bash
k6 run -e BASE_URL=http://localhost:3000 -e ADMIN_EMAIL=admin@prumo.com -e ADMIN_PASSWORD=sua_senha src/api/test/k6/load-50vus.js
```

### Executando via Docker (sem instalar o k6 na máquina)

```bash
docker run --rm -i --network=host -v $(pwd):/work -w /work grafana/k6 run src/api/test/k6/load-50vus.js
```

