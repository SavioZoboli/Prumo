# Guia de estilização (SCSS + Angular Material M3)

Como usar `_palette.scss`, `_themes.scss`, `_tokens.scss` e `_shared-patterns.scss`
para estilizar componentes neste projeto.

## 1. Como as peças se encaixam

```
_palette.scss          → rampas de cor (M3/HCT), geradas a partir das cores de marca
       ↓
_themes.scss            → aplica as rampas no Angular Material (mat.theme), gera
                           as variáveis --mat-sys-* e alterna claro/escuro
       ↓
_tokens.scss             → variáveis de apoio que o Material não cobre: espaçamento,
                           raio, sombra, cores semânticas de status
       ↓
_shared-patterns.scss    → placeholders SCSS (%nome) que combinam --mat-sys-* e
                           --app-* em blocos de UI prontos (card, tabela, form...)
       ↓
seus componentes         → usam var(--mat-sys-*) / var(--app-*) direto no CSS,
                           e @extend %placeholder para reaproveitar os blocos
```

**Regra de ouro: nunca escreva um hex direto no CSS de um componente.** Se a cor
já existe como `var(--mat-sys-*)` ou `var(--app-*)`, use a variável — ela troca
sozinha entre tema claro/escuro. Só use hex literal dentro de `_palette.scss`.

---

## 2. Variáveis do Angular Material (`var(--mat-sys-*)`)

Geradas automaticamente pelo `mat.theme()` em `_themes.scss`, a partir das
paletas `primary` e `tertiary`. Você não declara essas variáveis — só usa.

### 2.1 Pares "cor de fundo" + "cor de texto sobre ela"

O Material sempre anda em pares: uma cor de fundo (`--mat-sys-X`) e a cor de
texto/ícone que garante contraste sobre ela (`--mat-sys-on-X`). **Sempre use o
par junto.**

| Fundo | Texto/ícone sobre o fundo | Quando usar |
|---|---|---|
| `--mat-sys-primary` | `--mat-sys-on-primary` | Botão principal, cabeçalho de tabela, destaque forte |
| `--mat-sys-secondary` | `--mat-sys-on-secondary` | Destaque secundário (menos comum que primary) |
| `--mat-sys-tertiary` | `--mat-sys-on-tertiary` | Acento adicional (datepicker, slider, chips do Material) |
| `--mat-sys-error` | `--mat-sys-on-error` | Estado de erro do próprio Material (form fields, etc.) |
| `--mat-sys-surface` | `--mat-sys-on-surface` | Fundo padrão da página/tela |
| `--mat-sys-surface-variant` | `--mat-sys-on-surface-variant` | Texto secundário/legenda sobre `surface` (labels, breadcrumbs, ícones neutros) |

Exemplo:

```scss
.meu-card {
  background-color: var(--mat-sys-surface-container-low);
  color: var(--mat-sys-on-surface);

  .titulo {
    color: var(--mat-sys-primary);
  }

  .legenda {
    color: var(--mat-sys-on-surface-variant); // texto secundário, mais apagado
  }
}
```

### 2.2 Superfícies (fundos empilhados)

M3 usa "camadas" de superfície para dar profundidade sem sombra pesada — cada
nível é um pouco mais claro (tema claro) ou mais escuro (tema escuro) que o
anterior:

| Variável | Uso típico |
|---|---|
| `--mat-sys-surface` | Fundo base da página |
| `--mat-sys-surface-container-lowest` | Fundo "mais raso" que a página (raro) |
| `--mat-sys-surface-container-low` | Card, painel — 1 nível acima do fundo (o mais usado em `_shared-patterns.scss`) |
| `--mat-sys-surface-container` | Hover de linha de tabela, elementos dentro de um card |
| `--mat-sys-surface-container-high` | Elemento em destaque dentro de um card |
| `--mat-sys-surface-container-highest` | Elemento no topo da pilha (modal sobre modal, por ex.) |

Regra prática: se o elemento está "dentro" de outro elemento visualmente,
suba um nível de container.

### 2.3 Bordas e divisores

| Variável | Uso |
|---|---|
| `--mat-sys-outline` | Borda de elemento interativo (input, botão outline) |
| `--mat-sys-outline-variant` | Divisor discreto (linha entre seções, borda de tabela) |

### 2.4 Outras que aparecem no projeto

- `--mat-sys-primary` também é usado como cor de acento em bordas (`border-top:
  3px solid var(--mat-sys-primary)`, ver `%form-container` / `%table-container`).
- Para customizar um componente específico do Material (ex.: snackbar), use as
  variáveis `--mdc-*` daquele componente (ex.: `--mdc-snackbar-container-color`,
  ver `%success-snackbar` em `_shared-patterns.scss`).

> Lista completa de tokens do M3: veja a [documentação oficial do Angular
> Material sobre theming](https://material.angular.dev/guide/theming) — os
> nomes das variáveis batem 1:1 com os "system tokens" do Material Design 3.

---

## 3. Variáveis do projeto (`var(--app-*)`, de `_tokens.scss`)

Cobrem o que o Material não define: espaçamento, raio, sombra e cores
semânticas de status.

### 3.1 Espaçamento

```scss
--app-space-xs   // 4px
--app-space-sm   // 8px
--app-space-md   // 16px
--app-space-lg   // 24px
--app-space-xl   // 32px
```

Use sempre esses valores em `padding`, `margin`, `gap` — não digite `px`/`rem`
direto, para manter o ritmo visual consistente entre telas.

### 3.2 Raio de borda

```scss
--app-radius-sm    // 4px  — chips pequenos, badges
--app-radius-md    // 6px  — botões, inputs
--app-radius-lg    // 8px  — cards, containers
--app-radius-xl    // 12px — modais, painéis grandes
--app-radius-pill  // 999px — chip/pill totalmente arredondado
```

### 3.3 Sombra

```scss
--app-shadow-sm  // sombra leve — card, tabela em repouso
--app-shadow-md  // sombra mais forte — hover, elemento elevado
```

### 3.4 Cores semânticas de status

Dois conjuntos, para dois contextos diferentes:

**Alto contraste** (fundo forte + texto branco) — para snackbar, badge de
destaque, qualquer coisa que precise "gritar":

```scss
--app-success / --app-success-on
--app-danger  / --app-danger-on
--app-warning / --app-warning-on
--app-info    / --app-info-on   // já aponta pro --mat-sys-secondary do tema
```

**Suave** (fundo claro + texto colorido da mesma família) — para chip/tag de
baixo contraste (é o que `%status-chip` usa):

```scss
--app-success-soft-bg / --app-success-soft-on
--app-warning-soft-bg / --app-warning-soft-on
--app-danger-soft-bg  / --app-danger-soft-on
--app-info-soft-bg    / --app-info-soft-on
```

Todos já validados em WCAG AA (4.5:1 para texto normal). **Não crie cor de
status nova sem checar contraste** — reaproveite estas quatro sempre que der.

### 3.5 Cores de marca "cruas"

```scss
--app-brand-primary    // petróleo, uso decorativo (logo, ilustração)
--app-brand-secondary  // laranja, uso decorativo — só 2.77:1 sobre branco,
                        // NUNCA use em texto normal
```

Para cor com significado em texto/ícone pequeno, use sempre `var(--mat-sys-primary)`
em vez de `var(--app-brand-primary)` — a rampa do Material já garante contraste.

---

## 4. Padrões compartilhados (`_shared-patterns.scss`)

São `%placeholders` do Sass — não geram CSS sozinhos, só quando você dá
`@extend` neles. Import no topo do `.scss` do componente:

```scss
@use '../../shared/shared-patterns' as *; // ajuste o caminho relativo
```

(ou `@forward`/caminho do seu setup — o importante é o alias `as *`, para usar
`%nome` direto sem prefixo.)

### 4.1 Uso básico

```scss
.minha-pagina-header {
  @extend %page-header;
  @extend %page-header.with-actions; // ou adicione a classe no template
}

.meu-form-card {
  @extend %form-container;
}

.meu-form {
  @extend %cadastro-form;
}

.status {
  @extend %status-chip;
  // no template: <span class="status success">Ativo</span>
}
```

### 4.2 Catálogo rápido

| Placeholder | Para quê |
|---|---|
| `%page-container` | Padding + centralização da página |
| `%page-header` (`.with-actions`) | Cabeçalho com breadcrumb + título + ações |
| `%btn` / `%btn-discrete` | Botão de ação principal / botão de contorno |
| `%form-container` | Card que envolve um formulário |
| `%cadastro-form` | Layout em coluna com espaçamento entre campos |
| `%form-row` | Linha de campo com label de seção |
| `%full-width` | `width: 100%` |
| `%field-icon` | Ícone dentro de campo de formulário |
| `%loading-overlay` | Overlay de carregamento sobre um card |
| `%form-actions` | Rodapé do form (Cancelar/Salvar) |
| `%table-container` | Card que envolve uma tabela |
| `%custom-table` | Estilo de cabeçalho/linha/hover da tabela |
| `%custom-paginator` | Estilo do paginator do Material |
| `%filtros-container` | Barra de filtros acima de uma listagem |
| `%fw-500` | Texto com peso 500, cor padrão |
| `%inline-icon` | Ícone pequeno inline com texto |
| `%align-right` | Alinhamento de coluna de tabela à direita |
| `%action-btn` (`.edit-btn`, `.delete-btn`) | Botão de ação em linha de tabela |
| `%empty-state` | Mensagem de "lista vazia" |
| `%report-container` / `%report-header` | Container/cabeçalho de tela de relatório |
| `%state-message` | Mensagem central de estado (vazio/erro) com ícone |
| `%status-chip` (`.success` `.warning` `.danger` `.info`) | Chip de status |
| `%success-snackbar` / `%error-snackbar` | Estilo de snackbar do Material |

### 4.3 Placeholders ainda por definir

`%card-grid`, `%status-card` e `%status-badge` são um esqueleto genérico
(grid responsivo + card com faixa lateral de status) — funcionam, mas ainda
não têm o conteúdo interno definido porque não há protótipo de tela para
isso neste projeto ainda. Ajuste as classes internas (`.status-indicator`,
`.card-content`) quando a tela existir.

`%status-chip` só tem os 4 estados semânticos genéricos (`success`,
`warning`, `danger`, `info`). Quando o domínio do projeto definir seus
próprios estados (ex.: nomes de status de negócio), adicione um modificador
seguindo o padrão já existente:

```scss
%status-chip {
  // ...
  &.meu-estado {
    background-color: var(--app-info-soft-bg); // reaproveite um dos 4 soft-bg
    color: var(--app-info-soft-on);
  }
}
```

---

## 5. Alternando tema claro/escuro

Controlado por classe na tag `<html>`:

- Sem classe → segue `prefers-color-scheme` do sistema operacional.
- `.dark-theme` → força escuro.
- Nenhuma outra classe é necessária para forçar claro (é o padrão).

```ts
// exemplo de serviço de tema
document.documentElement.classList.toggle('dark-theme', escuro);
localStorage.setItem('tema', escuro ? 'dark' : 'light');
```

Como todo o resto do projeto usa `var(--mat-sys-*)` / `var(--app-*)`, nada
mais precisa mudar — a troca de classe já reflete em toda a UI.

---

## 6. Checklist rápido ao estilizar um componente novo

- [ ] Cor de fundo/texto → `var(--mat-sys-*)`, nunca hex.
- [ ] Espaçamento/raio/sombra → `var(--app-space-*)` / `var(--app-radius-*)` /
      `var(--app-shadow-*)`.
- [ ] Existe um `%placeholder` em `_shared-patterns.scss` para esse bloco?
      Use `@extend` antes de escrever do zero.
- [ ] Cor de status → uma das 4 já existentes em `_tokens.scss`
      (success/warning/danger/info), não invente uma nova sem checar contraste.
- [ ] Se precisar de hex fora dessas variáveis, pare — provavelmente falta uma
      variável no lugar certo (`_tokens.scss`), não um hex solto no componente.