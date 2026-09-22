import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlayerRadar } from "./PlayerRadar";

describe("PlayerRadar", () => {
  it("renders an accessible six-axis radar with current scores", () => {
    render(<PlayerRadar scores={[
      { skill_id: "1", skill_name: "Disc skills", category: "attack", score: 4, source: "assessment", note: null, recorded_at: null },
      { skill_id: "2", skill_name: "Movement & spacing", category: "attack", score: 3, source: "assessment", note: null, recorded_at: null },
      { skill_id: "3", skill_name: "Decision making", category: "attack", score: 5, source: "assessment", note: null, recorded_at: null },
      { skill_id: "4", skill_name: "Man marking", category: "defense", score: 2, source: "assessment", note: null, recorded_at: null },
      { skill_id: "5", skill_name: "Zone marking", category: "defense", score: 4, source: "assessment", note: null, recorded_at: null },
      { skill_id: "6", skill_name: "Game reading", category: "defense", score: 3, source: "assessment", note: null, recorded_at: null },
    ]} />);
    expect(screen.getByRole("img", { name: /Player skill radar chart/ })).toBeInTheDocument();
    expect(screen.getByText("Disc skills")).toBeInTheDocument();
    expect(screen.getByText("Attack")).toBeInTheDocument();
    expect(screen.getByText("Defense")).toBeInTheDocument();
    expect(screen.getByLabelText("Disc skills: 4 out of 10")).toBeInTheDocument();
    expect(screen.getByText("1–10 · 0.5 increments")).toBeInTheDocument();
  });

  it("shows the current score, starting point, and variation on hover", () => {
    const score = { skill_id: "1", skill_name: "Disc skills", category: "attack" as const, score: 4, source: "assessment" as const, note: null, recorded_at: null };
    render(<PlayerRadar scores={[score]} baselineScores={[{ ...score, score: 2 }]} />);
    fireEvent.mouseEnter(screen.getByLabelText("Disc skills: 4 out of 10"));
    const tooltip = screen.getByRole("status");
    expect(tooltip).toHaveTextContent("Current 4.0 / 10");
    expect(tooltip).toHaveTextContent("Starting point 2.0 / 10");
    expect(tooltip).toHaveTextContent("Variation +2.0 pts");
  });
});
