import { describe, expect, it } from "vitest";
import { isValidSupabaseUrl } from "./config";

describe("isValidSupabaseUrl", () => {
  it("accepts project URLs", () => {
    expect(isValidSupabaseUrl("https://abcdefgh.supabase.co")).toBe(true);
    expect(isValidSupabaseUrl("http://127.0.0.1:54321")).toBe(true);
  });

  it("rejects placeholders and URLs without a scheme", () => {
    expect(isValidSupabaseUrl("여기에")).toBe(false);
    expect(isValidSupabaseUrl("abcdefgh.supabase.co")).toBe(false);
    expect(isValidSupabaseUrl("")).toBe(false);
  });
});
