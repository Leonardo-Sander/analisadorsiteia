"use client";

import { useState } from "react";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categoryMeta";
import ScoreRing from "@/components/ScoreRing";
import ResultCard, { AnalysisCategory } from "@/components/ResultCard";

const SUGGESTED_URLS = ["meusite.com.br", "lojaonline.com", "portfolio.dev", "blog-exemplo.com"];

type Screen = "home" | "result";
type Status = "loading" | "ready" | "error";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [status, setStatus] = useState<Status>("loading");
  const [urlValue, setUrlValue] = useState("");
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const [categories, setCategories] = useState<AnalysisCategory[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copiar relatório");

  function goHome() {
    setScreen("home");
    setUrlValue("");
    setAnalyzedUrl("");
    setCategories([]);
    setExpanded({});
    setErrorMessage("");
    setCopyLabel("Copiar relatório");
  }

  async function startAnalysis(rawUrl?: string) {
    const target = (rawUrl ?? urlValue ?? "").trim() || "meusite.com.br";
    setScreen("result");
    setStatus("loading");
    setAnalyzedUrl(target);
    setExpanded({});
    setErrorMessage("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.error ?? "Não foi possível analisar esse site.");
        setStatus("error");
        return;
      }
      setAnalyzedUrl(data.url ?? target);
      setCategories(data.categories as AnalysisCategory[]);
      setStatus("ready");
    } catch {
      setErrorMessage("Falha de conexão. Verifique sua internet e tente novamente.");
      setStatus("error");
    }
  }

  function toggleCard(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function onCopyReport() {
    const overallScore = categories.length
      ? Math.round(categories.reduce((a, c) => a + c.score, 0) / categories.length)
      : 0;
    const lines = [`Relatório siteradar — ${analyzedUrl}`, `Score geral: ${overallScore}/100`, ""];
    categories.forEach((c) => {
      lines.push(`${c.name}: ${c.score}/100`);
      c.points.forEach((pt) => lines.push(`  - ${pt}`));
      lines.push("");
    });
    navigator.clipboard?.writeText(lines.join("\n")).catch(() => {});
    setCopyLabel("Copiado ✓");
    setTimeout(() => setCopyLabel("Copiar relatório"), 1800);
  }

  const isHomeScreen = screen === "home";
  const isResultScreen = screen === "result";
  const isLoading = status === "loading";
  const isReady = status === "ready";
  const isError = status === "error";

  const overallScore = categories.length
    ? Math.round(categories.reduce((a, c) => a + c.score, 0) / categories.length)
    : 0;

  const faviconLetter = (analyzedUrl || "M").replace(/^https?:\/\//, "").charAt(0).toUpperCase();

  return (
    <div className="shell">
      <div className="glow" />

      <div className="header">
        <div className="header-inner">
          <button className="logo" onClick={goHome}>
            <div className="logo-mark">Δ</div>
            <span className="logo-text">siteradar</span>
          </button>
          <div>
            {isResultScreen && (
              <button className="btn-ghost" onClick={goHome}>
                Nova análise
              </button>
            )}
          </div>
        </div>
      </div>

      {isHomeScreen && (
        <div className="home-wrap">
          <div className="hero">
            <div className="badge">
              <span className="badge-dot" />
              Análise com IA em segundos
            </div>
            <h1>
              Descubra o que tá
              <br />
              segurando <span>seu site</span>
            </h1>
            <p className="subtitle">
              Cole uma URL e deixe a IA vasculhar SEO, conteúdo, performance e acessibilidade — com
              recomendações prontas pra aplicar.
            </p>
          </div>

          <div className="search-box">
            <div className="search-row">
              <div className="search-field">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <circle cx="12" cy="12" r="9" stroke="#f2f0ec" strokeWidth="1.6" />
                  <path
                    d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9z"
                    stroke="#f2f0ec"
                    strokeWidth="1.6"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="cole a URL do site aqui — ex: meusite.com.br"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startAnalysis();
                  }}
                />
              </div>
              <button className="btn-analyze" onClick={() => startAnalysis()}>
                Analisar →
              </button>
            </div>

            <div className="examples">
              <span className="examples-label">experimente:</span>
              {SUGGESTED_URLS.map((label) => (
                <button className="chip" key={label} onClick={() => startAnalysis(label)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="cats-section">
            <p className="cats-title">O que a gente avalia</p>
            <div className="cats-grid">
              {CATEGORY_ORDER.map((key) => {
                const cat = CATEGORY_META[key];
                return (
                  <div className="cat-card" key={key}>
                    <div className="cat-icon" style={{ background: cat.iconBg }}>
                      {cat.icon}
                    </div>
                    <h3 className="cat-name">{cat.name}</h3>
                    <p className="cat-desc">{cat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isResultScreen && (
        <>
          <div className="result-wrap">
            <div className="result-header">
              <div className="favicon">{faviconLetter}</div>
              <div className="result-meta">
                <div className="result-url">{analyzedUrl}</div>
                {isLoading && (
                  <div className="result-status">
                    <span className="spinner" />
                    Analisando com IA…
                  </div>
                )}
                {isReady && <div className="result-done">Análise concluída agora</div>}
                {isError && <div className="result-status is-error">Não foi possível concluir a análise</div>}
              </div>
            </div>

            {isLoading && (
              <>
                <div className="score-skel-wrap">
                  <div className="score-skel-circle shimmer" />
                  <div className="score-skel-label shimmer" />
                </div>
                <div className="rows-col">
                  {[1, 2, 3, 4].map((i) => (
                    <div className="shimmer-row" key={i}>
                      <div className="icon-skel shimmer" />
                      <div className="lines">
                        <div className="line-1 shimmer" />
                        <div className="line-2 shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {isError && <div className="error-block">{errorMessage}</div>}

            {isReady && (
              <>
                <ScoreRing score={overallScore} />
                <div className="cards-col">
                  {categories.map((cat) => (
                    <ResultCard
                      key={cat.key}
                      category={cat}
                      expanded={!!expanded[cat.key]}
                      onToggle={() => toggleCard(cat.key)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {isReady && (
            <div className="action-bar">
              <div className="action-bar-inner">
                <button className="btn-secondary" onClick={onCopyReport}>
                  {copyLabel}
                </button>
                <button className="btn-primary" onClick={goHome}>
                  Analisar outro site
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
