import { useState } from "react";
import type { SkillCategory, SkillScore } from "../../../shared/types";

type PlayerRadarProps = {
  scores: SkillScore[];
  baselineScores?: SkillScore[];
};

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 104;
const MAX_SCORE = 10;
const RINGS = [2, 4, 6, 8, 10];

function point(index: number, radius: number) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / 6;
  return `${CENTER + Math.cos(angle) * radius},${CENTER + Math.sin(angle) * radius}`;
}

function coordinates(index: number, radius: number) {
  const [x, y] = point(index, radius).split(",").map(Number);
  return { x, y };
}

export function PlayerRadar({ scores, baselineScores }: PlayerRadarProps) {
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const visibleScores = scores.slice(0, 6);
  const labels = visibleScores.length === 6 ? visibleScores : [...visibleScores, ...Array.from({ length: 6 - visibleScores.length }, (_, index) => ({ skill_id: `empty-${index}`, skill_name: "", category: "attack" as SkillCategory, score: null, source: null, note: null, recorded_at: null }))];
  const plottedPoints = labels.map((score, index) => point(index, RADIUS * (score.score ?? 0) / MAX_SCORE)).join(" ");
  const baseline = baselineScores?.slice(0, 6);
  const baselineLabels = baseline && (baseline.length === 6 ? baseline : [...baseline, ...Array.from({ length: 6 - baseline.length }, (_, index) => ({ skill_id: `empty-baseline-${index}`, skill_name: "", category: "attack" as SkillCategory, score: null, source: null, note: null, recorded_at: null }))]);
  const baselinePoints = baselineLabels?.map((score, index) => point(index, RADIUS * (score.score ?? 0) / MAX_SCORE)).join(" ");
  const activeIndex = labels.findIndex((score) => score.skill_id === activeSkillId);
  const activeScore = activeIndex >= 0 ? labels[activeIndex] : null;
  const activeBaseline = activeScore && baseline?.find((score) => score.skill_id === activeScore.skill_id)?.score;
  const activeMarker = activeScore ? coordinates(activeIndex, RADIUS * (activeScore.score ?? 0) / MAX_SCORE) : null;

  return <div className="radar-wrap"><div className="radar-chart-wrap"><svg className="player-radar" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Player skill radar chart scaled from 1 to 10"><title>Player skill radar. Hover a point to see the exact score.</title>{RINGS.map((ring) => <polygon key={ring} points={Array.from({ length: 6 }, (_, index) => point(index, RADIUS * ring / MAX_SCORE)).join(" ")} className="radar-grid" />)}{labels.map((score, index) => { const axis = coordinates(index, RADIUS); return <line key={`axis-${score.skill_id}`} x1={CENTER} y1={CENTER} x2={axis.x} y2={axis.y} className="radar-axis" />; })}{baselinePoints && <polygon points={baselinePoints} className="radar-baseline" /> }<polygon points={plottedPoints} className="radar-value" />{labels.map((score, index) => { if (!score.skill_name) return null; const marker = coordinates(index, RADIUS * (score.score ?? 0) / MAX_SCORE); const label = coordinates(index, RADIUS + 25); return <g key={`point-${score.skill_id}`}><circle className="radar-point" cx={marker.x} cy={marker.y} r="5" tabIndex={0} aria-label={`${score.skill_name}: ${score.score ?? "Not assessed"} out of 10`} onMouseEnter={() => setActiveSkillId(score.skill_id)} onMouseLeave={() => setActiveSkillId(null)} onFocus={() => setActiveSkillId(score.skill_id)} onBlur={() => setActiveSkillId(null)}><title>{`${score.skill_name}: ${score.score?.toFixed(1) ?? "Not assessed"} / 10`}</title></circle><text x={label.x} y={label.y} className="radar-label" textAnchor="middle" dominantBaseline="middle">{score.skill_name}</text></g>; })}</svg>{activeScore && activeMarker && <div className="radar-tooltip" role="status" style={{ left: `${activeMarker.x / SIZE * 100}%`, top: `${activeMarker.y / SIZE * 100}%` }}><strong>{activeScore.skill_name}</strong><span>Current <b>{formatScore(activeScore.score)}</b></span><span>Starting point <b>{formatScore(activeBaseline)}</b></span><span>Variation <b>{formatVariation(activeScore.score, activeBaseline)}</b></span></div>}</div><div className="radar-scale" aria-label="Radar scale">1–10 · 0.5 increments</div><div className="radar-legend" aria-label="Radar series and skill categories"><span><i className="radar-legend-dot baseline" />Starting point</span><span><i className="radar-legend-dot current" />Current</span><span><i className="radar-legend-dot attack" />Attack</span><span><i className="radar-legend-dot defense" />Defense</span></div></div>;
}

function formatScore(score: number | null | undefined) {
  return score === null || score === undefined ? "Not assessed" : `${score.toFixed(1)} / 10`;
}

function formatVariation(current: number | null, baseline: number | null | undefined) {
  if (current === null || baseline === null || baseline === undefined) return "Not available";
  const change = current - baseline;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)} pts`;
}
