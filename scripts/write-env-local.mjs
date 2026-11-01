// Writes .env.local for a Supabase project using the logged-in Supabase CLI.
// Only the project URL and the PUBLISHABLE key are written; secret keys are never
// requested or printed, and the key value itself is never logged.
//
// Usage: node scripts/write-env-local.mjs <project-ref>
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ref = process.argv[2];
if (!ref || !/^[a-z0-9]{20}$/.test(ref)) {
  console.error("Usage: node scripts/write-env-local.mjs <20-character project ref>");
  process.exit(1);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const raw = execFileSync(npx, ["supabase", "projects", "api-keys", "--project-ref", ref, "-o", "json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
  shell: process.platform === "win32",
});

const keys = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
const publishable =
  keys.find((k) => typeof k.api_key === "string" && k.api_key.startsWith("sb_publishable_")) ??
  keys.find((k) => k.name === "anon");

if (!publishable?.api_key) {
  console.error("No publishable key found for this project.");
  process.exit(1);
}

writeFileSync(
  ".env.local",
  `NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable.api_key}\n`,
);
console.log(`.env.local written for project ${ref} (publishable key, ${publishable.api_key.length} chars, value not shown)`);
