export type CategoryKey = "seo" | "content" | "perf" | "ux";

export interface CategoryMeta {
  key: CategoryKey;
  name: string;
  desc: string;
  iconBg: string;
  color: string;
  icon: React.ReactNode;
}

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  seo: {
    key: "seo",
    name: "SEO Técnico",
    desc: "Meta tags, estrutura de headings, sitemap e indexação.",
    iconBg: "rgba(255,154,99,0.12)",
    color: "#ff9a63",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="#ff9a63" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="#ff9a63" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  content: {
    key: "content",
    name: "Qualidade de Conteúdo",
    desc: "Clareza, originalidade e relevância dos textos.",
    iconBg: "rgba(110,198,255,0.12)",
    color: "#6ec6ff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z"
          stroke="#6ec6ff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9 10h6M9 14h6M9 18h3" stroke="#6ec6ff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  perf: {
    key: "perf",
    name: "Performance",
    desc: "Velocidade de carregamento e otimização de recursos.",
    iconBg: "rgba(255,209,102,0.12)",
    color: "#ffd166",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v3M12 18v3M4.2 12H1M23 12h-3.2M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2"
          stroke="#ffd166"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" stroke="#ffd166" strokeWidth="2" />
      </svg>
    ),
  },
  ux: {
    key: "ux",
    name: "UX e Acessibilidade",
    desc: "Navegação, contraste e usabilidade geral.",
    iconBg: "rgba(167,139,250,0.12)",
    color: "#a78bfa",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2.5" stroke="#a78bfa" strokeWidth="2" />
        <path d="M9 8h6M9 12h6M9 16h3" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
};

export const CATEGORY_ORDER: CategoryKey[] = ["seo", "content", "perf", "ux"];

export function scoreColor(score: number): string {
  if (score < 50) return "#ff5c5c";
  if (score < 75) return "#ffd166";
  return "#4ade80";
}

export function scoreLabel(score: number): string {
  if (score < 40) return "Crítico";
  if (score < 60) return "Razoável";
  if (score < 80) return "Bom";
  return "Excelente";
}
