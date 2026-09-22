import {useState} from "react";
import {ArrowLeft, ChartLineUp, ChartLineUpIcon, Plus, Target} from "@phosphor-icons/react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useParams} from "react-router-dom";
import {AssessmentForm} from "../components/AssessmentForm";
import {AssessmentTrendChart} from "../components/AssessmentTrendChart";
import {GoalForm} from "../components/GoalForm";
import {PlayerRadar} from "../components/PlayerRadar";
import {api} from "../../../shared/lib/api";
import {averageScore, baselineScores} from "../utils/assessmentMetrics";
import {formatDate} from "../../../shared/lib/utils";
import {Button} from "../../../shared/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../../../shared/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../../shared/components/ui/dialog";
import {PageHeader} from "../../../shared/components/layout/AppShell";
import {useWorkspace} from "../../workspace/WorkspaceContext";
import {WorkspaceState} from "../../workspace/WorkspaceState";
import type {Goal, Skill, SkillScore} from "../../../shared/types";

export function PlayerAssessmentsPage() {
    const {playerId} = useParams();
    const {selectedTeam} = useWorkspace();
    const queryClient = useQueryClient();
    const [snapshotOpen, setSnapshotOpen] = useState(false);
    const [goalOpen, setGoalOpen] = useState(false);
    const playerQuery = useQuery({
        queryKey: ["player", selectedTeam?.id, playerId],
        queryFn: () => api.player(selectedTeam!.id, playerId!),
        enabled: Boolean(selectedTeam && playerId)
    });
    const skillsQuery = useQuery({
        queryKey: ["player-skills", selectedTeam?.id, playerId],
        queryFn: () => api.playerSkills(selectedTeam!.id, playerId!),
        enabled: Boolean(selectedTeam && playerId)
    });
    const goalsQuery = useQuery({
        queryKey: ["player-goals", selectedTeam?.id, playerId],
        queryFn: () => api.playerGoals(selectedTeam!.id, playerId!),
        enabled: Boolean(selectedTeam && playerId)
    });
    const assessmentMutation = useMutation({
        mutationFn: (input: Parameters<typeof api.createAssessment>[2]) => api.createAssessment(selectedTeam!.id, playerId!, input),
        onSuccess: (skills) => {
            queryClient.setQueryData(["player-skills", selectedTeam?.id, playerId], skills);
            setSnapshotOpen(false);
        }
    });
    const goalMutation = useMutation({
        mutationFn: (input: Parameters<typeof api.createGoal>[2]) => api.createGoal(selectedTeam!.id, playerId!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["player-goals", selectedTeam?.id, playerId]});
            queryClient.invalidateQueries({queryKey: ["team-assessments", selectedTeam?.id]});
            setGoalOpen(false);
        }
    });

    return <WorkspaceState>
        <div className="detail-top"><Link className="back-link" to={`/players/${playerId}`}><ArrowLeft size={16}/>Back
            to player</Link></div>
        {playerQuery.isLoading || skillsQuery.isLoading || goalsQuery.isLoading ? <div className="content-loading">
            <div className="loading-orb"/>
            <p>Loading assessment review…</p></div> : playerQuery.error || skillsQuery.error || goalsQuery.error ?
            <Card className="state-card"><h2>Assessment review unavailable</h2>
                <p>{((playerQuery.error || skillsQuery.error || goalsQuery.error) as Error).message}</p><Link
                    className="page-action-link" to={`/players/${playerId}`}>Back to
                    player</Link></Card> : playerQuery.data && skillsQuery.data && goalsQuery.data && <><PageHeader
            eyebrow="Player / development"
            title={`${playerQuery.data.preferred_name || playerQuery.data.first_name} · assessments`}
            description="Read change over time, compare the first and latest snapshot, and track objectives."
            actions={<div className="page-actions"><Link className="page-action-link page-action-link-small" to={`/reviews?playerId=${playerId}`}>Reviews</Link><Link className="page-action-link page-action-link-small" to={`/athletic-tests?playerId=${playerId}`}>Athletic tests</Link><Dialog open={snapshotOpen} onOpenChange={setSnapshotOpen}><DialogTrigger asChild><Button
                variant="accent"><Plus size={17}/>Add
                snapshot</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add
                snapshot</DialogTitle><DialogDescription>Record a dated assessment or review. Existing scores remain in
                the timeline.</DialogDescription></DialogHeader><AssessmentForm skills={skillsQuery.data.skills}
                                                                                onSubmit={async (input) => {
                                                                                    await assessmentMutation.mutateAsync(input);
                                                                                }}/>{assessmentMutation.error &&
                <p className="field-error">{(assessmentMutation.error as Error).message}</p>}
            </DialogContent></Dialog></div>}/>
            <div className="assessment-workspace-grid"><Card className="assessment-visual-card"><CardHeader>
                <div className="card-heading-row">
                    <div><p className="eyebrow">Shape of play</p><CardTitle>Starting point vs current</CardTitle></div>
                    <ChartLineUpIcon size={24} className="assessment-card-icon"/></div>
            </CardHeader><CardContent><PlayerRadar scores={skillsQuery.data.current}
                                                   baselineScores={baselineScores(skillsQuery.data.current, skillsQuery.data.history)}/>
                <div className="skill-score-list">{skillsQuery.data.current.map((skill) => <SkillDeltaRow
                    key={skill.skill_id} skill={skill}
                    baseline={baselineScores([skill], skillsQuery.data.history)[0]?.score ?? null}/>)}</div>
            </CardContent></Card>
                <div className="assessment-side-column"><Card className="trend-card"><CardHeader><p
                    className="eyebrow">Timeline</p><CardTitle>Average score over
                    time</CardTitle></CardHeader><CardContent><AssessmentTrendChart history={skillsQuery.data.history}/></CardContent></Card><GoalsCard
                    goals={goalsQuery.data} current={skillsQuery.data.current} skills={skillsQuery.data.skills}
                    open={goalOpen} onOpenChange={setGoalOpen} onSubmit={async (input) => {
                    await goalMutation.mutateAsync(input);
                }} error={goalMutation.error as Error | null}/></div>
            </div>
        </>}</WorkspaceState>;
}

function SkillDeltaRow({skill, baseline}: { skill: SkillScore; baseline: number | null }) {
    const change = skill.score !== null && baseline !== null ? skill.score - baseline : null;
    return <div className="skill-score-row">
        <div><strong>{skill.skill_name}</strong><span
            className={`skill-category ${skill.category}`}>{skill.category}</span></div>
        <div className="skill-score-values"><b>{skill.score?.toFixed(1) ?? "—"}<small>/10</small></b><span
            className={change === null ? "" : change >= 0 ? "delta-positive" : "delta-negative"}>{change === null ? "No baseline" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}`}</span>
        </div>
    </div>;
}

function GoalsCard({goals, current, skills, open, onOpenChange, onSubmit, error}: {
    goals: Goal[];
    current: SkillScore[];
    skills: Skill[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (input: {
        title: string;
        skill_id: string | null;
        target_score: number;
        due_date: string | null
    }) => Promise<void>;
    error: Error | null
}) {
    return <Card className="goals-card"><CardHeader>
        <div className="card-heading-row">
            <div><p className="eyebrow">Development</p><CardTitle>Objectives</CardTitle></div>
            <Dialog open={open} onOpenChange={onOpenChange}><DialogTrigger asChild><Button variant="outline"
                                                                                           size="sm"><Plus size={15}/>Add
                goal</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add
                objective</DialogTitle><DialogDescription>Set a target that will be checked against the latest
                snapshot.</DialogDescription></DialogHeader><GoalForm skills={skills} onSubmit={onSubmit}/>{error &&
                <p className="field-error">{error.message}</p>}</DialogContent></Dialog></div>
    </CardHeader><CardContent>{goals.length ?
        <div className="goal-list">{goals.map((goal) => <GoalRow key={goal.id} goal={goal} current={current}/>)}</div> :
        <div className="empty-inline goal-empty"><Target size={22}/><p>No objectives set for this player.</p>
        </div>}</CardContent></Card>;
}

function GoalRow({goal, current}: { goal: Goal; current: SkillScore[] }) {
    const score = goal.skill_id ? current.find((item) => item.skill_id === goal.skill_id)?.score ?? null : averageScore(current);
    const achieved = score !== null && score >= goal.target_score;
    const progress = score === null ? 0 : Math.min((score / goal.target_score) * 100, 100);
    return <div className="goal-row">
        <div className="goal-row-heading">
            <div>
                <strong>{goal.title}</strong><span>{goal.skill_name || "Overall average"}{goal.due_date ? ` · Due ${formatDate(goal.due_date)}` : ""}</span>
            </div>
            <b className={achieved ? "goal-reached" : ""}>{score?.toFixed(1) ?? "—"}<small> / {goal.target_score.toFixed(1)}</small></b>
        </div>
        <div className="goal-progress"><span style={{width: `${progress}%`}}/></div>
        <div className="goal-status">
            <span>{achieved ? "Reached" : score === null ? "Waiting for a snapshot" : "In progress"}</span>{score !== null &&
            <span>{Math.round(progress)}%</span>}</div>
    </div>;
}
