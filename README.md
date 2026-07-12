# siteradar

Analisador de sites com IA. Cole uma URL e receba uma auditoria de SEO técnico,
qualidade de conteúdo, performance e UX/acessibilidade — gerada em tempo real
pela API do Google Gemini, a partir do HTML real do site.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Edite `.env.local` e adicione sua chave (grátis em [aistudio.google.com/apikey](https://aistudio.google.com/apikey)):

```
GEMINI_API_KEY=...
```

Sem chave configurada, a aplicação funciona normalmente com dados de exemplo
(modo mock), útil para testar a interface sem custo.

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Como funciona

- `src/app/page.tsx` — UI (tela inicial + tela de resultado, com skeleton de
  carregamento e cards expansíveis por categoria)
- `src/app/api/analyze/route.ts` — busca o HTML do site informado e envia para
  o modelo `gemini-flash-latest` via `@google/genai`, com saída estruturada
  (JSON schema) contendo nota e pontos por categoria
- `src/components/` — `ScoreRing` (anel de nota animado) e `ResultCard`
  (card expansível de categoria)
- `src/lib/categoryMeta.tsx` — ícones, cores e descrições fixas de cada
  categoria (SEO, Conteúdo, Performance, UX)

## Deploy

Ao publicar (Vercel ou outro), configure a variável de ambiente
`GEMINI_API_KEY` no provedor de hospedagem.
