"use client";

import { useEffect, useState } from "react";
import { CATEGORY_META, CategoryKey, scoreColor } from "@/lib/categoryMeta";

export interface AnalysisCategory {
  key: CategoryKey;
  name: string;
  score: number;
  points: string[];
}

export default function ResultCard({
  category,
  expanded,
  onToggle,
}: {
  category: AnalysisCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = CATEGORY_META[category.key];
  const color = scoreColor(category.score);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setBarWidth(category.score));
    return () => cancelAnimationFrame(raf);
  }, [category.score]);

  return (
    <div className="result-card">
      <button className="result-card-head" onClick={onToggle}>
        <div className="result-card-icon" style={{ background: meta.iconBg }}>
          {meta.icon}
        </div>
        <div className="result-card-body">
          <div className="result-card-toprow">
            <span className="result-card-name">{meta.name}</span>
            <span className="result-card-score" style={{ color }}>
              {category.score}
            </span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ background: color, width: `${barWidth}%` }} />
          </div>
        </div>
        <svg
          className="chevron"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" stroke="#918e86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {expanded && (
        <div className="result-card-points">
          {category.points.map((pt, i) => (
            <div className="point" key={i}>
              <span className="point-dot" />
              {pt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
