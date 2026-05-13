import * as fs from "fs";
import * as path from "path";
import { plural } from "pluralize";
import { controllerElement } from "../elements/controller.element";
import { domainEntityElement } from "../elements/domain-entity.element";
import { infrastructureMapperElement, presentationMapperElement } from "../elements/mapper.element";
import { moduleElement } from "../elements/module.element";
import { outputDtoElement } from "../elements/output-dto.element";
import { typeOrmPersistenceElement } from "../elements/persistence.element";
import { presentationResponseDtoElement } from "../elements/presentation-dto.element";
import { repositoryInterfaceElement } from "../elements/repository-interface.element";
import { prismaRepositoryElement, typeOrmRepositoryElement } from "../elements/repository.element";
import { cleanNestConfigElement, Orm, readFormattingPreferences, resolveOrm } from "../utils/clean-config";
import { createModulePath } from "../utils/create-module-path";
import { capitalize, createFile, formatFile, kebabToCamel, startsInBasePath } from "../utils/file";
import {
	persistenceEntityName,
	repositoryImplementationName,
	repositoryInterfaceName,
	repositoryTokenName,
	toTableName,
	toPascalCase,
} from "../utils/naming";
import { IFileModuleUpdate, updateModuleFile } from "../utils/update-module-file";
import { IGenerator, IGeneratorOptions } from "./generate.generator";

export class ModuleGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions): Promise<void> {
		const orm = resolveOrm(options.orm);
		const resourceNameCamel = kebabToCamel(moduleNameKebab);
		const moduleName = capitalize(resourceNameCamel);
		const resourcePath = options.path;
		const modulePath = createModulePath(resourcePath, moduleNameKebab);
		const basePath = path.join(process.cwd(), "./src/modules/");
		const resourceDir = path.join(basePath, modulePath);
		startsInBasePath(basePath, resourceDir);

		await createFile(path.join(process.cwd(), "clean-nest.json"), cleanNestConfigElement(orm, readFormattingPreferences()));
		await this.createLayerDirectories(resourceDir);
		await this.createCoreFiles(resourceDir, moduleNameKebab, moduleName, orm);
		await this.updateFeatureModule(resourceDir, moduleNameKebab, moduleName, orm);
		this.updateAppModule(modulePath, moduleName, moduleNameKebab);
	}

	private static async createLayerDirectories(resourceDir: string): Promise<void> {
		const dirs = [
			"domain/entities",
			"domain/enums",
			"domain/errors",
			"domain/repositories",
			"application/dtos",
			"application/errors",
			"application/ports",
			"application/use-cases",
			"infrastructure/persistence",
			"infrastructure/repositories",
			"infrastructure/mappers",
			"presentation/controllers",
			"presentation/dtos",
			"presentation/mappers",
		];

		dirs.forEach(dir => fs.mkdirSync(path.join(resourceDir, dir), { recursive: true }));
	}

	private static async createCoreFiles(resourceDir: string, resourceNameKebab: string, moduleName: string, orm: Orm): Promise<void> {
		const entityName = toPascalCase(resourceNameKebab);
		const outputDtoName = `${entityName}OutputDto`;
		const responseDtoName = `${entityName}ResponseDto`;
		const mapperName = `${entityName}ResponseMapper`;
		const repositoryContract = repositoryInterfaceName(resourceNameKebab);
		const tokenName = repositoryTokenName(resourceNameKebab);

		await createFile(path.join(resourceDir, `${resourceNameKebab}.module.ts`), moduleElement(moduleName));
		await createFile(path.join(resourceDir, "domain/entities", `${resourceNameKebab}.entity.ts`), domainEntityElement(entityName));
		await createFile(
			path.join(resourceDir, "domain/repositories", `${resourceNameKebab}.repository.ts`),
			repositoryInterfaceElement(repositoryContract, tokenName)
		);
		await createFile(path.join(resourceDir, "application/dtos", `${resourceNameKebab}-output.dto.ts`), outputDtoElement(outputDtoName));
		await createFile(
			path.join(resourceDir, "presentation/dtos", `${resourceNameKebab}.response.dto.ts`),
			presentationResponseDtoElement(responseDtoName, outputDtoName, `${resourceNameKebab}-output`)
		);
		await createFile(
			path.join(resourceDir, "presentation/mappers", `${resourceNameKebab}-response.mapper.ts`),
			presentationMapperElement(mapperName, responseDtoName, outputDtoName, resourceNameKebab)
		);
		await createFile(
			path.join(resourceDir, "presentation/controllers", `${resourceNameKebab}.controller.ts`),
			controllerElement(moduleName, plural(resourceNameKebab))
		);

		if (orm === "typeorm" || orm === "prisma") {
			await this.createRepositoryFiles(resourceDir, resourceNameKebab, orm);
		}
	}

	static async createRepositoryFiles(resourceDir: string, resourceNameKebab: string, orm: Orm): Promise<void> {
		const entityName = toPascalCase(resourceNameKebab);
		const repositoryContract = repositoryInterfaceName(resourceNameKebab);
		const repositoryName = repositoryImplementationName(resourceNameKebab, orm === "prisma" ? "prisma" : "typeorm");

		if (orm === "typeorm") {
			const persistenceName = persistenceEntityName(resourceNameKebab, "typeorm");
			await createFile(
				path.join(resourceDir, "infrastructure/persistence", `${resourceNameKebab}.orm.entity.ts`),
				typeOrmPersistenceElement(persistenceName, toTableName(resourceNameKebab))
			);
			await createFile(
				path.join(resourceDir, "infrastructure/mappers", `${resourceNameKebab}.mapper.ts`),
				infrastructureMapperElement(`${entityName}Mapper`, entityName, persistenceName, resourceNameKebab)
			);
			await createFile(
				path.join(resourceDir, "infrastructure/repositories", `${resourceNameKebab}.typeorm.repository.ts`),
				typeOrmRepositoryElement(repositoryName, repositoryContract, resourceNameKebab)
			);
			return;
		}

		await createFile(
			path.join(resourceDir, "infrastructure/repositories", `${resourceNameKebab}.prisma.repository.ts`),
			prismaRepositoryElement(repositoryName, repositoryContract, resourceNameKebab)
		);
	}

	private static async updateFeatureModule(resourceDir: string, resourceNameKebab: string, moduleName: string, orm: Orm): Promise<void> {
		const moduleFilePath = path.join(resourceDir, `${resourceNameKebab}.module.ts`);
		const controllerName = `${moduleName}Controller`;
		const tokenName = repositoryTokenName(resourceNameKebab);

		const updates: IFileModuleUpdate[] = [
			{
				arrayName: ["controllers"],
				content: controllerName,
				imports: { name: controllerName, path: `./presentation/controllers/${resourceNameKebab}.controller` },
			},
		];

		if (orm === "typeorm" || orm === "prisma") {
			const repositoryName = repositoryImplementationName(resourceNameKebab, orm);
			const repositoryPath = `./infrastructure/repositories/${resourceNameKebab}.${orm}.repository`;
			const repositoryProvider = `{\n\tprovide: ${tokenName},\n\tuseExisting: ${repositoryName},\n}`;

			updates.push(
				{
					arrayName: ["providers"],
					content: repositoryName,
					imports: { name: repositoryName, path: repositoryPath },
				},
				{
					arrayName: ["providers"],
					content: repositoryProvider,
				},
				{
					arrayName: ["exports"],
					content: tokenName,
					imports: { name: tokenName, path: `./domain/repositories/${resourceNameKebab}.repository` },
				}
			);

			if (orm === "typeorm") {
				const entityName = persistenceEntityName(resourceNameKebab, "typeorm");
				updates.push(
					{
						arrayName: ["imports"],
						content: `TypeOrmModule.forFeature([${entityName}])`,
						imports: { name: "TypeOrmModule", path: "@nestjs/typeorm" },
					},
					{
						arrayName: ["imports"],
						content: `TypeOrmModule.forFeature([${entityName}])`,
						imports: { name: entityName, path: `./infrastructure/persistence/${resourceNameKebab}.orm.entity` },
					}
				);
			}
		}

		updateModuleFile(moduleFilePath, updates);
		await formatFile(moduleFilePath);
	}

	private static updateAppModule(modulePath: string, moduleName: string, moduleNameKebab: string): void {
		const appModuleFilePath = path.posix.join(process.cwd(), "src", "app.module.ts");
		const moduleClassName = `${moduleName}Module`;
		const moduleClassPath = "./" + path.posix.join("modules", modulePath, `${moduleNameKebab}.module`);
		updateModuleFile(appModuleFilePath, [
			{
				arrayName: ["imports"],
				content: moduleClassName,
				imports: { name: moduleClassName, path: moduleClassPath },
			},
		]);
	}
}
