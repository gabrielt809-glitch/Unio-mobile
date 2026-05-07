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


## v9.5 — Hardening final antes da v10

Versão técnica para deixar a base mais sólida antes de fatura, parcelamentos e mês a mês.

### Melhorias principais

- Criado `js/app-forms.js` com helpers para formulários:
  - `formValue()`
  - `formNumber()`
  - `formDate()`
  - `isDateInputValue()`
  - `formatDateBR()`
  - `getMonthKeyFromDate()`
  - `isSameMonthKey()`
- Criado `js/app-errors.js` com:
  - `safeRun()`
  - `handleAppError()`
  - `safeJsonParse()`
- Criado `js/app-diagnostics.js` com:
  - `getAppDiagnostics()`
  - `logAppDiagnostics()`
- `ui-components.js` recebeu um modal interno reutilizável:
  - `openEditModal()`
  - `closeEditModal()`
  - `saveEditModal()`
  - `collectEditModalValues()`
- Edição de conta, cartão, lançamento e conta da casa deixou de usar `prompt()` e passou a usar o modal interno.
- `APP_SCHEMA_VERSION` atualizado para `5`.
- `app-core.js` passou a usar execução segura via `safeRun()`.
- `styles.css` recebeu a base visual do modal interno.
- `sw.js` atualizado para cachear os novos arquivos.

### Objetivo

Substituir pontos frágeis de UX/código, criar base de diagnóstico e padronizar formulários antes da v10.


## v9.5.1 — Correção de Finanças

Correção de regressão da v9.5.

### Correções

- `commitFinance()` voltou a fazer commit direto:
  - salva estado;
  - renderiza Finanças;
  - atualiza Home.
- Removida a dependência indireta de `commitModule()` no fluxo financeiro.
- Lançamentos agora forçam o mês selecionado para o mês da data lançada, garantindo que apareçam imediatamente.
- Datas dos formulários financeiros agora usam `financeDefaultDate()`, respeitando o mês selecionado.
- Ajustado layout mobile da aba Finanças:
  - linhas de lançamento em uma coluna;
  - botões com quebra segura;
  - textos longos sem invadir containers;
  - mini formulários em uma coluna;
  - lista de contas/cartões mais segura contra overflow.
- Corrigida a visualização de valores, botões e textos que podiam sobrepor containers.

### Arquivos principais

- `js/finance-actions.js`
- `js/finance-core.js`
- `js/finance-render.js`
- `css/styles.css`
- `sw.js`


## v10 — Cartões, faturas e parcelamentos

Primeira versão avançada da aba Finanças.

### Entrou nesta versão

- Compra no cartão com opção de parcelas.
- Parcelamentos geram lançamentos mensais automaticamente.
- Cartões exibem fatura do mês selecionado.
- Cartões exibem valor usado, valor pago, valor em aberto e limite disponível.
- Botão de pagamento de fatura por cartão.
- Pagamento de fatura gera lançamento financeiro vinculado ao cartão.
- Formulário de cartão passa a diferenciar valor total e quantidade de parcelas.
- Data padrão respeita o mês selecionado em Finanças.
- Migração financeira preserva campos de parcelamento e pagamento de fatura.
- `APP_SCHEMA_VERSION` atualizado para `10`.
- `FINANCE_SCHEMA_VERSION` atualizado para `4`.

### Arquivos principais

- `js/finance-core.js`
- `js/finance-calculations.js`
- `js/finance-validators.js`
- `js/finance-render.js`
- `js/finance-actions.js`
- `js/storage.js`
- `css/styles.css`
- `sw.js`


## v11 — Recorrências, categorias e orçamento

### Novidades

- Recorrências mensais na aba Finanças:
  - receita fixa;
  - despesa fixa;
  - início pelo mês selecionado;
  - ativar/desativar;
  - editar e excluir.
- Orçamento por categoria:
  - definir limite mensal por categoria;
  - acompanhar gasto do mês;
  - barra de progresso;
  - alerta visual quando passa de 80% ou ultrapassa o limite.
- Gerenciamento de categorias:
  - adicionar categoria;
  - excluir categoria não padrão;
  - categorias passam a alimentar lançamentos, recorrências e orçamentos.
- Comparativo mensal:
  - receitas do mês atual vs mês anterior;
  - despesas do mês atual vs mês anterior.
- Recorrências entram automaticamente no resumo do mês e na lista de lançamentos como itens virtuais.

### Arquivos principais alterados

- `js/constants.js`
- `js/state-runtime.js`
- `js/storage.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/finance-core.js`
- `js/finance-calculations.js`
- `js/finance-validators.js`
- `js/finance-render.js`
- `js/finance-actions.js`
- `css/styles.css`
- `index.html`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 11`
- `FINANCE_SCHEMA_VERSION = 5`
- cache: `unio-v11-cache-2026-05-06`

### Checklist recomendado

1. Criar uma categoria nova.
2. Definir orçamento para uma categoria.
3. Adicionar uma despesa nessa categoria e validar barra de orçamento.
4. Criar uma despesa fixa recorrente.
5. Trocar o mês e verificar se a recorrência aparece automaticamente.
6. Editar a recorrência.
7. Desativar e reativar a recorrência.
8. Verificar comparativo mensal.
9. Validar se fatura/cartão da v10 continuam funcionando.


## v12 — Casa, casal e projetos

### Novidades

- Área de **Projetos da casa** dentro de Finanças > Casa.
- Projetos padrão:
  - Reforma
  - Compras
  - Sonhos
  - Reserva
- Criação de novos projetos com emoji, nome e meta/valor planejado.
- Edição e exclusão de projetos.
- Itens planejados por projeto:
  - nome do item;
  - valor estimado;
  - valor pago;
  - status;
  - editar/excluir/concluir.
- Contas da casa agora podem ser vinculadas a um projeto.
- Resumo da casa exibe valores de projetos e itens planejados.
- Migração de dados atualizada para `house.projects`.

### Arquivos principais alterados

- `js/constants.js`
- `js/state-runtime.js`
- `js/storage.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/finance-core.js`
- `js/finance-calculations.js`
- `js/finance-validators.js`
- `js/finance-render.js`
- `js/finance-actions.js`
- `css/styles.css`
- `index.html`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 12`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v12-cache-2026-05-06`

### Checklist recomendado

1. Abrir Finanças > Casa.
2. Verificar projetos padrão.
3. Criar um novo projeto.
4. Editar projeto.
5. Adicionar item planejado dentro de um projeto.
6. Marcar item como concluído.
7. Vincular uma conta da casa a um projeto.
8. Verificar resumo de projetos.
9. Trocar mês e confirmar que contas continuam aparecendo no mês certo.


## v13 — Backup, importação e segurança dos dados

### Novidades

- Área **Dados e backup** dentro de Configurações.
- Exportação de backup completo em JSON.
- Importação de backup JSON.
- Exportação de Finanças em CSV.
- Diagnóstico local exibindo:
  - tamanho aproximado dos dados;
  - quantidade de tarefas;
  - quantidade de hábitos;
  - quantidade de lançamentos financeiros.
- Reset seguro com confirmação reforçada.
- Arquivo novo `js/app-backup.js`.

### Segurança

- A importação valida se o arquivo parece ser um backup do Unio.
- A importação substitui os dados atuais apenas após confirmação.
- O reset seguro pede confirmação adicional digitando `APAGAR`.
- O backup exportado inclui versão do schema, data de exportação e diagnóstico.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `sw.js`
- `README.md`
- `js/constants.js`
- `js/navigation.js`
- `js/storage.js`
- `js/app-diagnostics.js`
- `js/app-migrations.js`
- `js/settings.js`

### Arquivo novo

- `js/app-backup.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 13`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v13-cache-2026-05-06`

### Checklist recomendado

1. Abrir Configurações.
2. Verificar a área Dados e backup.
3. Exportar backup JSON.
4. Exportar CSV de Finanças.
5. Importar um backup JSON válido.
6. Confirmar se dados persistem após reload.
7. Testar reset seguro, cancelando antes da confirmação final.


## v14 — Tarefas profissional

### Novidades

- Aba Tarefas redesenhada para uso mais profissional.
- Novas visões:
  - Hoje
  - Semana
  - Sem data
  - Concluídas
- Tarefa com:
  - data;
  - sem data;
  - prioridade;
  - categoria;
  - recorrência controlada.
- Recorrências sem gerar listas infinitas:
  - diária;
  - dias úteis;
  - semanal.
- Edição por modal interno.
- Categorias de tarefas:
  - Pessoal
  - Casa
  - Trabalho
  - Estudos
  - Saúde
  - Financeiro
  - Outros
- Criação e exclusão de categorias personalizadas.
- Home passa a considerar ocorrências recorrentes do dia.
- Backup agora inclui categorias e visão atual das tarefas.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/state-runtime.js`
- `js/storage.js`
- `js/app-migrations.js`
- `js/app-backup.js`
- `js/app-diagnostics.js`
- `js/home.js`
- `js/tasks.js`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 14`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v14-cache-2026-05-06`

### Checklist recomendado

1. Criar tarefa com data.
2. Criar tarefa sem data.
3. Criar tarefa com prioridade alta.
4. Criar tarefa com recorrência diária.
5. Trocar para visão Semana.
6. Marcar ocorrência recorrente como concluída.
7. Editar tarefa pelo modal.
8. Criar categoria personalizada.
9. Verificar se a Home atualiza o contador de tarefas.


## v15 — Hábitos profissional

### Novidades

- Aba Hábitos evoluída para uma versão mais profissional.
- Frequências avançadas:
  - diário;
  - dias úteis;
  - fim de semana;
  - dias específicos;
  - X vezes por semana.
- Criação de hábito com seletor de frequência avançada.
- Edição de hábito por modal interno.
- Streak atual.
- Melhor streak.
- Estatísticas da semana.
- Estatísticas do mês.
- Calendário mensal por hábito.
- Marcação retroativa por dia da semana e por calendário mensal.
- Home passa a respeitar frequência dos hábitos no contador de hoje.
- Migração de hábitos antigos (`diario`/`semanal`) para o novo formato.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/state-runtime.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/home.js`
- `js/habits.js`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 15`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v15-cache-2026-05-06`

### Checklist recomendado

1. Criar hábito diário.
2. Criar hábito de dias úteis.
3. Criar hábito de dias específicos.
4. Criar hábito de X vezes por semana.
5. Marcar hábito hoje.
6. Marcar dia anterior no calendário mensal.
7. Editar hábito pelo modal.
8. Verificar streak atual e melhor streak.
9. Verificar se a Home atualiza o contador de hábitos.


## v16 — Saúde completa

### Novidades

- Aba Saúde evoluída para um diário completo.
- Novo diário de saúde com:
  - peso corporal;
  - humor;
  - energia;
  - dor/desconforto;
  - observação do dia.
- Diário de movimento com atividades sugeridas:
  - caminhada;
  - corrida;
  - bike;
  - musculação;
  - futebol;
  - funcional;
  - alongamento;
  - mobilidade;
  - treino em casa;
  - natação;
  - escada;
  - dança;
  - yoga;
  - pilates;
  - luta;
  - basquete;
  - vôlei;
  - remo.
- Histórico semanal e mensal.
- Gráfico simples de minutos ativos na semana.
- Registro de peso em `weightLog`.
- Passos agora também alimentam `stepsLog`.
- Edição de atividades por modal interno.
- Respiração guiada passa a registrar sessões concluídas com mais de 10 segundos.
- Diagnóstico agora considera diário de saúde, pesos e sessões de respiração.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/state-runtime.js`
- `js/utils.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/home.js`
- `js/health.js`
- `js/breathing.js`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 16`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v16-cache-2026-05-06`

### Checklist recomendado

1. Abrir a aba Saúde.
2. Salvar passos.
3. Salvar diário de saúde com peso, humor, energia e dor.
4. Adicionar atividade usando um chip sugerido.
5. Adicionar atividade manual.
6. Editar uma atividade.
7. Verificar histórico semanal/mensal.
8. Iniciar e parar uma respiração guiada após mais de 10 segundos.
9. Verificar se a Home atualiza minutos ativos.


## v17 — Nutrição completa

### Novidades

- Aba Nutrição evoluída para uma versão mais completa.
- Refeições por período:
  - Café da manhã
  - Almoço
  - Lanche
  - Jantar
  - Ceia
- Metas opcionais:
  - calorias;
  - proteína.
- Registro de calorias e proteína por refeição, de forma opcional.
- Favoritos:
  - salvar refeição como favorita;
  - adicionar favorito ao dia com um toque;
  - excluir favorito.
- Copiar refeições de ontem para hoje.
- Edição de refeições por modal interno.
- Histórico semanal:
  - registros por dia;
  - calorias por dia;
  - refeições mais frequentes.
- Home passa a mostrar calorias do dia no card de Nutrição.
- Migração de dados antigos de Nutrição para o novo formato.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/state-runtime.js`
- `js/utils.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/home.js`
- `js/nutrition.js`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 17`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v17-cache-2026-05-06`

### Checklist recomendado

1. Abrir a aba Nutrição.
2. Salvar metas de calorias e proteína.
3. Adicionar refeição no café da manhã.
4. Adicionar refeição no almoço com proteína.
5. Salvar refeição como favorita.
6. Adicionar favorito ao dia.
7. Editar refeição pelo modal.
8. Copiar refeições de ontem para hoje.
9. Verificar histórico semanal e refeições frequentes.
10. Verificar card de Nutrição na Home.


## v18 — Sono completo

### Novidades

- Aba Sono evoluída para uma versão completa.
- Meta de sono configurável.
- Registro de sono com:
  - horário de dormir;
  - horário de acordar;
  - cálculo automático de duração;
  - qualidade da noite;
  - observação opcional.
- Registro separado de cochilos.
- Score de sono.
- Dívida de sono dos últimos 7 dias.
- Consistência de horário.
- Insights semanais/mensais.
- Histórico com edição por modal interno.
- Gráfico das últimas 7 noites mantido e melhorado.
- Home passa a considerar apenas sono principal, ignorando cochilos no card de sono.
- Migração de registros antigos de sono para o novo formato.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/state-runtime.js`
- `js/storage.js`
- `js/app-backup.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/home.js`
- `js/sleep.js`
- `js/utils.js`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 18`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v18-cache-2026-05-06`

### Checklist recomendado

1. Abrir a aba Sono.
2. Salvar meta de sono.
3. Registrar uma noite de sono.
4. Registrar um cochilo.
5. Editar uma noite pelo modal.
6. Editar um cochilo pelo modal.
7. Excluir um registro.
8. Validar dívida de sono e consistência.
9. Verificar o gráfico das últimas 7 noites.
10. Verificar card de Sono na Home.


## v19 — Água completa

### Novidades

- Aba Água evoluída para uma versão mais completa.
- Meta diária personalizada.
- Sugestão de meta com base no peso salvo em Configurações.
- Progresso mais claro com:
  - porcentagem da meta;
  - quantidade restante;
  - sequência de dias batendo a meta.
- Presets editáveis:
  - adicionar novo preset;
  - editar preset existente;
  - excluir preset.
- Registro manual direto na aba.
- Edição de registros de água por modal interno.
- Exclusão de registros.
- Histórico semanal:
  - consumo por dia;
  - média semanal;
  - dias na meta;
  - total semanal.
- Home passa a exibir sequência de água quando existir.
- Migração de dados antigos de Água para o novo formato com `history`.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/state-runtime.js`
- `js/utils.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/home.js`
- `js/water.js`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 19`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v19-cache-2026-05-06`

### Checklist recomendado

1. Abrir a aba Água.
2. Adicionar água usando preset.
3. Adicionar água manualmente.
4. Editar um registro.
5. Excluir um registro.
6. Editar a meta diária.
7. Usar sugestão de meta pelo peso.
8. Criar novo preset.
9. Editar preset.
10. Verificar histórico semanal e sequência.
11. Verificar card de Água na Home.


## v20 — Foco e bem-estar

### Novidades

- Aba Foco evoluída para uma versão mais completa.
- Presets de foco:
  - Pomodoro 25/5
  - Foco profundo 50/10
  - Sprint 15/3
  - Flow 90/15
  - Personalizado
- Sessão personalizada com foco e pausa.
- Histórico de sessões.
- Revisão pós-foco com:
  - nível de foco;
  - nível de distração;
  - nota do que foi feito.
- Estatísticas:
  - minutos focados hoje;
  - sessões concluídas hoje;
  - minutos focados na semana;
  - sequência de dias com foco;
  - foco médio do dia.
- Gráfico semanal simples.
- Edição e exclusão de sessões.
- Home passa a mostrar minutos focados e sequência de foco.
- Migração de dados antigos de Foco para o novo formato.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/state-runtime.js`
- `js/storage.js`
- `js/app-backup.js`
- `js/app-migrations.js`
- `js/app-diagnostics.js`
- `js/home.js`
- `js/focus.js`
- `js/utils.js`
- `sw.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 20`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v20-cache-2026-05-06`

### Checklist recomendado

1. Abrir a aba Foco.
2. Escolher preset Pomodoro.
3. Escolher preset Foco profundo.
4. Aplicar sessão personalizada.
5. Iniciar, pausar e retomar timer.
6. Concluir uma sessão de foco.
7. Preencher revisão pós-foco.
8. Editar uma sessão no histórico.
9. Excluir uma sessão.
10. Verificar gráfico semanal.
11. Verificar card de Foco na Home.


## v21 — Home inteligente

### Novidades

- Home redesenhada como painel inteligente local.
- Score geral do dia calculado com base em:
  - água;
  - tarefas;
  - hábitos;
  - sono;
  - saúde;
  - foco;
  - nutrição;
  - finanças.
- Bloco de prioridade do dia.
- Alertas locais inteligentes:
  - hidratação baixa;
  - sono abaixo da meta;
  - dívida de sono;
  - orçamento em atenção;
  - muitas tarefas pendentes;
  - meta de água batida;
  - boa entrega de foco.
- Próximas ações priorizadas:
  - concluir tarefa;
  - beber água;
  - manter hábito;
  - registrar alimentação;
  - registrar movimento;
  - fazer foco curto;
  - registrar sono;
  - revisar finanças.
- Cards do painel agora são priorizados automaticamente.
- Resumo semanal ampliado com:
  - sono;
  - minutos ativos;
  - tarefas;
  - hábitos;
  - foco;
  - água.
- Preview financeiro mais contextual.
- Diagnóstico agora consegue exibir score da Home.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/home.js`
- `js/app-diagnostics.js`
- `sw.js`
- `README.md`

### Versões de dados

- `APP_SCHEMA_VERSION = 21`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v21-cache-2026-05-06`

### Checklist recomendado

1. Abrir a Home.
2. Verificar score geral do dia.
3. Verificar próximas ações.
4. Verificar alertas.
5. Conferir se os cards mudam de prioridade conforme pendências.
6. Registrar água e conferir se ação/alerta muda.
7. Concluir tarefa e conferir score.
8. Registrar foco e conferir Home.
9. Verificar resumo semanal.
10. Abrir Finanças pela prévia da Home.


## v22 — Configurações premium

### Novidades

- Área de Configurações redesenhada.
- Perfil centralizado:
  - nome;
  - peso corporal.
- Metas principais em uma única tela:
  - meta diária de água;
  - meta de sono;
  - foco padrão;
  - pausa padrão;
  - meta de calorias;
  - meta de proteína.
- Botão para aplicar sugestões de perfil:
  - meta de água baseada no peso;
  - preenchimento rápido de metas básicas.
- Barra inferior mais organizada:
  - seleção de até 4 abas;
  - contador de abas;
  - visual mais claro para abas ativas.
- Dados e backup reorganizados:
  - total de dados;
  - total de registros;
  - score da Home;
  - schema;
  - resumo por módulo.
- Área Sobre o Unio:
  - versão pública;
  - schema do app;
  - schema de finanças;
  - tamanho dos dados;
  - cache atual;
  - abas fixas;
  - horário do diagnóstico.
- Diagnóstico agora inclui nome do perfil.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/settings.js`
- `js/navigation.js`
- `js/app-backup.js`
- `js/app-diagnostics.js`
- `sw.js`
- `README.md`

### Versões de dados

- `APP_SCHEMA_VERSION = 22`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v22-cache-2026-05-06`

### Checklist recomendado

1. Abrir Configurações.
2. Alterar nome.
3. Alterar peso.
4. Aplicar sugestões de perfil.
5. Salvar metas de água, sono, foco e nutrição.
6. Alterar abas fixas.
7. Validar se barra inferior atualiza.
8. Exportar backup.
9. Verificar diagnóstico de dados.
10. Verificar área Sobre o Unio.


## v23 — Polimento visual global

### Objetivo

A v23 não adiciona um módulo novo. Ela é uma versão de acabamento visual e consistência global para preparar o app para crescer com mais segurança.

### Novidades

- Polimento geral de UX/UI.
- Padronização de:
  - cards;
  - inputs;
  - botões;
  - modais;
  - listas;
  - estados vazios;
  - ações de toque.
- Ajustes de responsividade para iPhone/PWA:
  - uso de `--vh` dinâmico;
  - melhor comportamento em mudança de orientação;
  - melhor convivência com teclado aberto;
  - scroll mais estável em painéis e modais.
- Refinamento da barra inferior:
  - área de toque preservada;
  - texto levemente mais consistente;
  - menos risco de sobreposição visual.
- Melhorias de safe area:
  - conteúdo com respiro no final;
  - toast reposicionado;
  - sheets e modais com limite de altura.
- Melhorias anti-overflow:
  - textos longos quebram melhor;
  - cards e linhas respeitam largura máxima;
  - inputs de data/hora/número mais estáveis no iOS.
- Respeito a `prefers-reduced-motion`.
- Novo arquivo `js/app-polish.js`.

### Arquivos principais alterados

- `index.html`
- `css/styles.css`
- `js/constants.js`
- `js/app-diagnostics.js`
- `sw.js`
- `README.md`

### Arquivo novo

- `js/app-polish.js`

### Versões de dados

- `APP_SCHEMA_VERSION = 23`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v23-cache-2026-05-06`

### Checklist recomendado

1. Abrir a Home.
2. Navegar por todas as abas.
3. Abrir Configurações.
4. Abrir modais de edição em Tarefas, Sono, Nutrição, Saúde e Finanças.
5. Testar com teclado aberto em inputs.
6. Testar barra inferior no PWA instalado.
7. Verificar se nenhum card invade outro.
8. Verificar se textos longos quebram corretamente.
9. Testar em iPhone pequeno e iPhone maior.
10. Confirmar que o app continua salvando dados normalmente.


## v24 — Finanças limpa e validação UX global

### Objetivo

A v24 corrige uma dor importante da experiência: a aba Finanças estava ficando visualmente poluída, com muitos campos de preenchimento e botões de edição/exclusão aparecendo ao mesmo tempo.

### Principais mudanças em Finanças

- Nova **Central financeira** na visão Pessoal:
  - Contas;
  - Cartões;
  - Planejamento.
- Formulários deixam de ficar expostos o tempo todo.
- Cadastros agora aparecem por ação:
  - + Conta;
  - + Cartão;
  - + Recorrência;
  - + Orçamento;
  - + Categoria.
- Lançamentos usam botão **Ações** em vez de mostrar Editar/Excluir sempre.
- Contas, cartões, recorrências, orçamentos e categorias também usam ações contextuais.
- Na visão Casa:
  - contas da casa usam botão Ações;
  - projetos usam botão Ações;
  - itens de projeto usam botão Ações;
  - formulário de item aparece só quando solicitado.
- Novo menu contextual visual para ações financeiras.

### Validação UX global

Foi adicionado o arquivo:

- `UX_VALIDATION_v24.md`

Ele documenta a revisão de UX por módulo:

- Home;
- Água;
- Tarefas;
- Sono;
- Nutrição;
- Saúde;
- Finanças;
- Hábitos;
- Foco;
- Configurações.

### Arquivos principais alterados

- `js/finance-render.js`
- `js/finance-actions.js`
- `css/styles.css`
- `js/constants.js`
- `js/app-diagnostics.js`
- `sw.js`
- `README.md`

### Arquivo novo

- `UX_VALIDATION_v24.md`

### Versões de dados

- `APP_SCHEMA_VERSION = 24`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v24-cache-2026-05-06`

### Checklist recomendado

1. Abrir Finanças > Pessoal.
2. Validar Central financeira.
3. Adicionar conta.
4. Adicionar cartão.
5. Adicionar recorrência.
6. Adicionar orçamento.
7. Adicionar categoria.
8. Criar lançamento.
9. Usar botão Ações em lançamento.
10. Abrir Finanças > Casa.
11. Criar conta da casa.
12. Criar projeto.
13. Adicionar item por botão Ações.
14. Validar se os formulários não ficam expostos desnecessariamente.
15. Navegar por todas as abas e validar UX geral.


## v25 — Experiência inspirada no app Minhas Finanças

### Objetivo

A v25 reorganiza a experiência de uso, usando como inspiração o app Minhas Finanças enviado nos anexos.

A ideia não é copiar visualmente, mas aplicar o mesmo princípio:

- tela mais amigável;
- menos campos expostos;
- cards mais claros;
- ação principal por botão;
- formulários somente quando necessários;
- menus contextuais.

### Finanças

A aba Finanças recebeu uma nova experiência:

- alternância visível entre Pessoal e Casa;
- resumo mensal em destaque;
- busca de lançamentos;
- card de Contas;
- card de Cartões de crédito;
- extrato agrupado por data;
- botão flutuante de adicionar;
- menu rápido com:
  - Transferência;
  - Receita;
  - Despesa;
  - Despesa cartão.
- ações contextuais em contas, cartões e lançamentos.

### Água

Correção visual importante:

- os botões de copos rápidos não mostram mais editar/excluir o tempo todo;
- edição/exclusão fica em “Gerenciar copos rápidos”;
- registros usam botão Ações.

### Arquivo novo

- `UX_DIRECTION_v25.md`

### Arquivos principais alterados

- `js/finance-render.js`
- `js/water.js`
- `css/styles.css`
- `js/constants.js`
- `js/app-diagnostics.js`
- `sw.js`
- `README.md`

### Versões de dados

- `APP_SCHEMA_VERSION = 25`
- `FINANCE_SCHEMA_VERSION = 6`
- cache: `unio-v25-cache-2026-05-06`

### Checklist recomendado

1. Abrir Finanças.
2. Alternar entre Pessoal e Casa.
3. Usar o botão flutuante.
4. Criar receita.
5. Criar despesa.
6. Criar despesa cartão.
7. Validar extrato por data.
8. Abrir Água.
9. Validar copos rápidos limpos.
10. Gerenciar copos rápidos.
