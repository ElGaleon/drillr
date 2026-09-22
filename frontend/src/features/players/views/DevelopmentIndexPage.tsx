import {useState} from "react";
import {BookOpen, ChartLineUp, Plus} from "@phosphor-icons/react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useSearchParams} from "react-router-dom";
import {AthleticTestForm} from "../components/AthleticTestForm";
import {ReviewForm} from "../components/ReviewForm";
import {api} from "../../../shared/lib/api";
import {formatDate} from "../../../shared/lib/utils";
import {Button} from "../../../shared/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../../../shared/components/ui/card";
import {Label} from "../../../shared/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../shared/components/ui/select";
import {FilterBar, FilterBarSelect} from "../../../shared/components/layout/FilterBar";
import {PageHeader} from "../../../shared/components/layout/AppShell";
import {useWorkspace} from "../../workspace/WorkspaceContext";
import {WorkspaceState} from "../../workspace/WorkspaceState";
import type {AthleticTestResultOverview, ReviewOverview} from "../../../shared/types";

type DevelopmentMode = "reviews" | "athletic-tests";

export function DevelopmentIndexPage({mode}: {mode: DevelopmentMode}) {
    const {selectedTeam} = useWorkspace();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [playerFilter, setPlayerFilter] = useState(searchParams.get("playerId") || "all");
    const [reviewStatus, setReviewStatus] = useState("all");
    const [reviewVisibility, setReviewVisibility] = useState("all");
    const [testFilter, setTestFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [formOpen, setFormOpen] = useState(false);
    const [formPlayerId, setFormPlayerId] = useState(searchParams.get("playerId") || "");
    const playersQuery = useQuery({queryKey: ["players", selectedTeam?.id, "all"], queryFn: () => api.players(selectedTeam!.id), enabled: Boolean(selectedTeam)});
    const definitionsQuery = useQuery({queryKey: ["athletic-tests", selectedTeam?.id], queryFn: () => api.athleticTests(selectedTeam!.id), enabled: Boolean(selectedTeam && mode === "athletic-tests")});
    const reviewsQuery = useQuery({queryKey: ["reviews-overview", selectedTeam?.id, playerFilter, reviewStatus, reviewVisibility], queryFn: () => api.reviews(selectedTeam!.id, {playerId: playerFilter === "all" ? undefined : playerFilter, status: reviewStatus === "all" ? undefined : reviewStatus, visibility: reviewVisibility === "all" ? undefined : reviewVisibility}), enabled: Boolean(selectedTeam && mode === "reviews")});
    const testsQuery = useQuery({queryKey: ["athletic-tests-overview", selectedTeam?.id, playerFilter, testFilter, categoryFilter], queryFn: () => api.athleticTestResults(selectedTeam!.id, {playerId: playerFilter === "all" ? undefined : playerFilter, testId: testFilter === "all" ? undefined : testFilter, category: categoryFilter === "all" ? undefined : categoryFilter}), enabled: Boolean(selectedTeam && mode === "athletic-tests")});
    const reviewMutation = useMutation({mutationFn: (input: Parameters<typeof api.createReview>[2]) => api.createReview(selectedTeam!.id, formPlayerId, input), onSuccess: () => { queryClient.invalidateQueries({queryKey: ["reviews-overview", selectedTeam?.id]}); setFormOpen(false); }});
    const testMutation = useMutation({mutationFn: (input: Parameters<typeof api.createAthleticTestResult>[2]) => api.createAthleticTestResult(selectedTeam!.id, formPlayerId, input), onSuccess: () => { queryClient.invalidateQueries({queryKey: ["athletic-tests-overview", selectedTeam?.id]}); setFormOpen(false); }});
    const players = playersQuery.data || [];
    const definitions = definitionsQuery.data || [];
    const categories = [...new Set(definitions.map((test) => test.category))];
    const reviews = reviewsQuery.data || [];
    const results = testsQuery.data || [];
    const isLoading = playersQuery.isLoading || (mode === "reviews" ? reviewsQuery.isLoading : testsQuery.isLoading || definitionsQuery.isLoading);
    const error = playersQuery.error || reviewsQuery.error || testsQuery.error || definitionsQuery.error;

    return <WorkspaceState>
        <PageHeader eyebrow="Player / development" title={mode === "reviews" ? "Reviews" : "Athletic tests"} description={mode === "reviews" ? "Overview of the coaching history across the whole team." : "Overview of athletic performance across the whole team."} actions={<Button variant="accent" disabled={!players.length} onClick={() => { setFormPlayerId(playerFilter === "all" ? players[0]?.id || "" : playerFilter); setFormOpen((open) => !open); }}><Plus size={17}/>{formOpen ? "Close form" : mode === "reviews" ? "Add review" : "Add result"}</Button>}/>
        {isLoading ? <div className="content-loading"><div className="loading-orb"/><p>Loading overview…</p></div> : error ? <Card className="state-card"><h2>Overview unavailable</h2><p>{(error as Error).message}</p></Card> : !players.length ? <Card className="state-card"><h2>No players yet</h2><p>Add a player before recording development data.</p><Link className="page-action-link" to="/players/new">Add player</Link></Card> : <>
            <OverviewStats mode={mode} reviews={reviews} results={results}/>
            <Card className="development-filter-card"><CardContent><FilterBar resultCount={mode === "reviews" ? reviews.length : results.length}>
                <FilterBarSelect><Select value={playerFilter} onValueChange={setPlayerFilter}><SelectTrigger className="filter-select w-auto" aria-label="Filter by player"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All players</SelectItem>{players.map((player) => <SelectItem key={player.id} value={player.id}>{player.preferred_name || `${player.first_name} ${player.last_name}`}</SelectItem>)}</SelectContent></Select></FilterBarSelect>
                {mode === "reviews" ? <><FilterBarSelect><Select value={reviewStatus} onValueChange={setReviewStatus}><SelectTrigger className="filter-select w-auto" aria-label="Filter by review status"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></FilterBarSelect><FilterBarSelect><Select value={reviewVisibility} onValueChange={setReviewVisibility}><SelectTrigger className="filter-select w-auto" aria-label="Filter by review visibility"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All visibility</SelectItem><SelectItem value="staff">Staff only</SelectItem><SelectItem value="player">Player visible</SelectItem></SelectContent></Select></FilterBarSelect></> : <><FilterBarSelect><Select value={testFilter} onValueChange={setTestFilter}><SelectTrigger className="filter-select w-auto" aria-label="Filter by test"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All tests</SelectItem>{definitions.map((test) => <SelectItem key={test.id} value={test.id}>{test.name}</SelectItem>)}</SelectContent></Select></FilterBarSelect><FilterBarSelect><Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="filter-select w-auto" aria-label="Filter by category"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></FilterBarSelect></>}
            </FilterBar></CardContent></Card>
            {formOpen && <EntryForm mode={mode} players={players} playerId={formPlayerId} onPlayerChange={setFormPlayerId} onReview={async (input) => { await reviewMutation.mutateAsync(input); }} onTest={async (input) => { await testMutation.mutateAsync(input); }} tests={definitions} error={(reviewMutation.error || testMutation.error) as Error | null}/>}<Card className="development-history-card"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">Team overview</p><CardTitle>{mode === "reviews" ? "Review history" : "Recorded results"}</CardTitle></div>{mode === "reviews" ? <BookOpen size={23} className="assessment-card-icon"/> : <ChartLineUp size={23} className="assessment-card-icon"/>}</div></CardHeader><CardContent>{mode === "reviews" ? <ReviewHistory reviews={reviews}/> : <TestHistory results={results}/>}</CardContent></Card>
        </>}
    </WorkspaceState>;
}

function OverviewStats({mode, reviews, results}: {mode: DevelopmentMode; reviews: ReviewOverview[]; results: AthleticTestResultOverview[]}) {
    const items = mode === "reviews" ? [{label: "Reviews", value: reviews.length}, {label: "Players covered", value: new Set(reviews.map((review) => review.player_id)).size}, {label: "Published", value: reviews.filter((review) => review.status === "published").length}] : [{label: "Results", value: results.length}, {label: "Players covered", value: new Set(results.map((result) => result.player_id)).size}, {label: "Tests used", value: new Set(results.map((result) => result.test_id)).size}];
    return <div className="development-stats-grid">{items.map((item) => <Card className="assessment-summary-card" key={item.label}><CardContent><span>{item.label}</span><strong>{item.value}</strong></CardContent></Card>)}</div>;
}

function EntryForm({mode, players, playerId, onPlayerChange, onReview, onTest, tests, error}: {mode: DevelopmentMode; players: Array<{id: string; first_name: string; last_name: string; preferred_name: string | null}>; playerId: string; onPlayerChange: (value: string) => void; onReview: Parameters<typeof ReviewForm>[0]["onSubmit"]; onTest: Parameters<typeof AthleticTestForm>[0]["onSubmit"]; tests: Awaited<ReturnType<typeof api.athleticTests>>; error: Error | null}) {
    return <Card className="development-form-card"><CardHeader><CardTitle>{mode === "reviews" ? "New review" : "New result"}</CardTitle></CardHeader><CardContent><div className="form-stack"><div><Label htmlFor="entry-player">Player</Label><Select value={playerId} onValueChange={onPlayerChange}><SelectTrigger id="entry-player" className="field-select-box"><SelectValue placeholder="Select a player"/></SelectTrigger><SelectContent>{players.map((player) => <SelectItem key={player.id} value={player.id}>{player.preferred_name || `${player.first_name} ${player.last_name}`}</SelectItem>)}</SelectContent></Select></div>{mode === "reviews" ? <ReviewForm onSubmit={onReview}/> : <AthleticTestForm tests={tests} onSubmit={onTest}/>} {error && <p className="field-error">{error.message}</p>}</div></CardContent></Card>;
}

function ReviewHistory({reviews}: {reviews: ReviewOverview[]}) {
    return reviews.length ? <div className="review-list">{reviews.map((review) => <article className="review-row" key={review.id}><div className="review-row-heading"><div><strong>{review.player_name}</strong><span>{review.player_role} · {formatDate(review.review_date)} · {review.visibility === "player" ? "Player visible" : "Staff only"}</span></div><span className={`review-status ${review.status}`}>{review.status}</span></div>{review.strengths && <ReviewField label="Strengths" value={review.strengths}/>} {review.next_steps && <ReviewField label="Next steps" value={review.next_steps}/>} {review.development_path && <ReviewField label="Development path" value={review.development_path}/>} {review.coach_notes && <ReviewField label="Coach notes" value={review.coach_notes}/>}</article>)}</div> : <div className="empty-inline"><p>No reviews match the selected filters.</p></div>;
}

function ReviewField({label, value}: {label: string; value: string}) {
    return <div className="review-field"><span>{label}</span><p>{value}</p></div>;
}

function TestHistory({results}: {results: AthleticTestResultOverview[]}) {
    return results.length ? <div className="athletic-result-list">{results.map((result) => <div className="athletic-result-row" key={result.id}><div><strong>{result.player_name}</strong><span>{result.player_role} · {result.test_name} · {formatDate(result.recorded_at)}</span></div><b>{result.value} <small>{result.unit}</small></b>{result.note && <p>{result.note}</p>}</div>)}</div> : <div className="empty-inline"><p>No results match the selected filters.</p></div>;
}
