# Prumo

Sistema para controle de estoque de pastilhas industriais, desenvolvido no contexto do **SAGA SENAI de Inovação**, atendendo à demanda da indústria **DDA Usinagem Industrial Ltda.** (Santa Catarina).

## Objetivo do projeto

O objetivo do projeto é substituir o processo manual de controle de estoque por uma solução tecnológica capaz de automatizar o gerenciamento do estoque, controlando entradas e saídas de materiais, monitorando níveis mínimos e fornecendo informações confiáveis para apoiar a tomada de decisão da empresa.

### Funcionalidades previstas

- Cadastro dos tipos de pastilhas.
- Cadastro de fabricantes e fornecedores.
- Identificação dos materiais por código ou descrição.
- Registro de entradas e saídas de estoque.
- Consulta da quantidade disponível em tempo real.
- Definição de estoque mínimo por item.
- Geração de alertas quando o estoque atingir níveis críticos.
- Histórico completo das movimentações.
- Painel de acompanhamento da situação do estoque.
- Emissão de relatórios de consumo, movimentação e necessidade de reposição.
- Possibilidade de integração futura com sistemas de compras/ERP (fora do escopo da primeira versão).

## Stack

| Camada  | Tecnologia |
|---------|------------|
| Backend | [NestJS](https://nestjs.com/) 11 (TypeScript) |
| Frontend | [Angular](https://angular.dev/) 21 + Angular Material |
| Banco de dados | 	PostgreSQL (via Docker) + TypeORM (migrations)|
Documentação da API  | Swagger | 	

O projeto ainda está em estágio inicial.

## Estrutura do repositório
Prumo/
├── docker-compose.yml   # sobe o Postgres em container
├── docs/
│   ├── diagram/          # modelagem do banco (pgModeler)
│   ├── logos/
│   └── pdf/               # documentação do projeto
└── src/
    ├── api/                # backend NestJS
    │   └── src/
    │       ├── database/    # config de conexão + migrations do TypeORM
    │       └── usuarios/    # módulo de usuários (controller/service/entity/dto)
    └── web/                 # frontend Angular

## Como rodar o projeto

### Pré-requisitos

- Node.js 22.12+ (ou 24+)
- npm 10+
- Docker e Docker Compose

### Passo a passo:

1. Banco de dados (Postgres via Docker)

Na raiz do projeto, crie um arquivo .env (não é versionado) com:

DB_USER=prumo
DB_PASSWORD=prumo
DB_NAME=prumo_db
DB_PORT=5432

Depois suba o container:

bash
docker compose up -d

Confirme que subiu certo com docker ps — o container prumo-postgres deve aparecer como healthy.

2. Backend (API)

Crie o arquivo src/api/.env (não é versionado) com os mesmos valores usados no .env da raiz, trocando só o host:

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=prumo
DB_PASSWORD=prumo
DB_NAME=prumo_db

Depois:

bash
cd src/api
npm install
npm run start:dev

A API sobe em http://localhost:3000. As migrations do banco (pasta src/api/src/database/migrations) são aplicadas automaticamente nesse momento — não é preciso rodar nenhum comando manual.

A documentação interativa da API (Swagger) fica disponível em http://localhost:3000/api.

3. Frontend (Web)
bash
cd src/web
npm install
npm start

A aplicação sobe em http://localhost:4200.

Migrations

Toda alteração de schema deve ser feita através de uma nova migration em src/api/src/database/migrations, nunca alterando o banco manualmente. Comandos disponíveis dentro de src/api:

bash
npm run migration:generate -- src/database/migrations/NomeDaMudanca   # gera a migration a partir das entidades
npm run migration:run                                                    # aplica as migrations pendentes
npm run migration:revert                                                  # desfaz a última migration aplicada

Ao rodar npm run start:dev, as migrations pendentes já são aplicadas.
