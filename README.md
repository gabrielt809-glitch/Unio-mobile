# Unio — Base Organizada v1

Esta versão separa o app em uma estrutura mais saudável para GitHub + Vercel, sem mudar a proposta visual do HTML original.

## Estrutura

```text
unio/
├─ index.html
├─ css/
│  └─ styles.css
└─ js/
   ├─ data.js
   ├─ state.js
   ├─ state-runtime.js
   ├─ navigation.js
   ├─ settings.js
   ├─ home.js
   ├─ water.js
   ├─ tasks.js
   ├─ sleep.js
   ├─ nutrition.js
   ├─ health.js
   ├─ breathing.js
   ├─ habits.js
   ├─ focus.js
   ├─ ux.js
   ├─ onboarding.js
   ├─ storage.js
   └─ app.js
```

## Como atualizar no GitHub pelo iPhone

1. Baixe e extraia o ZIP.
2. Entre no repositório do Unio no GitHub.
3. Envie/substitua estes arquivos e pastas:
   - `index.html`
   - pasta `css`
   - pasta `js`
4. Faça commit.
5. A Vercel deve publicar automaticamente depois do commit.

## Observações importantes

- A chave desta versão é organização, não novas funcionalidades.
- O app ainda usa `localStorage`.
- As funções continuam expostas de forma compatível com os `onclick` do HTML.
- Em uma próxima etapa, podemos remover os `onclick` inline e padronizar eventos via JavaScript.
