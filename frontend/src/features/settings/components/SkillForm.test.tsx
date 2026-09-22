import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SkillForm } from "./SkillForm";

describe("SkillForm", () => {
  it("shows boundary validation before submitting an empty skill", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SkillForm onCancel={vi.fn()} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Save skill" }));
    expect(await screen.findByText("Skill name is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
