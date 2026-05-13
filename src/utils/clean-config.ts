import { existsSync, readFileSync } from "fs";
import path from "path";

export type Orm = "typeorm" | "prisma" | "none";

export interface FormattingPreferences {
	indentation: "tabs" | "spaces";
	printWidth: number;
	tabWidth: number;
}

export interface CleanNestConfig {
	version: 3;
	architecture: "layered-clean";
	orm: Orm;
	formatting?: FormattingPreferences;
}

export const DEFAULT_ORM: Orm = "typeorm";
export const DEFAULT_FORMATTING: FormattingPreferences = {
	indentation: "tabs",
	printWidth: 150,
	tabWidth: 4,
};

const isOrm = (value: unknown): value is Orm => value === "typeorm" || value === "prisma" || value === "none";

export const normalizeOrm = (value: string | undefined): Orm | undefined => {
	if (!value) return undefined;
	const normalized = value.toLowerCase();
	return isOrm(normalized) ? normalized : undefined;
};

export const readCleanNestConfig = (cwd = process.cwd()): CleanNestConfig | null => {
	const configPath = path.join(cwd, "clean-nest.json");
	if (!existsSync(configPath)) return null;

	const config = JSON.parse(readFileSync(configPath, "utf8")) as Partial<CleanNestConfig>;
	return {
		version: 3,
		architecture: "layered-clean",
		orm: isOrm(config.orm) ? config.orm : DEFAULT_ORM,
		formatting: normalizeFormatting(config.formatting),
	};
};

export const resolveOrm = (optionOrm?: string, cwd = process.cwd()): Orm => {
	const normalizedOption = normalizeOrm(optionOrm);
	if (normalizedOption) return normalizedOption;

	return readCleanNestConfig(cwd)?.orm ?? DEFAULT_ORM;
};

export const readFormattingPreferences = (cwd = process.cwd()): FormattingPreferences => {
	const configFormatting = readCleanNestConfig(cwd)?.formatting;
	if (configFormatting) return configFormatting;

	const prettierConfigPath = path.join(cwd, ".prettierrc");
	if (!existsSync(prettierConfigPath)) return DEFAULT_FORMATTING;

	const prettierConfig = JSON.parse(readFileSync(prettierConfigPath, "utf8")) as {
		printWidth?: number;
		tabWidth?: number;
		useTabs?: boolean;
	};

	return {
		indentation: prettierConfig.useTabs === false ? "spaces" : "tabs",
		printWidth: prettierConfig.printWidth ?? DEFAULT_FORMATTING.printWidth,
		tabWidth: prettierConfig.tabWidth ?? DEFAULT_FORMATTING.tabWidth,
	};
};

export const cleanNestConfigElement = (orm: Orm, formatting: FormattingPreferences = DEFAULT_FORMATTING): string => `{
	"version": 3,
	"architecture": "layered-clean",
	"orm": "${orm}",
	"formatting": {
		"indentation": "${formatting.indentation}",
		"printWidth": ${formatting.printWidth},
		"tabWidth": ${formatting.tabWidth}
	}
}
`;

const normalizeFormatting = (formatting: unknown): FormattingPreferences | undefined => {
	if (!formatting || typeof formatting !== "object") return undefined;
	const value = formatting as Partial<FormattingPreferences>;
	return {
		indentation: value.indentation === "spaces" ? "spaces" : "tabs",
		printWidth: typeof value.printWidth === "number" ? value.printWidth : DEFAULT_FORMATTING.printWidth,
		tabWidth: typeof value.tabWidth === "number" ? value.tabWidth : DEFAULT_FORMATTING.tabWidth,
	};
};
