# Prumo

Sistema para controle de estoque de pastilhas industriais, desenvolvido no contexto do **SAGA SENAI de Inovação**, atendendo à demanda da indústria **DDA Usinagem Industrial Ltda.** (Santa Catarina).

---

## 🎯 Objetivo do Projeto

Substituir o processo manual de controle de estoque por uma solução tecnológica integrada capaz de automatizar o gerenciamento de estoque, controlando entradas e saídas de materiais, monitorando níveis mínimos e fornecendo indicadores confiáveis para apoiar a tomada de decisão da empresa.

### Funcionalidades

- **Gestão de Materiais:** Cadastro de tipos de pastilhas industriais, identificação por código ou descrição, e vínculo com fabricantes e fornecedores.
- **Movimentações de Estoque:** Registro de entradas e saídas (com estorno), motivos de movimentação e associação a ordens de produção.
- **Controle de Níveis Críticos:** Definição de estoque mínimo por item e alertas visuais para materiais com estoque baixo ou zerado.
- **Ordens de Compra:** Controle do fluxo de compras, previsão de entrega e monitoramento de ordens pendentes ou atrasadas.
- **Dashboard & Indicadores:** Painel geral com KPIs em tempo real, visualização em bento grid, relatórios de consumo e histórico semanal.
- **Controle de Acesso:** Autenticação via JWT com perfis de permissão (Administrador, Líder e Usuário operacional).

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Backend** | [NestJS](https://nestjs.com/) 11 + TypeScript | API REST modular com injeção de dependências |
| **Frontend** | [Angular](https://angular.dev/) 21 + Angular Material | SPA responsiva com Signals e tema personalizado |
| **Banco de Dados** | PostgreSQL 16 (Docker) + TypeORM | Banco relacional com versionamento via migrations |
| **Documentação da API** | Swagger / OpenAPI | Documentação interativa das rotas e DTOs |
| **Autenticação** | Passport JWT + Bcrypt | Tokens seguros com controle baseado em perfis (RBAC) |

---

## 📂 Estrutura do Repositório

```text
prumo/
├── docker-compose.yml       # Configuração do PostgreSQL em container
├── docs/                    # Documentação técnica, protótipos e diagramas
│   ├── diagram/             # Modelagem relacional do banco (pgModeler)
│   ├── logos/               # Identidade visual do projeto
│   └── pdf/                 # Documentos de especificação do projeto
└── src/
    ├── api/                 # Backend (NestJS)
    │   └── src/
    │       ├── auth/        # Autenticação e Guards JWT
    │       ├── dashboard/   # Endpoints de métricas e relatórios
    │       ├── database/    # Configuração de conexão e migrations TypeORM
    │       ├── fabricantes/ # Módulo de fabricantes
    │       ├── fornecedores/# Módulo de fornecedores
    │       ├── materiais/   # Cadastro e controle de estoque de materiais
    │       ├── movimentacoes# Registro de entradas, saídas e estornos
    │       ├── ordem-compra/# Gestão de pedidos e ordens de compra
    │       └── usuarios/    # Gestão de usuários e perfis de acesso
    └── web/                 # Frontend (Angular 21)
        └── src/
            ├── app/         # Componentes, páginas, guards e services
            └── assets/      # Imagens, temas e padrões visuais compartilhados (SCSS)
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 22.12+ ou 24+)
- [npm](https://www.npmjs.com/) (versão 10+)
- [Docker](https://www.docker.com/) e Docker Compose

---

### Passo a Passo

#### 1. Banco de Dados (PostgreSQL via Docker)

Na raiz do projeto, crie um arquivo `.env` para o Docker:

```env
DB_USER=prumo
DB_PASSWORD=prumo
DB_NAME=prumo_db
DB_PORT=5432
```

Inicie o container do banco:

```bash
docker compose up -d
```

> **Verificação:** Execute `docker ps` e certifique-se de que o container `prumo-postgres` está com status `healthy`.

---

#### 2. Backend (API NestJS)

Crie o arquivo `src/api/.env` com as configurações da aplicação e credenciais do banco:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=prumo
DB_PASSWORD=prumo
DB_NAME=prumo_db
JWT_SECRET=coloque_aqui_seu_secret_gerado
```

> **💡 Dica para gerar o `JWT_SECRET`:**
> Gere um hash aleatório seguro no terminal com:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

Em seguida, instale as dependências e inicie o servidor:

```bash
cd src/api
npm install
npm run start:dev
```

- A API estará disponível em: `http://localhost:3000`
- Documentação interativa (Swagger): `http://localhost:3000/api`

> As migrations do banco de dados são executadas **automaticamente** ao iniciar a API em modo desenvolvimento (`npm run start:dev`).

---

#### 3. Frontend (Aplicação Web Angular)

Em outro terminal, acesse o diretório do frontend:

```bash
cd src/web
npm install
npm start
```

- A aplicação estará disponível em: `http://localhost:4200`

---

## 🗄️ Migrations do Banco de Dados

Toda alteração de schema deve ser realizada através de migrations do TypeORM, mantendo o histórico de alterações versionado.

No diretório `src/api`, estão disponíveis os seguintes comandos:

```bash
# Gera uma nova migration baseada na comparação das entidades com o banco
npm run migration:generate -- src/database/migrations/NomeDaMudanca

# Executa manualmente as migrations pendentes
npm run migration:run

Copie o resultado para `JWT_SECRET` no seu `src/api/.env`. Em ambientes compartilhados (HML/produção), o segredo é configurado direto no
servidor, fora do repositório.
5. E-mail (alerta de estoque mínimo):

A API envia e-mail quando um material atinge o estoque mínimo. Em desenvolvimento, o `docker compose up -d` também sobe o **Mailpit**, um SMTP falso que captura tudo o que é enviado — nenhum e-mail sai de verdade. A caixa de entrada fica em http://localhost:8025.

Adicione ao `src/api/.env`:

MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_SECURE=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM="Prumo <nao-responda@prumo.local>"

Se as portas 1025/8025 já estiverem em uso na sua máquina, defina `MAILPIT_SMTP_PORT` e `MAILPIT_UI_PORT` no `.env` da raiz e use o mesmo valor de `MAILPIT_SMTP_PORT` em `MAIL_PORT`. Em HML/produção, as variáveis `MAIL_*` apontam para o SMTP real.

Os destinatários do alerta são os usuários ativos com perfil ADMIN ou LIDER.

Passo a passo completo de teste — pelo Mailpit e com envio real pelo Gmail — em [docs/alerta-estoque-email.md](docs/alerta-estoque-email.md).
