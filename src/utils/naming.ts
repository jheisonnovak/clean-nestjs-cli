import { capitalize, decapitalize, kebabToCamel } from "./file";

export const toPascalCase = (value: string): string => capitalize(kebabToCamel(value));

export const toCamelCase = (value: string): string => decapitalize(kebabToCamel(value));

export const toConstantCase = (value: string): string => value.replace(/-/g, "_").toUpperCase();

export const repositoryTokenName = (resourceNameKebab: string): string => `${toConstantCase(resourceNameKebab)}_REPOSITORY`;

export const repositoryInterfaceName = (resourceNameKebab: string): string => `${toPascalCase(resourceNameKebab)}Repository`;

export const repositoryImplementationName = (resourceNameKebab: string, orm: "typeorm" | "prisma"): string =>
	orm === "typeorm" ? `${toPascalCase(resourceNameKebab)}TypeOrmRepository` : `${toPascalCase(resourceNameKebab)}PrismaRepository`;

export const persistenceEntityName = (resourceNameKebab: string, orm: "typeorm" | "prisma"): string =>
	orm === "typeorm" ? `${toPascalCase(resourceNameKebab)}TypeOrmEntity` : `${toPascalCase(resourceNameKebab)}PrismaModel`;
