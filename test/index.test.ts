import { describe, expect, it } from "vitest";
import { cn, formatDate } from "../src/lib/utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", false, undefined, "c")).toBe("a b c");
  });

  it("returns empty string for all falsy inputs", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a Date object without throwing", () => {
    const result = formatDate(new Date("2024-01-15T10:00:00Z"));
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("accepts an ISO string", () => {
    const result = formatDate("2024-06-01T00:00:00Z");
    expect(result).toContain("2024");
  });
});
