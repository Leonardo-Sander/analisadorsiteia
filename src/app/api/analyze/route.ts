import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const CATEGORY_KEYS = ["seo", "content", "perf", "ux"] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

const CATEGORY_NAMES: Record<CategoryKey, string> = {
  seo: "SEO Técnico",
  content: "Qualidade de Conteúdo",
  perf: "Performance",
  ux: "UX e Acessibilidade",
};

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function fetchSiteHtml(url: string): Promise<{ html: string; finalUrl: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; siteradar/1.0; +https://siteradar.app)",
      },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;
    const text = await res.text();
    return { html: text.slice(0, 60000), finalUrl: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor. Adicione sua chave em .env.local." },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url : "";
  if (!rawUrl.trim()) {
    return NextResponse.json({ error: "Informe uma URL para analisar." }, { status: 400 });
  }

  const url = normalizeUrl(rawUrl);
  const site = await fetchSiteHtml(url);

  const contextBlock = site
    ? `HTML obtido de ${site.finalUrl} (pode estar truncado):\n\n${site.html}`
    : `Não foi possível baixar o HTML de ${url} (site fora do ar, bloqueou o acesso ou demorou demais para responder). Deixe isso explícito nos pontos das categorias afetadas, em vez de inventar detalhes que dependeriam do HTML real.`;

  const client = new Anthropic({ apiKey });

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system:
        "Você é um auditor técnico de sites. Analise o HTML fornecido e avalie quatro categorias: " +
        "'seo' (meta description, title, canonical, estrutura de headings, sitemap/robots quando inferível), " +
        "'content' (clareza, originalidade, prova social, qualidade dos CTAs), " +
        "'perf' (sinais estáticos de performance: peso de scripts/CSS, recursos bloqueantes, otimização de imagens, carregamento de fontes — deixe claro que é uma estimativa heurística baseada no HTML, não uma medição de laboratório como Lighthouse) e " +
        "'ux' (navegação, contraste, acessibilidade: atributo alt em imagens, área de toque, labels de formulário, hierarquia visual). " +
        "Seja específico e cite evidências reais encontradas no HTML sempre que possível, em vez de generalidades. " +
        "Se o HTML não pôde ser obtido, seja honesto sobre essa limitação nos pontos relevantes. " +
        "Responda sempre em português do Brasil, em tom direto, objetivo e levemente informal.",
      messages: [
        {
          role: "user",
          content: `Analise este site:\nURL solicitada: ${rawUrl}\n\n${contextBlock}`,
        },
      ],
      tools: [
        {
          name: "site_analysis",
          description: "Retorna a análise estruturada do site em quatro categorias fixas.",
          input_schema: {
            type: "object",
            properties: {
              categories: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  properties: {
                    key: { type: "string", enum: CATEGORY_KEYS as unknown as string[] },
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    points: {
                      type: "array",
                      minItems: 3,
                      maxItems: 6,
                      items: { type: "string" },
                    },
                  },
                  required: ["key", "score", "points"],
                },
              },
            },
            required: ["categories"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "site_analysis" },
    });
  } catch (err) {
    console.error("Anthropic API error", err);
    return NextResponse.json({ error: "Falha ao consultar a IA. Tente novamente em instantes." }, { status: 502 });
  }

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) {
    return NextResponse.json({ error: "A IA não retornou uma análise válida." }, { status: 502 });
  }

  const input = toolUse.input as { categories: Array<{ key: string; score: number; points: string[] }> };

  const categories = CATEGORY_KEYS.map((key) => {
    const match = input.categories.find((c) => c.key === key);
    return {
      key,
      name: CATEGORY_NAMES[key],
      score: match ? Math.max(0, Math.min(100, Math.round(match.score))) : 0,
      points: match?.points?.slice(0, 6) ?? ["A IA não retornou detalhes para esta categoria."],
    };
  });

  return NextResponse.json({
    url: site?.finalUrl ?? url,
    fetched: !!site,
    categories,
  });
}
