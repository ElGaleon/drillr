import { describe, expect, it } from "vitest";
import { formatDate, initials } from "./utils";

describe("player utilities", () => {
  it("creates stable initials", () => {
    expect(initials("Ada", "Lovelace")).toBe("AL");
    expect(initials("Ada", "")).toBe("A");
  });

  it("formats dates and handles empty values", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("2020-01-02")).toContain("2020");
  });
});
