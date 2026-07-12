"use client";

import { useEffect, useRef, useState } from "react";
import { scoreColor, scoreLabel } from "@/lib/categoryMeta";

const CIRCUMFERENCE = 502;

export default function ScoreRing({ score }: { score: number }) {
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);
  const [displayScore, setDisplayScore] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setDashOffset(CIRCUMFERENCE - (CIRCUMFERENCE * score) / 100);
    });

    const start = performance.now();
    const duration = 1000;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      setDisplayScore(Math.round(score * p));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [score]);

  const color = scoreColor(score);

  return (
    <div className="score-ring-wrap">
      <div className="score-ring">
        <svg width="176" height="176">
          <circle cx="88" cy="88" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            className="fg"
            cx="88"
            cy="88"
            r="80"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div
          className="score-fill"
          style={{
            background: color + "14",
            border: `1px solid ${color}22`,
            boxShadow: `0 0 40px ${color}22`,
          }}
        >
          <div className="score-num" style={{ color }}>
            {displayScore}
          </div>
          <div className="score-max">/ 100</div>
        </div>
      </div>
      <div className="score-pill" style={{ background: color + "22", color }}>
        {scoreLabel(score)}
      </div>
    </div>
  );
}
