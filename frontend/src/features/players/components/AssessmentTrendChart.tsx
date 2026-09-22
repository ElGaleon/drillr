import type { AssessmentHistory } from "../../../shared/types";

type AssessmentTrendChartProps = { history: AssessmentHistory[]; compact?: boolean };

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(value));
}

export function AssessmentTrendChart({ history, compact = false }: AssessmentTrendChartProps) {
  const grouped = new Map<string, { date: string; values: number[] }>();
  [...history].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at)).forEach((item) => {
    const key = item.recorded_at.slice(0, 10);
    const group = grouped.get(key) ?? { date: item.recorded_at, values: [] };
    group.values.push(item.score);
    grouped.set(key, group);
  });
  const points = [...grouped.values()].map((group) => ({ date: group.date, score: group.values.reduce((total, value) => total + value, 0) / group.values.length }));
  if (!points.length) return <div className="chart-empty">Record the first snapshot to see progress over time.</div>;
  const width = 560;
  const height = compact ? 116 : 220;
  const padding = { top: 18, right: 18, bottom: 30, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const x = (index: number) => padding.left + (points.length === 1 ? chartWidth / 2 : index * chartWidth / (points.length - 1));
  const y = (score: number) => padding.top + chartHeight - (score / 10) * chartHeight;
  const line = points.map((point, index) => `${x(index)},${y(point.score)}`).join(" ");

  return <div className={`trend-chart-wrap${compact ? " trend-chart-compact" : ""}`}><svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Average assessment score over time"><title>Average assessment score over time</title>{[2, 4, 6, 8, 10].map((value) => <g key={value}><line x1={padding.left} y1={y(value)} x2={width - padding.right} y2={y(value)} className="trend-grid" /><text x={padding.left - 9} y={y(value) + 3} className="trend-axis-label" textAnchor="end">{value}</text></g>)}<polyline points={line} className="trend-line" fill="none" />{points.map((point, index) => <g key={`${point.date}-${index}`}><circle cx={x(index)} cy={y(point.score)} r={compact ? 3.5 : 5} className="trend-point"><title>{`${formatShortDate(point.date)}: ${point.score.toFixed(1)} / 10`}</title></circle>{(!compact || index === 0 || index === points.length - 1) && <text x={x(index)} y={height - 8} className="trend-date-label" textAnchor="middle">{formatShortDate(point.date)}</text>}</g>)}</svg><div className="trend-chart-caption"><span>Average score across skills</span><strong>{points.at(-1)?.score.toFixed(1)} / 10 current</strong></div></div>;
}

