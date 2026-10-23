# Alerta de estoque mínimo por e-mail — como testar

Quando um material ativo fica com o **estoque igual ou abaixo do mínimo**, a API envia um e-mail aos usuários **ativos com perfil ADMIN ou LIDER**.

A verificação acontece depois de:

- uma movimentação (entrada ou saída);
- um estorno de movimentação;
- a edição de um material (por exemplo, quando o estoque mínimo é aumentado).

Regras de envio:

| Situação | Envia e-mail? |
|---|---|
| Material chega ao mínimo ou abaixo pela primeira vez | Sim |
| Material já alertado cai **ainda mais** (ex.: alertado com 20, vai para 19) | Sim |
| Material já alertado continua igual ou melhora, mas segue crítico (ex.: 9 → 10, mínimo 10) | Não |
| Material sobe acima do mínimo e depois volta a cair | Sim (o alerta é "rearmado") |
| Material inativo | Não |
| Falha no envio (SMTP fora do ar, senha errada) | A movimentação é salva normalmente; o erro vai para o log e o envio é tentado de novo na próxima movimentação do material |

Há duas formas de testar:

- **[Opção A — Mailpit](#opção-a--mailpit-teste-local-recomendado)**: o jeito do dia a dia. Nenhum e-mail sai de verdade e não precisa de conta nem de senha.
- **[Opção B — Gmail](#opção-b--envio-real-pelo-gmail)**: para ver o e-mail chegando numa caixa de entrada real.

> **Nunca compartilhe a sua senha de e-mail ou senha de app.** Para o envio real, cada pessoa usa a própria conta.

---

## Opção A — Mailpit (teste local, recomendado)

O [Mailpit](https://mailpit.axllent.org/) é um servidor de e-mail falso: ele recebe tudo o que a API envia e mostra numa caixa de entrada no navegador.

### 1. Subir o Mailpit

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe o banco (`prumo-postgres`) e o Mailpit (`prumo-mailpit`). Confira com `docker ps`.

Caixa de entrada: **http://localhost:8025**

### 2. Configurar a API

No `src/api/.env`, adicione (os mesmos valores do `src/api/.env.example`):

```
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_SECURE=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM="Prumo <nao-responda@prumo.local>"
```

> **Portas ocupadas?** Se outro projeto já usa as portas 1025/8025, defina no `.env` **da raiz**:
>
> ```
> MAILPIT_SMTP_PORT=1026
> MAILPIT_UI_PORT=8026
> ```
>
> Use `MAIL_PORT=1026` no `src/api/.env` e acesse a caixa em http://localhost:8026. Depois rode `docker compose up -d` de novo.

### 3. Subir (ou reiniciar) a API

```bash
cd src/api
npm run start:dev
```

O `.env` só é lido quando a API sobe: **depois de alterar o `.env`, pare (Ctrl+C) e suba de novo**. As migrations (inclusive as colunas do alerta) são aplicadas nesse momento.

### 4. Garantir que existe destinatário

Tem que existir pelo menos um usuário **ativo** com perfil **ADMIN** ou **LIDER**. Sem nenhum, nada é enviado e a API só registra um aviso no log.

No Mailpit, qualquer endereço serve (mesmo fictício, como `admin@prumo.com`).

### 5. Disparar o alerta

1. Suba o front (`cd src/web && npm start`) e faça login.
2. Escolha um material com estoque **acima** do mínimo (ex.: estoque 45, mínimo 10).
3. Em **Movimentações**, faça uma **saída** que deixe o estoque igual ou abaixo do mínimo (ex.: saída de 35 → fica 10).
4. Abra o Mailpit: o e-mail **"[Prumo] Estoque mínimo atingido: ..."** deve aparecer em poucos segundos.

### 6. Roteiro completo (opcional)

Continuando com o mesmo material:

| Passo | Ação | Esperado no Mailpit |
|---|---|---|
| 1 | Saída até o mínimo (45 → 10) | 1 e-mail |
| 2 | Saída de 1 (10 → 9) — piorou | novo e-mail |
| 3 | Entrada de 1 (9 → 10) — ainda crítico | nada |
| 4 | Saída de 1 (10 → 9) — igual ao último alerta | nada |
| 5 | Entrada até passar do mínimo (9 → 30) | nada (alerta rearmado) |
| 6 | Saída até o mínimo de novo (30 → 10) | novo e-mail |
| 7 | Saída com **dois** materiais que fiquem críticos | **um** e-mail listando os dois |
| 8 | Em **Materiais**, aumente o estoque mínimo de um material para acima do estoque atual | e-mail |

**Teste de falha:** pare o Mailpit (`docker stop prumo-mailpit`), faça uma saída que deixe um material no mínimo e confira que a **movimentação é salva normalmente**. No terminal da API aparece `Falha ao enviar alerta de estoque mínimo...`. Suba o Mailpit de novo (`docker start prumo-mailpit`) e faça outra movimentação do material: o alerta sai.

> O Mailpit guarda os e-mails só em memória. Se o container reiniciar, a caixa volta vazia.

---

## Opção B — Envio real pelo Gmail

Use quando quiser ver o e-mail chegando de verdade. Cada pessoa usa **a própria conta Gmail** (conta pessoal; contas de trabalho/escola costumam bloquear a opção abaixo).

### 1. Gerar uma senha de app no Google

O Gmail **não aceita a sua senha normal** para envio pela API. É preciso uma *senha de app*:

1. Acesse https://myaccount.google.com/security e ative a **Verificação em duas etapas** (sem ela, a opção seguinte não aparece).
2. Acesse https://myaccount.google.com/apppasswords.
3. Em **Nome do app**, digite `Prumo` e clique em **Criar**.
4. Copie o código de **16 letras** que aparece. Ele é mostrado **uma única vez** (se perder, é só gerar outro).

### 2. Configurar o `src/api/.env`

> ⚠️ Edite o **`src/api/.env`**, nunca o `src/api/.env.example`. O `.env.example` vai para o Git; o `.env` não.

Comente o bloco do Mailpit e adicione o do Gmail:

```
# --- Mailpit (teste local) ---
# MAIL_HOST=localhost
# MAIL_PORT=1025
# MAIL_SECURE=false
# MAIL_USER=
# MAIL_PASS=
# MAIL_FROM="Prumo <nao-responda@prumo.local>"

# --- Gmail (envio real) ---
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=seuemail@gmail.com
MAIL_PASS=codigodasenhadeapp
MAIL_FROM="Prumo <seuemail@gmail.com>"
```

| Variável | O que é |
|---|---|
| `MAIL_HOST` | Servidor do Gmail — sempre `smtp.gmail.com` (não é o seu e-mail) |
| `MAIL_PORT` / `MAIL_SECURE` | Sempre `465` / `true` |
| `MAIL_USER` | Seu endereço Gmail |
| `MAIL_PASS` | A senha de app de 16 letras (não a senha da conta) |
| `MAIL_FROM` | Seu endereço Gmail de novo — tem que ser o mesmo do `MAIL_USER` |

### 3. Reiniciar a API

Pare (Ctrl+C) e rode `npm run start:dev` de novo. Sem reiniciar, a API continua usando a configuração antiga.

### 4. Colocar o seu e-mail num destinatário

O alerta vai para os usuários ADMIN/LIDER ativos. Pela tela de **Usuários**, troque o e-mail de um usuário ADMIN ou LIDER para o **seu e-mail real** (o mesmo Gmail é o mais garantido).

> Endereços fictícios (ex.: `admin@prumo.com`) continuam recebendo em cópia oculta e o Gmail devolve um aviso de "endereço não encontrado" — pode ignorar.

### 5. Disparar o alerta

Mesmo procedimento da Opção A, passo 5: faça uma saída que deixe um material no mínimo (ou abaixo do último alerta). O e-mail chega em alguns segundos.

### Não chegou?

| Onde olhar | O que significa |
|---|---|
| Pasta **Spam / Lixo eletrônico** | Filtro do provedor. E-mail corporativo (Outlook/Microsoft 365) pode até mandar para quarentena |
| Gmail → **Enviados** | Se o alerta está lá, o envio funcionou; o problema é no destinatário |
| Terminal da API: `Alerta de estoque mínimo enviado ... messageId=...` | O Gmail aceitou o e-mail |
| Terminal da API: `Falha ao enviar alerta ...` com `535 Username and Password not accepted` | Senha de app errada, ou `MAIL_USER` diferente da conta que gerou a senha |
| Nada no terminal e chegou no Mailpit | A API não foi reiniciada, ou o arquivo editado foi o `.env.example` em vez do `.env` |
| Nada no terminal e nada no Mailpit | O material já tinha sido alertado e não piorou (veja a tabela de regras no topo) |

### 6. Voltar para o Mailpit

Comente o bloco do Gmail, descomente o do Mailpit e reinicie a API. Quando não precisar mais, apague a senha de app em https://myaccount.google.com/apppasswords.

---

## Em homologação / produção

Não use conta pessoal. Use uma conta de e-mail do projeto ou um serviço de envio (SendGrid, Brevo, Amazon SES etc.) e configure as variáveis `MAIL_*` direto no servidor, fora do repositório, como já é feito com o `JWT_SECRET`.
