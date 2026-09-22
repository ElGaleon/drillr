def get_team(client, user_id="test_user"):
    response = client.get("/api/v1/teams", headers={"x-dev-user-id": user_id})
    assert response.status_code == 200
    return response.json()[0]


def test_player_crud_and_team_isolation(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    created = client.post("/api/v1/players", params={"team_id": team["id"]}, headers=headers, json={"first_name": "Test", "last_name": "Player", "preferred_name": "Tee", "nationality": "Italian", "email": "tee@example.test", "phone": "+39 000 000 0000", "gender": "prefer_not_to_say", "dominant_hand": "right", "primary_role": "Forward", "secondary_role": "Handler", "jersey_number": 7, "height_cm": 182, "weight_kg": 78.5, "status": "active", "availability": "available", "medical_notes": "No restrictions"})
    assert created.status_code == 201
    assert created.json()["preferred_name"] == "Tee"
    assert created.json()["dominant_hand"] == "right"
    assert created.json()["height_cm"] == 182
    assert created.json()["weight_kg"] == 78.5
    assert created.json()["availability"] == "available"
    assert created.json()["email"] == "tee@example.test"
    player_id = created.json()["id"]

    assert client.get(f"/api/v1/players/{player_id}", params={"team_id": team["id"]}, headers=headers).status_code == 200
    foreign = client.get("/api/v1/players", params={"team_id": team["id"]}, headers={"x-dev-user-id": "foreign_user"})
    assert foreign.status_code == 404


def test_skill_framework_and_append_only_history(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    player = client.get("/api/v1/players", params={"team_id": team["id"]}, headers=headers).json()[0]
    skills = client.get("/api/v1/skills", params={"team_id": team["id"]}, headers=headers)
    assert skills.status_code == 200
    assert [skill["name"] for skill in skills.json()][:3] == ["Disc skills", "Movement & spacing", "Decision making"]

    ratings = [{"skill_id": skill["id"], "score": index % 5 + 1} for index, skill in enumerate(skills.json())]
    assessment = client.post(f"/api/v1/players/{player['id']}/assessments", params={"team_id": team["id"]}, headers=headers, json={"source": "assessment", "ratings": ratings})
    assert assessment.status_code == 201
    assert len(assessment.json()["history"]) == 6

    updated = client.post(f"/api/v1/players/{player['id']}/assessments", params={"team_id": team["id"]}, headers=headers, json={"source": "review", "ratings": [{"skill_id": skills.json()[0]["id"], "score": 5}]})
    assert updated.status_code == 201
    assert len(updated.json()["history"]) == 7
    current_disc = next(item for item in updated.json()["current"] if item["skill_id"] == skills.json()[0]["id"])
    assert current_disc["score"] == 5

    invalid_score = client.post(f"/api/v1/players/{player['id']}/assessments", params={"team_id": team["id"]}, headers=headers, json={"source": "review", "ratings": [{"skill_id": skills.json()[0]["id"], "score": 5.25}]})
    assert invalid_score.status_code == 422


def test_custom_skill_can_be_updated_and_archived_without_losing_history(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    player = client.get("/api/v1/players", params={"team_id": team["id"]}, headers=headers).json()[0]
    created = client.post("/api/v1/skills", params={"team_id": team["id"]}, headers=headers, json={"name": "Transition play", "category": "attack", "sort_order": 20})
    assert created.status_code == 201
    skill = created.json()
    renamed = client.patch(f"/api/v1/skills/{skill['id']}", params={"team_id": team["id"]}, headers=headers, json={"name": "Transition execution"})
    assert renamed.status_code == 200
    client.post(f"/api/v1/players/{player['id']}/assessments", params={"team_id": team["id"]}, headers=headers, json={"source": "review", "ratings": [{"skill_id": skill["id"], "score": 4}]})
    archived = client.delete(f"/api/v1/skills/{skill['id']}", params={"team_id": team["id"]}, headers=headers)
    assert archived.status_code == 200
    assert archived.json()["is_active"] is False
    history = client.get(f"/api/v1/players/{player['id']}/skills", params={"team_id": team["id"]}, headers=headers).json()["history"]
    assert any(item["skill_id"] == skill["id"] for item in history)


def test_role_framework_is_configurable_and_team_scoped(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    roles = client.get("/api/v1/roles", params={"team_id": team["id"]}, headers=headers)
    assert roles.status_code == 200
    assert [role["name"] for role in roles.json() if role["role_type"] == "primary"][:3] == ["Handler", "Middle", "Deep"]
    assert [role["name"] for role in roles.json() if role["role_type"] == "zone_defense"][:5] == ["Nocciolina", "Cacciavite", "Trapano", "Seconda", "Ultimo"]

    created = client.post("/api/v1/roles", params={"team_id": team["id"]}, headers=headers, json={"name": "Wing", "role_type": "primary", "sort_order": 10})
    assert created.status_code == 201
    role = created.json()
    renamed = client.patch(f"/api/v1/roles/{role['id']}", params={"team_id": team["id"]}, headers=headers, json={"name": "Wing handler"})
    assert renamed.status_code == 200
    archived = client.delete(f"/api/v1/roles/{role['id']}", params={"team_id": team["id"]}, headers=headers)
    assert archived.status_code == 200
    assert archived.json()["is_active"] is False

    foreign = client.get("/api/v1/roles", params={"team_id": team["id"]}, headers={"x-dev-user-id": "foreign_user"})
    assert foreign.status_code == 404


def test_protected_api_requires_authentication(client, monkeypatch):
    monkeypatch.setenv("DEV_AUTH_BYPASS", "false")
    response = client.get("/api/v1/teams")
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"
    monkeypatch.setenv("DEV_AUTH_BYPASS", "true")


def test_player_goals_are_scoped_and_return_skill_context(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    player = client.get("/api/v1/players", params={"team_id": team["id"]}, headers=headers).json()[0]
    skill = client.get("/api/v1/skills", params={"team_id": team["id"]}, headers=headers).json()[0]
    created = client.post(f"/api/v1/players/{player['id']}/goals", params={"team_id": team["id"]}, headers=headers, json={"title": "Improve first touch", "skill_id": skill["id"], "target_score": 7.5})
    assert created.status_code == 201
    assert created.json()["skill_name"] == skill["name"]
    goals = client.get(f"/api/v1/players/{player['id']}/goals", params={"team_id": team["id"]}, headers=headers)
    assert goals.status_code == 200
    assert goals.json()[0]["target_score"] == 7.5


def test_athletic_tests_keep_dated_results_and_are_scoped(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    player = client.get("/api/v1/players", params={"team_id": team["id"]}, headers=headers).json()[0]
    definitions = client.get("/api/v1/athletic-tests", params={"team_id": team["id"]}, headers=headers)
    assert definitions.status_code == 200
    assert definitions.json()[0]["name"] == "10m sprint"
    test_id = definitions.json()[0]["id"]

    first = client.post(f"/api/v1/players/{player['id']}/athletic-tests", params={"team_id": team["id"]}, headers=headers, json={"test_id": test_id, "value": 2.1, "recorded_at": "2026-01-10T12:00:00Z"})
    second = client.post(f"/api/v1/players/{player['id']}/athletic-tests", params={"team_id": team["id"]}, headers=headers, json={"test_id": test_id, "value": 1.9, "recorded_at": "2026-02-10T12:00:00Z"})
    assert first.status_code == 201
    assert second.status_code == 201
    history = client.get(f"/api/v1/players/{player['id']}/athletic-tests", params={"team_id": team["id"]}, headers=headers)
    assert history.status_code == 200
    assert [item["value"] for item in history.json()[:2]] == [1.9, 2.1]
    assert client.get("/api/v1/athletic-tests", params={"team_id": team["id"]}, headers={"x-dev-user-id": "foreign_user"}).status_code == 404


def test_player_reviews_are_append_only_and_team_scoped(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    player = client.get("/api/v1/players", params={"team_id": team["id"]}, headers=headers).json()[0]
    payload = {"review_date": "2026-02-20", "strengths": "Consistent release", "next_steps": "Improve reset speed", "status": "published", "visibility": "staff"}
    first = client.post(f"/api/v1/players/{player['id']}/reviews", params={"team_id": team["id"]}, headers=headers, json=payload)
    second = client.post(f"/api/v1/players/{player['id']}/reviews", params={"team_id": team["id"]}, headers=headers, json={**payload, "review_date": "2026-03-20", "strengths": "Better timing"})
    assert first.status_code == 201
    assert second.status_code == 201
    reviews = client.get(f"/api/v1/players/{player['id']}/reviews", params={"team_id": team["id"]}, headers=headers)
    assert reviews.status_code == 200
    assert len(reviews.json()) == 2
    assert reviews.json()[0]["review_date"] == "2026-03-20"
    assert client.get(f"/api/v1/players/{player['id']}/reviews", params={"team_id": team["id"]}, headers={"x-dev-user-id": "foreign_user"}).status_code == 404


def test_development_overviews_aggregate_players_and_support_filters(client):
    team = get_team(client)
    headers = {"x-dev-user-id": "test_user"}
    player = client.get("/api/v1/players", params={"team_id": team["id"]}, headers=headers).json()[0]
    review = client.post(f"/api/v1/players/{player['id']}/reviews", params={"team_id": team["id"]}, headers=headers, json={"review_date": "2026-04-01", "status": "published", "visibility": "staff", "strengths": "Reliable"})
    definitions = client.get("/api/v1/athletic-tests", params={"team_id": team["id"]}, headers=headers).json()
    result = client.post(f"/api/v1/players/{player['id']}/athletic-tests", params={"team_id": team["id"]}, headers=headers, json={"test_id": definitions[0]["id"], "value": 2.0})
    assert review.status_code == 201
    assert result.status_code == 201

    reviews = client.get("/api/v1/reviews", params={"team_id": team["id"], "review_status": "published", "player_id": player["id"]}, headers=headers)
    tests = client.get("/api/v1/athletic-test-results", params={"team_id": team["id"], "test_id": definitions[0]["id"], "category": definitions[0]["category"], "player_id": player["id"]}, headers=headers)
    assert reviews.status_code == 200
    assert reviews.json()[0]["player_name"] == f"{player['first_name']} {player['last_name']}"
    assert tests.status_code == 200
    assert tests.json()[0]["player_name"] == f"{player['first_name']} {player['last_name']}"
