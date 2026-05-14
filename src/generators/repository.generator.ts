import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { domainEntityElement } from "../elements/domain/entity.element";
import { repositoryInterfaceElement } from "../elements/domain/repository-interface.element";
import { resolveOrm } from "../utils/clean-config";
import { createModulePath } from "../utils/create-module-path";
import { createFile, formatFile, startsInBasePath } from "../utils/file";
import { persistenceEntityName, repositoryImplementationName, repositoryInterfaceName, repositoryTokenName, toPascalCase } from "../utils/naming";
import { IFileModuleUpdate, updateModuleFile } from "../utils/update-module-file";
import { IGenerator, IGeneratorOptions } from "./generate.generator";
import { ModuleGenerator } from "./module.generator";

export class RepositoryGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the repository name.");
			process.exit(1);
			return;
		}
		const repositoryNameKebab = resourceNameKebab;
		const resourcePath = options.path;
		const modulePath = createModulePath(resourcePath, moduleNameKebab);

		const moduleFilePath = path.join(process.cwd(), "./src/modules", modulePath, `${moduleNameKebab}.module.ts`);
		if (!fs.existsSync(moduleFilePath)) {
			inquirer
				.prompt({
					type: "list",
					name: "generateModule",
					message: `Module "${moduleNameKebab}" not found. Do you want to generate the module?`,
					choices: ["yes", "no"],
					default: "yes",
				})
				.then(async answers => {
					if (answers.generateModule === "yes") {
						await ModuleGenerator.generate(moduleNameKebab, options);
						await this.generateRepository(repositoryNameKebab, modulePath, moduleFilePath, options);
					} else {
						console.error(`${chalk.red(`Module "${moduleNameKebab}" not found.`)}`);
						process.exit(1);
					}
				})
				.catch(() => console.log("Console has been closed"));
		} else {
			await this.generateRepository(repositoryNameKebab, modulePath, moduleFilePath, options);
		}
	}

	static async generateRepository(
		resourceNameKebab: string,
		modulePath: string,
		moduleFilePath: string,
		options: IGeneratorOptions
	): Promise<void> {
		const orm = resolveOrm(options.orm);
		const basePath = path.join(process.cwd(), "./src/modules/");
		const resourceDir = path.join(basePath, modulePath);
		startsInBasePath(basePath, resourceDir);

		const repositoryContract = repositoryInterfaceName(resourceNameKebab);
		const tokenName = repositoryTokenName(resourceNameKebab);
		await createFile(path.join(resourceDir, "domain/entities", `${resourceNameKebab}.entity.ts`), domainEntityElement(toPascalCase(resourceNameKebab)));
		await createFile(
			path.join(resourceDir, "domain/repositories", `${resourceNameKebab}.repository.ts`),
			repositoryInterfaceElement(repositoryContract, tokenName)
		);

		if (orm === "typeorm" || orm === "prisma") {
			await ModuleGenerator.createRepositoryFiles(resourceDir, resourceNameKebab, orm);
			this.updateModuleForRepository(moduleFilePath, resourceNameKebab, orm);
			await formatFile(moduleFilePath);
		}
	}

	private static updateModuleForRepository(moduleFilePath: string, resourceNameKebab: string, orm: "typeorm" | "prisma"): void {
		const repositoryName = repositoryImplementationName(resourceNameKebab, orm);
		const tokenName = repositoryTokenName(resourceNameKebab);
		const updates: IFileModuleUpdate[] = [
			{
				arrayName: ["providers"],
				content: repositoryName,
				imports: { name: repositoryName, path: `./infrastructure/repositories/${resourceNameKebab}.${orm}.repository` },
			},
			{
				arrayName: ["providers"],
				content: `{\n\tprovide: ${tokenName},\n\tuseExisting: ${repositoryName},\n}`,
			},
			{
				arrayName: ["exports"],
				content: tokenName,
				imports: { name: tokenName, path: `./domain/repositories/${resourceNameKebab}.repository` },
			},
		];

		if (orm === "typeorm") {
			const entityName = persistenceEntityName(resourceNameKebab, "typeorm");
			updates.push({
				arrayName: ["imports"],
				content: `TypeOrmModule.forFeature([${entityName}])`,
				imports: { name: "TypeOrmModule", path: "@nestjs/typeorm" },
			});
			updates.push({
				arrayName: ["imports"],
				content: `TypeOrmModule.forFeature([${entityName}])`,
				imports: { name: entityName, path: `./infrastructure/persistence/${resourceNameKebab}.orm.entity` },
			});
		}

		updateModuleFile(moduleFilePath, updates);
	}
}
