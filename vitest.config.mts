import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Agent worktrees under .claude/ hold copies of the repo; never run their tests here.
    exclude: ["**/node_modules/**", "**/.next/**", ".claude/**"],
  },
});
