# Unio — Auditoria UX Pesada de Finanças v26

## Objetivo

Esta auditoria revisa a aba Finanças do Unio após a v25, comparando o estado atual com a experiência desejada inspirada no app Minhas Finanças.

A v26 corrige dois pontos imediatos:

1. Extrato não deve ser único.
2. Modal de edição não pode quebrar o container.

Também documenta a direção para a próxima rodada de UX.

---

# 1. Problemas identificados

## 1.1 Extrato único mistura contextos diferentes

### Problema

O extrato único mistura:

- lançamentos de conta;
- despesas de cartão;
- pagamentos de fatura;
- transferências;
- itens de casa/projetos, quando houver integração futura.

Isso prejudica a leitura porque conta bancária e cartão têm naturezas diferentes.

### Correção v26

O extrato foi separado em:

- **Extratos por conta**
- **Extratos por cartão**

Cada conta/cartão agora tem sua própria seção, com lançamentos agrupados por data.

### Ganho UX

- Mais parecido com apps financeiros reais.
- Melhor leitura da carteira/banco.
- Fatura do cartão não se mistura com saldo de conta.
- Facilita localizar de onde saiu o dinheiro.

---

## 1.2 Modal “Editar lançamento” quebrado

### Problema

O modal estava com:

- título encostando/cortando na borda esquerda;
- campos muito largos;
- espaçamento interno ruim;
- botão de fechar desalinhado;
- ações muito próximas do limite inferior.

### Correção v26

Foi aplicada correção forte de CSS no modal:

- padding interno no cabeçalho;
- grid seguro para título + botão fechar;
- campos 100% dentro do container;
- labels ajustadas;
- botões com altura melhor;
- limite de altura com scroll;
- ajuste específico para iPhones menores.

### Ganho UX

- Modal fica visualmente estável.
- Campos não invadem bordas.
- Título deixa de ser cortado.
- A experiência de edição fica mais segura.

---

# 2. Auditoria da visão Pessoal

## 2.1 Topo financeiro

### Estado atual

O topo com mês, saldo inicial, saldo atual e previsto está no caminho certo.

### Manter

- Mês centralizado.
- Navegação por mês.
- Saldo atual em destaque.

### Melhorias futuras

- Permitir tocar no saldo para ver composição.
- Diferenciar melhor saldo real e saldo previsto.

---

## 2.2 Busca

### Estado atual

A busca existe e ajuda.

### Ajuste já aplicado anteriormente

A busca foi ajustada para não renderizar a cada tecla de forma agressiva.

### Melhoria futura

- Resultado da busca deve destacar em qual conta/cartão o item está.
- Pode ganhar filtro rápido: Todos, Contas, Cartões.

---

## 2.3 Cards de Contas

### Estado atual

Os cards estão visualmente melhores, mas ainda podem evoluir.

### Problema

Os valores podem ficar genéricos se não houver diferença entre saldo atual e previsto.

### Recomendação

Cada conta deve ter:

- saldo atual;
- previsto;
- entradas do mês;
- saídas do mês;
- botão discreto de ações.

### Direção

Tocar na conta deve abrir detalhes da conta, com:

- extrato daquela conta;
- editar conta;
- ajustar saldo;
- excluir conta.

---

## 2.4 Cards de Cartões

### Estado atual

Os cartões aparecem em card separado.

### Problema

Ainda falta uma lógica mais forte de fatura.

### Recomendação

Cada cartão deve ter uma tela própria com:

- fatura atual;
- fatura anterior;
- limite;
- limite disponível;
- fechamento;
- vencimento;
- compras parceladas;
- pagamento de fatura.

### Correção parcial v26

O extrato de cartão agora fica separado do extrato de conta.

---

## 2.5 Botão flutuante +

### Estado atual

O botão + está certo como ação principal.

### Manter

- Transferência;
- Receita;
- Despesa;
- Despesa cartão.

### Melhoria futura

Criar tela dedicada para cada ação, não formulário inline.

Fluxo ideal:

1. tocar em Receita;
2. abrir tela/modal full-screen Nova Receita;
3. preencher;
4. salvar;
5. voltar para a visão principal.

---

# 3. Auditoria da visão Casa

## 3.1 Resumo da casa

### Estado atual

A visão Casa tem resumo de total, pago e pendente.

### Problema

Ainda pode ficar com cara de planilha se muitas contas/projetos aparecerem.

### Recomendação

Separar melhor em:

- Contas do mês;
- Divisão;
- Projetos;
- Reserva da casa.

---

## 3.2 Contas da casa

### Estado atual

Contas da casa usam menu de ações.

### Manter

Esse padrão está correto.

### Melhorias futuras

- Agrupar por categoria.
- Mostrar pago/pendente com chips.
- Permitir filtro: todas, pagas, pendentes.

---

## 3.3 Projetos da casa

### Estado atual

Projetos agora não deixam formulários de item abertos o tempo todo.

### Manter

Formulário só deve abrir quando o usuário pedir.

### Melhorias futuras

Projeto poderia abrir uma tela própria:

- objetivo;
- progresso;
- itens;
- valor planejado;
- valor pago;
- próximos itens a comprar.

---

# 4. Regras UX definidas após a auditoria

A partir da v26, a área de Finanças deve seguir estas regras:

## Regra 1 — Extrato nunca deve misturar tudo

Deve existir separação por:

- conta;
- cartão;
- futuramente casa/projeto.

## Regra 2 — Formulário não deve aparecer sem intenção

Campos só aparecem quando o usuário escolhe uma ação.

## Regra 3 — Edição deve ser contextual

Usar:

- três pontinhos;
- botão Ações;
- toque no item para abrir opções.

Evitar muitos botões fixos.

## Regra 4 — Conta e cartão devem ter lógicas diferentes

Conta representa saldo.
Cartão representa fatura.

Eles não devem dividir o mesmo extrato.

## Regra 5 — Casa não deve virar planilha

Casa precisa de cards e fluxos guiados, não vários campos espalhados.

---

# 5. Correções aplicadas na v26

- Extrato único substituído por **extratos por conta**.
- Extrato de cartão separado em **extratos por cartão**.
- Busca continua afetando os extratos.
- Modal de edição corrigido:
  - título;
  - espaçamento;
  - campos;
  - botão fechar;
  - ações inferiores;
  - responsividade mobile.

---

# 6. Próximos passos recomendados

## v27 sugerida — Telas dedicadas de lançamento

Criar tela/modal full-screen para:

- Nova Receita;
- Nova Despesa;
- Nova Transferência;
- Nova Despesa Cartão;
- Nova Conta;
- Novo Cartão.

## v28 sugerida — Detalhes de conta/cartão

Criar tela de detalhes para:

- Conta;
- Cartão;
- Projeto da casa.

## v29 sugerida — Refinamento Casa

Reorganizar Casa com:

- contas do mês;
- divisão;
- projetos;
- reserva;
- filtros pagos/pendentes.

---

# 7. Checklist de teste da v26

1. Abrir Finanças > Pessoal.
2. Criar receita em uma conta.
3. Criar despesa em uma conta.
4. Criar despesa cartão.
5. Conferir se o extrato aparece separado por conta.
6. Conferir se o extrato aparece separado por cartão.
7. Usar busca e verificar se filtra os extratos.
8. Tocar em lançamento e editar.
9. Validar se o modal não corta título.
10. Validar se os campos ficam dentro do container.
11. Abrir Finanças > Casa.
12. Validar se a visão Casa continua funcionando.
13. Testar com teclado aberto no iPhone/PWA.

## Status

A v26 corrige problemas importantes de leitura e estabilidade visual. A próxima evolução recomendada é substituir formulários inline por telas dedicadas de lançamento.
