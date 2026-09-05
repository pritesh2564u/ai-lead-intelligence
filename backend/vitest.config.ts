import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts"],
        pool: "threads",
        maxWorkers: 1,
        fileParallelism: false,
    },
});
