# Unio — Base Organizada v4

Projeto estático do Unio preparado para GitHub + Vercel.

## Estrutura

```text
index.html
manifest.webmanifest
assets/icons/
css/styles.css
js/
sw.js
vercel.json
```

## O que mudou na v4

- Correção estrutural da rotina diária: água, nutrição, passos e sessões de foco são zerados ao virar o dia.
- Tarefas agora têm semana navegável com botões para avançar e voltar semanas.
- A seleção “sem data” de tarefas passa a persistir corretamente no estado.
- Resumo semanal da Home agora considera apenas os itens da semana atual.
- Textos digitados pelo usuário em tarefas, hábitos, saúde e nutrição são protegidos antes de renderizar na tela.
- Modal de meta de água agora abre já preenchido com a meta atual.
- Service Worker adicionado para melhorar comportamento PWA/offline e cache do app instalado.
- Renderização das abas ficou mais robusta ao trocar de tela ou voltar para o app depois de deixá-lo aberto.

## Atualização no GitHub

Substitua no repositório:

```text
index.html
manifest.webmanifest
assets/
css/
js/
README.md
sw.js
vercel.json
```

Depois faça commit. A Vercel deve atualizar o deploy automaticamente.

> Observação: por causa do Service Worker, após o deploy pode ser necessário fechar e abrir o app instalado ou limpar o cache do Safari se a versão antiga continuar aparecendo por alguns minutos.


## v7
- Barra inferior refinada em formato de dock flutuante, com safe area mais controlada no iPhone.
- Abas renderizadas como botões acessíveis, com `aria-label`, estado ativo e contagem dinâmica.
- Microinterações de seleção preservando `prefers-reduced-motion`.


## v8 — Identidade visual premium

- Novo ícone `U.` full-bleed, sem borda neon interna, para ficar mais natural na tela inicial do iPhone.
- Splash refinado com o ícone do Unio e comportamento diferente para primeiro acesso e retorno ao app.
- Home redesenhada com hero premium, resumo do dia, cards mais consistentes e preparação visual para Finanças.
- Mantida a estrutura modular do app: visual no `styles.css`, Home no `home.js`, inicialização no `app.js`.
- Cache atualizado para `unio-v8-9-cache-2026-05-04`.


## v8.9 — Barra inferior reestruturada

- `js/navigation.js`: a barra inferior agora renderiza uma camada interna `.tabbar-inner`.
- `css/styles.css`: `#tabbar` cuida apenas do fundo/safe area; `.tabbar-inner` cuida da posição dos botões.
- Objetivo: reduzir o efeito de ícones “boiando” dentro da barra e melhorar a transição visual entre conteúdo e navegação.
- Cache atualizado para `unio-v8-9-cache-2026-05-04`.

## v9 — Finanças base

- Nova aba **Finanças** adicionada ao app.
- Duas visualizações internas: **Pessoal** e **Casa**.
- Visão Pessoal com cartões de resumo, contas, cartões e lançamentos simples.
- Tipos de lançamento: receita, despesa, transferência e gasto no cartão.
- Visão Casa com contas compartilhadas, divisão 50/50 ou proporcional por renda e status pago/pendente.
- Estado financeiro salvo no `localStorage` junto com o restante do app.
- Barra inferior preservada da v8.9, com Finanças adicionada como aba padrão para novas instalações e migração do padrão antigo.

Arquivos principais alterados nesta versão:

- `index.html`
- `css/styles.css`
- `js/state.js`
- `js/state-runtime.js`
- `js/navigation.js`
- `js/storage.js`
- `js/utils.js`
- `js/finance.js`
- `sw.js`


## v9.1 — Validação UX da aba Finanças

- Corrigido risco de overflow nos formulários da aba Finanças, principalmente em campos de data no iOS/WebKit.
- Forms financeiros foram tratados como mobile-first, com uma coluna por padrão para evitar invasão de containers.
- Listas de lançamentos, contas e cartões agora usam `minmax(0, 1fr)`, truncamento seguro e colunas mais estáveis.
- Topbar de Finanças recebeu comportamento responsivo para telas estreitas.
- Datas das listas foram encurtadas para `dd/mm`, reduzindo quebra visual e invasão dos valores.
- Cache atualizado para `unio-v9-1-cache-2026-05-06`.


## v9.2 — Organização técnica de Finanças

- Aba Finanças reorganizada internamente por seções: helpers, cálculos, renderização e ações.
- Botões separados de receita/despesa/transferência/cartão substituídos por um único botão “+”.
- O botão “+” abre uma caixa de seleção com as opções adequadas para Pessoal ou Casa.
- Formulários de lançamento só aparecem depois da escolha do tipo de ação.
- Contas agora mostram saldo e podem ser editadas rapidamente.
- Cartões agora podem ter nome, limite, fechamento e vencimento editados.
- Lançamentos pessoais e contas da casa passaram a ter edição rápida.
- Mantida a base visual e a barra inferior corrigida da v8.9/v9.


## v9.3 — Saúde do código

Versão técnica antes da v10. Não adiciona grandes funcionalidades novas.

### Melhorias estruturais

- `finance.js` foi reduzido para coordenador do módulo.
- A lógica de Finanças foi dividida em:
  - `js/finance-core.js`
  - `js/finance-calculations.js`
  - `js/finance-validators.js`
  - `js/finance-render.js`
  - `js/finance-actions.js`
  - `js/finance.js`
- Cálculos, renderização, validações e mutações de estado ficam em arquivos separados.
- Adicionado `commitFinance()` para centralizar salvamento e renderização após mudanças financeiras.
- Adicionadas validações para transações, contas, cartões e contas da casa.
- Adicionadas fábricas para criar transações, contas, cartões e contas da casa com campos consistentes.
- Adicionado `schemaVersion: 3` no estado de Finanças.
- Melhorada a migração de dados financeiros carregados do localStorage.
- Service Worker atualizado para cachear os novos arquivos do módulo Finanças.

### Objetivo

Preparar o app para a v10, que deve adicionar fatura, parcelamentos e navegação mês a mês com menos risco de quebrar a base existente.


## v9.4 — Saúde global do código

Versão técnica antes da v10, sem grandes funcionalidades novas.

### Melhorias globais

- Adicionado `js/constants.js` para versões de schema, defaults de abas e defaults financeiros.
- Adicionado `APP_SCHEMA_VERSION = 4` e `FINANCE_SCHEMA_VERSION = 3`.
- Adicionado `js/app-core.js` com `commitApp()` e `commitModule()` para centralizar salvamento/renderização.
- Adicionado `js/ui-components.js` com helpers iniciais reutilizáveis:
  - `uiEmptyState()`
  - `uiSectionHead()`
  - `uiPill()`
  - `uiSafeText()`
- Adicionado `js/app-migrations.js` com migração global:
  - `migrateLoadedState()`
  - `normalizeStateAfterLoad()`
- `storage.js` agora salva `schemaVersion` global e passa dados carregados por migração.
- `finance-actions.js` passa a usar o commit global quando disponível.
- `state-runtime.js` usa constantes globais para defaults e versões.
- `sw.js` atualizado para cachear os novos arquivos.
- `styles.css` recebeu uma seção inicial de componentes UI globais.

### Checklist manual recomendado

1. Abrir o app no Safari e no app instalado na tela inicial.
2. Confirmar que a Home carrega sem tela branca.
3. Alternar entre as abas fixas da barra inferior.
4. Abrir Finanças > Pessoal.
5. Abrir o botão `+` e testar cada tipo de lançamento.
6. Editar conta e saldo.
7. Abrir Finanças > Casa.
8. Adicionar conta da casa.
9. Trocar mês em Finanças.
10. Fechar e abrir o app novamente para validar persistência.
11. Confirmar que a barra inferior continua correta.
12. Confirmar que não há overflow no campo de data no iPhone.

### Objetivo

Deixar o app inteiro mais preparado para crescer sem acúmulo de dívida técnica, antes da v10.
