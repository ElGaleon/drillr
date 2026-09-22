# Skill Framework and Assessments

## Scope

Each team starts with six configurable player evaluation parameters:

| Category | Parameter |
| --- | --- |
| Attack | Disc skills |
| Attack | Movement & spacing |
| Attack | Decision making |
| Defense | Man marking |
| Defense | Zone marking |
| Defense | Game reading |

The default framework is a starting point, not a fixed product contract. A coach can add, edit, reorder, or archive parameters from Settings. Archived parameters remain readable in historical records and are not shown as active radar axes.

## Data model

- skill_definitions stores the team-scoped framework, category, description, order, and active/archive state.
- player_skill_assessments is append-only. Each row stores one player/skill score, source (assessment or review), optional note, and UTC timestamp.
- A current player score is the latest assessment row for that skill.
- History is never overwritten. A new assessment or review adds rows and changes only the current projection.

All skill and assessment queries are scoped by both the authenticated Clerk subject (owner_user_id) and the selected team_id. Player, skill, and team ownership are verified server-side.

## API behavior

- GET /api/v1/skills returns the team framework.
- POST /api/v1/skills creates a coach-defined parameter.
- PATCH /api/v1/skills/{skill_id} edits a parameter.
- DELETE /api/v1/skills/{skill_id} archives it without deleting history.
- GET /api/v1/players/{player_id}/skills returns active/current scores and complete history.
- POST /api/v1/players/{player_id}/assessments appends an assessment or review snapshot.

Scores use a 1..10 range at the API boundary and must use 0.5 increments. Pydantic validates categories, sources, lengths, and score bounds before domain logic runs.

## UI behavior

The player page shows the current snapshot as a six-axis radar chart with Attack and Defense legends. Hovering or focusing a point exposes the exact score. The dedicated snapshots page contains the score list, assessment form, and chronological review timeline. Settings exposes the coach configuration workflow. Forms use React Hook Form and Zod with field-level validation.

The radar is an SVG data visualization, not a decorative image: labels remain text-based, the chart has an accessible name, and the score list provides a readable alternative.
