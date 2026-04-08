import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		extensions: [".ts", ".mts", ".tsx", ".js", ".mjs", ".jsx", ".json"],
	},
	test: {
		include: ["tests/**/*.spec.ts"],
		environment: "node",
		fileParallelism: false,
		setupFiles: ["tests/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.ts", "bin/**/*.ts"],
			exclude: ["**/*.d.ts", "**/*.js", "tests/**"],
		},
	},
});
