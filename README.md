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
