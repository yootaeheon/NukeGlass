import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/book?model=oakley-meta-hstn")).toBe("/book?model=oakley-meta-hstn");
  });

  it("rejects external and protocol-relative targets", () => {
    expect(safeNextPath("https://evil.example")).toBe("/bookings");
    expect(safeNextPath("//evil.example")).toBe("/bookings");
    expect(safeNextPath("/\\evil.example")).toBe("/bookings");
    expect(safeNextPath(null)).toBe("/bookings");
  });

  it("rejects control characters that URL parsers strip", () => {
    // what ?next=/%09/evil.com, %0a, %0d decode to
    expect(safeNextPath("/\t/evil.com")).toBe("/bookings");
    expect(safeNextPath("/\n/evil.com")).toBe("/bookings");
    expect(safeNextPath("/\r/evil.com")).toBe("/bookings");
    expect(safeNextPath("/\t\\evil.com")).toBe("/bookings");
  });
});
