import type { ReactNode } from "react";
import {ArrowUpRightIcon, BookOpen, CalendarBlank, ChartLineUp, Flag, Ruler, UserCircle} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PlayerRadar } from "../components/PlayerRadar";
import { averageScore, averageChange, baselineScores } from "../utils/assessmentMetrics";
import { api } from "../../../shared/lib/api";
import { formatDate, initials } from "../../../shared/lib/utils";
import { Avatar } from "../../../shared/components/ui/avatar";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { useWorkspace } from "../../workspace/WorkspaceContext";
import { WorkspaceState } from "../../workspace/WorkspaceState";
import { StatusBadge } from "../../dashboard/views/DashboardPage";
import type { AthleticTestResult, Goal, Review } from "../../../shared/types";

const labelMap: Record<string, string> = {
  female: "Female", male: "Male", non_binary: "Non-binary", other: "Other", prefer_not_to_say: "Prefer not to say",
  left: "Left", right: "Right", ambidextrous: "Ambidextrous", unknown: "Unknown",
  available: "Available", limited: "Limited", unavailable: "Unavailable",
};

function display(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Not provided" : String(value);
}

function formatLabel(value: string | null | undefined) {
  return value ? labelMap[value] ?? value : "Not provided";
}

export function PlayerDetailPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { selectedTeam } = useWorkspace();
  const query = useQuery({ queryKey: ["player", selectedTeam?.id, playerId], queryFn: () => api.player(selectedTeam!.id, playerId!), enabled: Boolean(selectedTeam && playerId) });
  const skillsQuery = useQuery({ queryKey: ["player-skills", selectedTeam?.id, playerId], queryFn: () => api.playerSkills(selectedTeam!.id, playerId!), enabled: Boolean(selectedTeam && playerId) });
  const goalsQuery = useQuery({ queryKey: ["player-goals", selectedTeam?.id, playerId], queryFn: () => api.playerGoals(selectedTeam!.id, playerId!), enabled: Boolean(selectedTeam && playerId) });
  const reviewsQuery = useQuery({ queryKey: ["player-reviews", selectedTeam?.id, playerId], queryFn: () => api.playerReviews(selectedTeam!.id, playerId!), enabled: Boolean(selectedTeam && playerId) });
  const testsQuery = useQuery({ queryKey: ["player-athletic-tests", selectedTeam?.id, playerId], queryFn: () => api.playerAthleticTests(selectedTeam!.id, playerId!), enabled: Boolean(selectedTeam && playerId) });

  return (
    <WorkspaceState>
      <div className="profile-detail-header">
        <div className="detail-top"><Link className="back-link" to="/players"><span aria-hidden="true">←</span>Back to players</Link></div>
        {query.isLoading ? <div className="content-loading"><div className="loading-orb" /><p>Loading profile…</p></div> : query.error ? <Card className="state-card"><h2>Profile unavailable</h2><p>{(query.error as Error).message}</p><Button variant="outline" onClick={() => navigate("/players")}>Back to roster</Button></Card> : query.data && <section className="profile-heading-row">
          <div className="profile-heading-content">
            <Avatar className="profile-avatar" imageUrl={query.data.photo_url}>{initials(query.data.first_name, query.data.last_name)}</Avatar>
            <div className="profile-heading"><p className="eyebrow">Player profile</p><h1>{query.data.preferred_name || `${query.data.first_name} ${query.data.last_name}`}</h1><div className="profile-meta"><span>{query.data.first_name} {query.data.last_name}</span><span className="meta-dot" /><span>{query.data.primary_role}</span><span className="meta-dot" /><StatusBadge status={query.data.status} /></div></div>
          </div>
          <Link className="page-action-link" to={`/players/${playerId}/edit`}>Edit profile</Link>
        </section>}
      </div>

      {query.data && <>
        <section className="profile-summary-strip" aria-label="Player summary"><SummaryItem label="Role" value={query.data.primary_role} /><SummaryItem label="Availability" value={formatLabel(query.data.availability)} /><SummaryItem label="Latest average" value={skillsQuery.data ? `${averageScore(skillsQuery.data.current)?.toFixed(1) ?? "—"} / 10` : "—"} /><SummaryItem label="Change from start" value={skillsQuery.data ? formatChange(averageChange(skillsQuery.data.current, skillsQuery.data.history)) : "—"} tone={skillsQuery.data && (averageChange(skillsQuery.data.current, skillsQuery.data.history) ?? 0) >= 0 ? "positive" : "negative"} /><SummaryItem label="Objectives" value={goalsQuery.data ? `${goalsQuery.data.filter((goal) => { const score = goal.skill_id ? skillsQuery.data?.current.find((item) => item.skill_id === goal.skill_id)?.score : averageScore(skillsQuery.data?.current ?? []); return score !== null && score !== undefined && score >= goal.target_score; }).length}/${goalsQuery.data.length} reached` : "—"} /></section>

        <div className="profile-overview-grid">
          <Card className="player-info-card">
            <CardHeader><p className="eyebrow">Profile details</p><CardTitle>Player information</CardTitle></CardHeader>
            <CardContent><div className="profile-info-sections">
              <section><p className="info-section-title">Personal</p><div className="info-list"><InfoItem icon={<CalendarBlank size={18} />} label="Date of birth" value={formatDate(query.data.birth_date)} /><InfoItem icon={<UserCircle size={18} />} label="Gender" value={formatLabel(query.data.gender)} /><InfoItem icon={<UserCircle size={18} />} label="Nationality" value={display(query.data.nationality)} /></div></section>
              <section><p className="info-section-title">Contact</p><div className="info-list"><InfoItem icon={<UserCircle size={18} />} label="Email" value={display(query.data.email)} /><InfoItem icon={<UserCircle size={18} />} label="Phone" value={display(query.data.phone)} /></div></section>
              <section><p className="info-section-title">Sport profile</p><div className="info-list"><InfoItem icon={<UserCircle size={18} />} label="Zone defense role" value={display(query.data.secondary_role)} /><InfoItem icon={<UserCircle size={18} />} label="Jersey number" value={display(query.data.jersey_number)} /><InfoItem icon={<UserCircle size={18} />} label="Dominant hand" value={formatLabel(query.data.dominant_hand)} /></div></section>
              <section><p className="info-section-title">Physical profile</p><div className="info-list"><InfoItem icon={<Ruler size={18} />} label="Height" value={query.data.height_cm ? `${query.data.height_cm} cm` : "Not provided"} /><InfoItem icon={<Ruler size={18} />} label="Weight" value={query.data.weight_kg ? `${query.data.weight_kg} kg` : "Not provided"} /></div></section>
            </div></CardContent>
          </Card>

          <Card className="player-radar-card">
            <CardHeader><div className={"flex flex-row justify-between content-start"}><div className="card-heading-row"><div><p className="eyebrow">Skill framework</p><CardTitle>Player radar </CardTitle></div></div><div className="card-header-links"><Link className="open-link" to={`/players/${playerId}/assessments`} aria-label="Open assessments"><ArrowUpRightIcon size={24}/></Link><Link className="open-link" to={`/reviews?playerId=${playerId}`} aria-label="Open reviews"><BookOpen size={20}/></Link></div></div></CardHeader>
            <CardContent>{skillsQuery.isLoading ? <div className="content-loading compact"><div className="loading-orb" /><p>Loading skill snapshot…</p></div> : skillsQuery.error ? <p className="field-error">{(skillsQuery.error as Error).message}</p> : skillsQuery.data ? <><PlayerRadar scores={skillsQuery.data.current} baselineScores={baselineScores(skillsQuery.data.current, skillsQuery.data.history)} /><p className="radar-context">The muted shape is the first recorded snapshot. Focus a point to read the exact score.</p></> : null}</CardContent>
          </Card>

        </div>

        <section className="player-development-grid" aria-label="Player development data">
          <FocusCard goals={goalsQuery.data ?? []} reviews={reviewsQuery.data ?? []} isLoading={goalsQuery.isLoading || reviewsQuery.isLoading}/>
          <GoalsOverviewCard goals={goalsQuery.data ?? []} isLoading={goalsQuery.isLoading}/>
          <ReviewsOverviewCard reviews={reviewsQuery.data ?? []} isLoading={reviewsQuery.isLoading} playerId={playerId!}/>
          <TestsOverviewCard results={testsQuery.data ?? []} isLoading={testsQuery.isLoading} playerId={playerId!}/>
        </section>

        {(query.data.medical_notes?.trim() || query.data.notes?.trim()) && <Card className="player-notes-card">
          <CardHeader><p className="eyebrow">Notes</p><CardTitle>Medical and staff notes</CardTitle></CardHeader>
          <CardContent><div className="notes-stack notes-grid">{query.data.medical_notes?.trim() && <div><small>Medical and injury notes</small><p className="notes-copy">{query.data.medical_notes}</p></div>}{query.data.notes?.trim() && <div><small>Staff notes</small><p className="notes-copy">{query.data.notes}</p></div>}</div></CardContent>
        </Card>}
      </>}
    </WorkspaceState>
  );
}

function FocusCard({goals, reviews, isLoading}: {goals: Goal[]; reviews: Review[]; isLoading: boolean}) {
  const focus = reviews[0]?.next_steps || reviews[0]?.development_path || goals[0]?.title;
  return <Card className="player-focus-card"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">Current focus</p><CardTitle>Development focus</CardTitle></div><Flag size={22} className="assessment-card-icon"/></div></CardHeader><CardContent>{isLoading ? <div className="content-loading compact"><div className="loading-orb"/><p>Loading focus…</p></div> : <p className="focus-copy">{focus || "No active focus recorded yet."}</p>}</CardContent></Card>;
}

function GoalsOverviewCard({goals, isLoading}: {goals: Goal[]; isLoading: boolean}) {
  return <Card className="player-development-card"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">Active objectives</p><CardTitle>Goals</CardTitle></div><Link className="open-link" to="/assessments" aria-label="Open team assessments"><ArrowUpRightIcon size={21}/></Link></div></CardHeader><CardContent>{isLoading ? <div className="content-loading compact"><div className="loading-orb"/><p>Loading goals…</p></div> : goals.length ? <div className="player-goal-list">{goals.map((goal) => <div className="player-goal-row" key={goal.id}><div><strong>{goal.title}</strong><span>{goal.skill_name || "Overall development"}{goal.due_date ? ` · Due ${formatDate(goal.due_date)}` : ""}</span></div><b>{goal.target_score.toFixed(1)}<small>/10</small></b></div>)}</div> : <div className="empty-inline"><p>No active goals.</p></div>}</CardContent></Card>;
}

function ReviewsOverviewCard({reviews, isLoading, playerId}: {reviews: Review[]; isLoading: boolean; playerId: string}) {
  return <Card className="player-development-card"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">Coaching history</p><CardTitle>Reviews</CardTitle></div><Link className="open-link" to={`/reviews?playerId=${playerId}`} aria-label="Open player reviews"><BookOpen size={20}/></Link></div></CardHeader><CardContent>{isLoading ? <div className="content-loading compact"><div className="loading-orb"/><p>Loading reviews…</p></div> : reviews.length ? <div className="player-review-list">{reviews.slice(0, 3).map((review) => <div className="player-review-row" key={review.id}><div><strong>{formatDate(review.review_date)}</strong><span>{review.status} · {review.visibility === "player" ? "Player visible" : "Staff only"}</span></div>{review.next_steps || review.strengths ? <p>{review.next_steps || review.strengths}</p> : null}</div>)}</div> : <div className="empty-inline"><p>No reviews recorded.</p></div>}</CardContent></Card>;
}

function TestsOverviewCard({results, isLoading, playerId}: {results: AthleticTestResult[]; isLoading: boolean; playerId: string}) {
  return <Card className="player-development-card"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">Performance history</p><CardTitle>Athletic tests</CardTitle></div><Link className="open-link" to={`/athletic-tests?playerId=${playerId}`} aria-label="Open player athletic tests"><ChartLineUp size={21}/></Link></div></CardHeader><CardContent>{isLoading ? <div className="content-loading compact"><div className="loading-orb"/><p>Loading tests…</p></div> : results.length ? <div className="player-test-list">{results.slice(0, 5).map((result) => <div className="player-test-row" key={result.id}><div><strong>{result.test_name}</strong><span>{formatDate(result.recorded_at)}</span></div><b>{result.value}<small>{result.unit}</small></b></div>)}</div> : <div className="empty-inline"><p>No athletic tests recorded.</p></div>}</CardContent></Card>;
}

function SummaryItem({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div className="summary-item"><span>{label}</span><strong className={tone ? `summary-${tone}` : ""}>{value}</strong></div>;
}

function formatChange(change: number | null) {
  if (change === null) return "—";
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)} pts`;
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="info-item"><span className="info-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>;
}
