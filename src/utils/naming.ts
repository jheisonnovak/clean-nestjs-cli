import { capitalize, decapitalize, kebabToCamel } from "./file";
import { plural } from "pluralize";

export const toPascalCase = (value: string): string => capitalize(kebabToCamel(value));

export const toCamelCase = (value: string): string => decapitalize(kebabToCamel(value));

export const toConstantCase = (value: string): string => value.replace(/-/g, "_").toUpperCase();

export const toSnakeCase = (value: string): string =>
	value
		.replace(/([a-z0-9])([A-Z])/g, "$1_$2")
		.replace(/-/g, "_")
		.toLowerCase();

export const toTableName = (value: string): string => plural(toSnakeCase(value));

const conventionalSingularRoutes = new Set(["auth", "health", "login", "logout", "me"]);

export const toRoutePath = (value: string): string => {
	if (conventionalSingularRoutes.has(value)) return value;
	return plural(value);
};

export const repositoryTokenName = (resourceNameKebab: string): string => `${toConstantCase(resourceNameKebab)}_REPOSITORY`;

export const repositoryInterfaceName = (resourceNameKebab: string): string => `${toPascalCase(resourceNameKebab)}Repository`;

export const repositoryImplementationName = (resourceNameKebab: string, orm: "typeorm" | "prisma"): string =>
	orm === "typeorm" ? `${toPascalCase(resourceNameKebab)}TypeOrmRepository` : `${toPascalCase(resourceNameKebab)}PrismaRepository`;

export const persistenceEntityName = (resourceNameKebab: string, orm: "typeorm" | "prisma"): string =>
	orm === "typeorm" ? `${toPascalCase(resourceNameKebab)}TypeOrmEntity` : `${toPascalCase(resourceNameKebab)}PrismaModel`;
