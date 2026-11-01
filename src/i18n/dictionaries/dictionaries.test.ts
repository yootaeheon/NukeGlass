import { describe, expect, it } from "vitest";
import en from "./en";
import ja from "./ja";
import ko from "./ko";
import zhCn from "./zh-cn";
import zhTw from "./zh-tw";

// TypeScript checks keys but not array lengths; a shorter list would crash the page at runtime.
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  }
  return typeof value;
}

function placeholders(value: unknown, path = "", out: Record<string, string[]> = {}) {
  if (typeof value === "string") out[path] = (value.match(/\{\w+\}/g) ?? []).sort();
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) placeholders(v, `${path}.${k}`, out);
  return out;
}

describe.each([
  ["ja", ja],
  ["zh-cn", zhCn],
  ["zh-tw", zhTw],
  ["ko", ko],
])("dictionary %s", (_, dict) => {
  it("has the same keys and list lengths as English", () => {
    expect(shape(dict)).toEqual(shape(en));
  });

  it("keeps every {placeholder} from English", () => {
    expect(placeholders(dict)).toEqual(placeholders(en));
  });
});
