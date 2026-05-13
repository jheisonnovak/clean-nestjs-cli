import { existsSync, readFileSync } from "fs";
import path from "path";

export type Orm = "typeorm" | "prisma" | "none";

export interface CleanNestConfig {
	version: 3;
	architecture: "layered-clean";
	orm: Orm;
}

export const DEFAULT_ORM: Orm = "typeorm";

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
	};
};

export const resolveOrm = (optionOrm?: string, cwd = process.cwd()): Orm => {
	const normalizedOption = normalizeOrm(optionOrm);
	if (normalizedOption) return normalizedOption;

	return readCleanNestConfig(cwd)?.orm ?? DEFAULT_ORM;
};

export const cleanNestConfigElement = (orm: Orm): string => `{
	"version": 3,
	"architecture": "layered-clean",
	"orm": "${orm}"
}
`;
