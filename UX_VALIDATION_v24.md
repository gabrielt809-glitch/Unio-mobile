# Unio — Validação UX Global v24

## Objetivo da rodada

Esta rodada foca em reduzir poluição visual, melhorar clareza das ações e validar se o app continua confortável no uso diário após muitas versões de evolução.

## Resultado principal

A maior intervenção foi na aba **Finanças**, que estava com muitas opções de preenchimento expostas ao mesmo tempo.

Agora a lógica fica mais parecida com um app financeiro profissional:

- visão principal mais limpa;
- ações iniciadas por botões;
- cadastros agrupados;
- edições concentradas em menus de ação;
- formulários aparecem somente quando necessários.

---

## 1. Home

### Pontos validados

- Score geral do dia permanece como elemento central.
- Próximas ações continuam claras.
- Cards priorizados continuam úteis.
- Resumo semanal não compete visualmente com os cards principais.

### Estado

A Home está em bom nível visual. Não exige refatoração imediata.

### Recomendações futuras

- Em versão futura, permitir ocultar cards menos usados.
- Adicionar um modo compacto/confortável nas Configurações.

---

## 2. Água

### Pontos validados

- A tela tem boa hierarquia: anel, presets, meta, histórico e registros.
- Presets editáveis estão úteis.
- Histórico semanal melhora a percepção de progresso.

### Risco observado

- Em iPhones menores, muitos presets podem gerar uma área mais carregada.

### Correção/mitigação atual

A v23/v24 mantém scroll horizontal/estrutura responsiva. O app segue utilizável.

### Recomendações futuras

- Limitar visualmente presets na primeira linha e mover excedentes para “Ver todos”.

---

## 3. Tarefas

### Pontos validados

- Visões Hoje/Semana/Sem data/Concluídas ajudam a reduzir bagunça.
- Edição por modal é melhor do que campos expostos.
- Recorrências não geram lista infinita.

### Estado

A aba está funcional e organizada.

### Recomendações futuras

- Criar busca/filtro por categoria.
- Adicionar ordenação por prioridade/data.

---

## 4. Sono

### Pontos validados

- Registro principal, cochilo, insights e histórico estão bem separados.
- O formulário de sono ainda é direto, mas não excessivamente poluído.

### Estado

Boa UX geral.

### Recomendações futuras

- Em versão futura, permitir expandir/recolher histórico.

---

## 5. Nutrição

### Pontos validados

- A tela tem muitas funcionalidades, mas a divisão por refeições ajuda.
- Favoritos reduzem repetição.
- Metas opcionais são úteis.

### Risco observado

- Pode ficar extensa em dias com muitos registros.

### Recomendações futuras

- Adicionar seções recolhíveis por refeição.
- Mostrar apenas refeições com itens por padrão, com botão para expandir todas.

---

## 6. Saúde

### Pontos validados

- Diário de saúde e diário de movimento estão separados.
- Chips de atividade ajudam a acelerar o registro.
- Histórico melhora a utilidade.

### Estado

Boa estrutura. Visualmente mais densa, mas aceitável.

### Recomendações futuras

- Criar modo “registro rápido” e “detalhado”.

---

## 7. Finanças

### Problema principal identificado

A aba estava com muitas opções de preenchimento expostas ao mesmo tempo, especialmente:

- contas com formulário de adição sempre visível;
- cartões com formulário sempre visível;
- recorrências com formulário sempre visível;
- categorias com adição sempre visível;
- projetos da casa com campos sempre visíveis;
- itens de projeto com campos sempre visíveis;
- muitos botões “Editar” e “Excluir” espalhados por vários containers.

### Correção aplicada na v24

A aba Finanças foi reorganizada para um fluxo mais limpo:

#### Pessoal

- Métricas continuam no topo.
- Botão de novo lançamento continua como ação principal.
- Cadastros foram agrupados na **Central financeira**:
  - Contas;
  - Cartões;
  - Planejamento.
- Formulários aparecem somente ao clicar em:
  - + Conta;
  - + Cartão;
  - + Recorrência;
  - + Orçamento;
  - + Categoria.
- Lançamentos usam botão **Ações** em vez de mostrar editar/excluir sempre.

#### Casa

- Contas da casa usam botão **Ações**.
- Projetos da casa não exibem mais formulário de novo item o tempo todo.
- Novo projeto aparece por botão.
- Item de projeto aparece por ação específica.
- Edições/exclusões foram concentradas em menu contextual.

### Ganho esperado

- Menos campos competindo na tela.
- Menos ruído visual.
- Fluxo mais parecido com app financeiro real.
- Menos chance de o usuário editar/apagar algo sem intenção.
- Melhor leitura dos containers.

---

## 8. Hábitos

### Pontos validados

- Frequências avançadas estão organizadas.
- Calendário mensal é útil, mas visualmente denso.

### Recomendações futuras

- Permitir recolher o calendário mensal por hábito.
- Mostrar calendário apenas ao tocar em “Detalhes”.

---

## 9. Foco

### Pontos validados

- Presets deixam a experiência clara.
- Histórico pós-foco adiciona valor sem pesar muito.
- Tela está visualmente consistente.

### Recomendações futuras

- Adicionar modo compacto para quem só quer iniciar timer.

---

## 10. Configurações

### Pontos validados

- Perfil, metas, backup e Sobre o Unio estão bem organizados.
- Diagnóstico ajuda na saúde do app.
- Boa centralização de metas.

### Recomendações futuras

- Adicionar modo visual: compacto/confortável.
- Adicionar “ocultar módulos que não uso”.

---

## Checklist manual recomendado para deploy da v24

1. Abrir Finanças > Pessoal.
2. Verificar se Contas/Cartões/Planejamento aparecem fechados na Central financeira.
3. Abrir Contas e adicionar conta.
4. Abrir Cartões e adicionar cartão.
5. Abrir Planejamento e adicionar recorrência.
6. Adicionar orçamento.
7. Adicionar categoria.
8. Criar lançamento normal.
9. Usar botão Ações em lançamento.
10. Usar botão Ações em conta.
11. Usar botão Ações em cartão.
12. Ir para Finanças > Casa.
13. Criar conta da casa.
14. Usar Ações em conta da casa.
15. Criar projeto da casa.
16. Usar Ações no projeto para adicionar item.
17. Usar Ações no item do projeto.
18. Navegar por todas as abas.
19. Abrir modais de edição em cada aba.
20. Testar com teclado aberto no iPhone/PWA.

## Status

A v24 é uma melhoria importante de UX e organização, especialmente na aba Finanças. Ela prepara o aplicativo para a próxima etapa de saúde de código e QA geral.
