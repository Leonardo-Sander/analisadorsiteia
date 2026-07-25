# siteradar

Analisador de sites com IA. Cole uma URL e receba uma auditoria de SEO técnico,
qualidade de conteúdo, performance e UX/acessibilidade — gerada em tempo real
pela API do Google Gemini, a partir do HTML real do site.

**Stack:** Next.js · TypeScript · React · Google Gemini

<!-- Tire um print da tela de resultado, salve como docs/preview.png e descomente:
![Tela de resultado do siteradar](docs/preview.png)
-->

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

## Decisões

**Saída estruturada por JSON schema.** Pedir "responda em JSON" no prompt
funciona na maioria das vezes, e é justamente o "na maioria" que quebra. O
`responseSchema` é garantido pela API: o modelo é obrigado a devolver nota de
0 a 100 e a lista de pontos para as quatro categorias, sempre no mesmo formato.

**Timeout de 8s e limite de 60 KB no HTML.** Site fora do ar não pode travar a
requisição, e página muito grande estouraria a janela de contexto do modelo.

**Honestidade quando o HTML não vem.** Se o site bloqueia o acesso ou não
responde, o prompt instrui o modelo a declarar essa limitação nos pontos das
categorias afetadas, em vez de inventar detalhes que dependeriam do conteúdo
real.

**Modo mock.** Sem `GEMINI_API_KEY` a aplicação serve dados de exemplo. Permite
desenvolver a interface sem consumir cota da API.

## Limitações conhecidas

- A nota de performance é uma estimativa heurística a partir do HTML, não uma
  medição real de laboratório como o Lighthouse
- Sites renderizados inteiramente no cliente devolvem pouco HTML útil, o que
  reduz a qualidade da análise
- Os resultados não são salvos: cada análise existe apenas enquanto a aba está
  aberta

## Deploy

Ao publicar (Vercel ou outro), configure a variável de ambiente
`GEMINI_API_KEY` no provedor de hospedagem.

Antes de expor a aplicação publicamente, trate o acesso a endereços de rede
interna: a rota recebe uma URL do usuário e faz `fetch` nela, o que permitiria
alcançar serviços internos (SSRF). Valide o IP resolvido antes da requisição.
