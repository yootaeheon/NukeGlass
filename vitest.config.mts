import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Agent worktrees under .claude/ hold copies of the repo; never run their tests here.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
});
