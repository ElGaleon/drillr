import {Archive, PencilSimple, Plus} from "@phosphor-icons/react";
import {Link} from "react-router-dom";
import {Button} from "../../../shared/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../../../shared/components/ui/card";
import type {AthleticTest, AthleticTestType} from "../../../shared/types";

export function TestCatalogCard({tests, onArchive, isArchiving}: {tests: AthleticTest[]; onArchive: (test: AthleticTest) => void; isArchiving: boolean}) {
    return <Card className="settings-wide"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">Test catalog</p><CardTitle>Athletic and technical tests</CardTitle></div><Link className="page-action-link page-action-link-small" to="/settings/tests/new"><Plus size={17}/>Add test</Link></div></CardHeader><CardContent><p className="card-copy">Coaches can configure the tests used in player development. Archived tests remain available in historical records.</p><div className="test-catalog-grid"><CatalogGroup type="athletic" tests={tests} onArchive={onArchive} isArchiving={isArchiving}/><CatalogGroup type="technical" tests={tests} onArchive={onArchive} isArchiving={isArchiving}/></div></CardContent></Card>;
}

function CatalogGroup({type, tests, onArchive, isArchiving}: {type: AthleticTestType; tests: AthleticTest[]; onArchive: (test: AthleticTest) => void; isArchiving: boolean}) {
    const items = tests.filter((test) => test.test_type === type);
    return <section className="test-catalog-group"><p className="info-section-title">{type === "athletic" ? "Athletic" : "Technical / non-athletic"}</p>{items.length ? <div className="skill-settings-list">{items.map((test) => <div className={`skill-setting-row${test.is_active ? "" : " archived"}`} key={test.id}><div><strong>{test.name}</strong><span>{test.category} · {test.unit} · {test.direction.replaceAll("_", " ")}</span></div><div className="skill-setting-actions">{!test.is_active && <span className="preference-pill">Archived</span>}<Link aria-label={`Edit ${test.name}`} className="icon-link" to={`/settings/tests/${test.id}/edit`}><PencilSimple size={17}/></Link>{test.is_active && <Button aria-label={`Archive ${test.name}`} variant="ghost" size="icon" disabled={isArchiving} onClick={() => onArchive(test)}><Archive size={17}/></Button>}</div></div>)}</div> : <p className="card-copy">No tests configured.</p>}</section>;
}
