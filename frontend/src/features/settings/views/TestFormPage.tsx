import {ArrowLeft} from "@phosphor-icons/react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useNavigate, useParams} from "react-router-dom";
import {TestForm} from "../components/TestForm";
import {api} from "../../../shared/lib/api";
import {PageHeader} from "../../../shared/components/layout/AppShell";
import {Card} from "../../../shared/components/ui/card";
import {useWorkspace} from "../../workspace/WorkspaceContext";
import {WorkspaceState} from "../../workspace/WorkspaceState";

export function TestFormPage() {
    const {testId} = useParams();
    const navigate = useNavigate();
    const {selectedTeam} = useWorkspace();
    const queryClient = useQueryClient();
    const editing = Boolean(testId);
    const query = useQuery({queryKey: ["athletic-tests", selectedTeam?.id], queryFn: () => api.athleticTests(selectedTeam!.id), enabled: Boolean(selectedTeam)});
    const test = query.data?.find((item) => item.id === testId);
    const mutation = useMutation({mutationFn: (input: Parameters<typeof api.createAthleticTest>[1]) => editing ? api.updateAthleticTest(selectedTeam!.id, testId!, input) : api.createAthleticTest(selectedTeam!.id, input), onSuccess: () => { queryClient.invalidateQueries({queryKey: ["athletic-tests", selectedTeam?.id]}); navigate("/settings"); }});
    return <WorkspaceState><div className="detail-top"><Link className="back-link" to="/settings"><ArrowLeft size={16}/>Back to settings</Link></div>{editing && query.isLoading ? <div className="content-loading"><div className="loading-orb"/><p>Loading test…</p></div> : editing && (!test || query.error) ? <Card className="state-card"><h2>Test unavailable</h2><p>{(query.error as Error)?.message ?? "The test could not be found."}</p><Link className="page-action-link" to="/settings">Back to settings</Link></Card> : <><PageHeader eyebrow={editing ? "Settings / edit test" : "Settings / new test"} title={editing ? "Edit test" : "Add test"} description="Configure the catalog used to record player development data."/><TestForm test={test} onCancel={() => navigate("/settings")} onSubmit={async (input) => { await mutation.mutateAsync(input); }}/>{mutation.error && <p className="field-error form-submit-error">{(mutation.error as Error).message}</p>}</>}</WorkspaceState>;
}
