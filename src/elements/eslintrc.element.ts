export const eslintElement = (): string => `import prettierConfig from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(tseslint.configs.recommended, prettierConfig, {
	ignores: ["eslint.config.mjs", "node_modules/**", "dist/**"],
	languageOptions: {
		parser: tseslint.parser,
		parserOptions: {
			project: "./tsconfig.json",
			tsconfigRootDir: import.meta.dirname,
			sourceType: "module",
		},
	},
	plugins: {
		"@typescript-eslint": tseslint.plugin,
		prettier: eslintPluginPrettier,
	},
	rules: {
		"prettier/prettier": ["error"],
		"@typescript-eslint/explicit-function-return-type": "warn",
		"@typescript-eslint/explicit-module-boundary-types": "warn",
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/no-unused-vars": ["warn", { vars: "all", args: "after-used", ignoreRestSiblings: true }],
		"@typescript-eslint/no-empty-object-type": ["warn"],
		"@typescript-eslint/no-unused-expressions": "warn",
		"@typescript-eslint/no-require-imports": ["error"],
	},
});
`;
