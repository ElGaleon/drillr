import type { AssessmentHistory, SkillScore } from "../../../shared/types";

export function baselineScores(current: SkillScore[], history: AssessmentHistory[]): SkillScore[] {
  const firstBySkill = new Map<string, AssessmentHistory>();
  [...history].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at)).forEach((item) => {
    if (!firstBySkill.has(item.skill_id)) firstBySkill.set(item.skill_id, item);
  });
  return current.map((score) => ({ ...score, score: firstBySkill.get(score.skill_id)?.score ?? score.score }));
}

export function averageScore(scores: SkillScore[]) {
  const values = scores.flatMap((score) => score.score === null ? [] : [score.score]);
  return values.length ? values.reduce((total, score) => total + score, 0) / values.length : null;
}

export function averageChange(current: SkillScore[], history: AssessmentHistory[]) {
  const baseline = averageScore(baselineScores(current, history));
  const latest = averageScore(current);
  return baseline === null || latest === null ? null : latest - baseline;
}

