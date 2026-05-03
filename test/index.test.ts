import { describe, expect, it } from "vitest";
import { normalizePayerName } from "../src/index";

describe("normalizePayerName", () => {
  it("normalizes whitespace and casing", () => {
    expect(normalizePayerName("  Blue   Shield  ")).toBe("blue shield");
  });
});
