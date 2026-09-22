import { useMemo, useState } from "react";
import { ArrowUpRight, ClipboardText, TrendUp } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AssessmentTrendChart } from "../components/AssessmentTrendChart";
import { api } from "../../../shared/lib/api";
import { averageChange, averageScore } from "../utils/assessmentMetrics";
import { formatDate, initials } from "../../../shared/lib/utils";
import { Avatar } from "../../../shared/components/ui/avatar";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { PageHeader } from "../../../shared/components/layout/AppShell";
import { useWorkspace } from "../../workspace/WorkspaceContext";
import { WorkspaceState } from "../../workspace/WorkspaceState";
import type { TeamAssessmentRecord } from "../../../shared/types";

type Period = "season" | "90" | "all";

export function TeamAssessmentsPage() {
  const { selectedTeam } = useWorkspace();
  const [period, setPeriod] = useState<Period>("season");
  const query = useQuery({ queryKey: ["team-assessments", selectedTeam?.id], queryFn: () => api.teamAssessments(selectedTeam!.id), enabled: Boolean(selectedTeam) });
  const records = useMemo(() => query.data?.map((record) => filterRecord(record, period)) ?? [], [query.data, period]);
  const assessed = records.filter((record) => record.skills.history.length);
  const changes = assessed.flatMap((record) => { const change = averageChange(record.skills.current, record.skills.history); return change === null ? [] : [change]; });
  const reached = records.reduce((total, record) => total + record.goals.filter((goal) => goalReached(goal, record)).length, 0);
  const goalCount = records.reduce((total, record) => total + record.goals.length, 0);

  return <WorkspaceState><PageHeader eyebrow="Development / team view" title="Assessments" description="Compare player growth by period, then open a profile for the full radar and timeline." actions={<Select value={period} onValueChange={(value) => setPeriod(value as Period)}><SelectTrigger className="period-select" aria-label="Assessment period"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="season">This season</SelectItem><SelectItem value="90">Last 90 days</SelectItem><SelectItem value="all">All time</SelectItem></SelectContent></Select>} />{query.isLoading ? <div className="team-assessment-skeleton">{[1, 2, 3].map((item) => <div className="skeleton-row" key={item} />)}</div> : query.error ? <Card className="state-card"><h2>Assessments unavailable</h2><p>{(query.error as Error).message}</p></Card> : <><div className="assessment-summary-grid"><SummaryMetric label="Players assessed" value={assessed.length} helper={`of ${records.length} players`} /><SummaryMetric label="Average change" value={changes.length ? `${changes.reduce((total, change) => total + change, 0) / changes.length >= 0 ? "+" : ""}${(changes.reduce((total, change) => total + change, 0) / changes.length).toFixed(1)}` : "—"} helper="from first snapshot" tone="positive" /><SummaryMetric label="Objectives reached" value={`${reached}/${goalCount || 0}`} helper="across the team" tone="orange" /></div><div className="team-assessment-grid"><Card className="team-progress-card"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">Roster comparison</p><CardTitle>Player development</CardTitle></div><Badge>{assessed.length} with data</Badge></div></CardHeader><CardContent>{records.length ? <div className="team-assessment-list">{records.sort((a, b) => (averageChange(b.skills.current, b.skills.history) ?? -99) - (averageChange(a.skills.current, a.skills.history) ?? -99)).map((record) => <TeamAssessmentRow record={record} key={record.player.id} />)}</div> : <div className="empty-state"><div className="empty-icon"><ClipboardText size={25} /></div><h2>No players yet</h2><p>Add a player and the team assessment view will fill up with trend data.</p></div>}</CardContent></Card><Card className="team-trend-card"><CardHeader><p className="eyebrow">Selected period</p><CardTitle>Team score trend</CardTitle></CardHeader><CardContent>{assessed.length ? <AssessmentTrendChart history={assessed.flatMap((record) => record.skills.history)} /> : <div className="chart-empty">No assessment data for this period.</div>}<div className="team-trend-note"><TrendUp size={18} /><span>Each point is the average of all skill scores recorded on that day.</span></div></CardContent></Card></div></>}</WorkspaceState>;
}

function filterRecord(record: TeamAssessmentRecord, period: Period): TeamAssessmentRecord {
  if (period === "all") return record;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (period === "90" ? 90 : 365));
  return { ...record, skills: { ...record.skills, history: record.skills.history.filter((item) => new Date(item.recorded_at) >= cutoff) } };
}

function goalReached(goal: TeamAssessmentRecord["goals"][number], record: TeamAssessmentRecord) {
  const score = goal.skill_id ? record.skills.current.find((item) => item.skill_id === goal.skill_id)?.score : averageScore(record.skills.current);
  return score !== null && score !== undefined && score >= goal.target_score;
}

function TeamAssessmentRow({ record }: { record: TeamAssessmentRecord }) {
  const current = averageScore(record.skills.current);
  const change = averageChange(record.skills.current, record.skills.history);
  const latest = record.skills.history.at(0)?.recorded_at;
  const reached = record.goals.filter((goal) => goalReached(goal, record)).length;
  return <Link to={`/players/${record.player.id}/assessments`} className="team-assessment-row"><Avatar imageUrl={record.player.photo_url}>{initials(record.player.first_name, record.player.last_name)}</Avatar><div className="team-player-name"><strong>{record.player.preferred_name || `${record.player.first_name} ${record.player.last_name}`}</strong><span>{record.player.primary_role}</span></div><div className="team-row-metric"><span>Current</span><strong>{current?.toFixed(1) ?? "—"}</strong></div><div className="team-row-metric"><span>Change</span><strong className={change === null ? "" : change >= 0 ? "summary-positive" : "summary-negative"}>{change === null ? "—" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}`}</strong></div><div className="team-row-metric"><span>Objectives</span><strong>{record.goals.length ? `${reached}/${record.goals.length}` : "—"}</strong></div><div className="team-row-date"><span>Last snapshot</span><strong>{latest ? formatDate(latest) : "Not assessed"}</strong></div><ArrowUpRight size={17} className="row-arrow" /></Link>;
}

function SummaryMetric({ label, value, helper, tone }: { label: string; value: string | number; helper: string; tone?: "positive" | "orange" }) {
  return <Card className={`assessment-summary-card${tone ? ` summary-card-${tone}` : ""}`}><CardContent><span>{label}</span><strong>{value}</strong><small>{helper}</small></CardContent></Card>;
}

