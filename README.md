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
