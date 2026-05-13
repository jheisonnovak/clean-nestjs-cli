import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { domainEntityElement } from "../elements/domain-entity.element";
import { infrastructureMapperElement } from "../elements/mapper.element";
import { typeOrmPersistenceElement } from "../elements/persistence.element";
import { resolveOrm } from "../utils/clean-config";
import { createModulePath } from "../utils/create-module-path";
import { createFile, startsInBasePath } from "../utils/file";
import { persistenceEntityName, toPascalCase } from "../utils/naming";
import { IGenerator, IGeneratorOptions } from "./generate.generator";
import { ModuleGenerator } from "./module.generator";

export class EntityGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the entity name.");
			process.exit(1);
			return;
		}
		const entityNameKebab = resourceNameKebab;

		const modulePath = createModulePath(options.path, moduleNameKebab);
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
						await this.generateEntity(modulePath, entityNameKebab, options);
					} else {
						console.error(`${chalk.red(`Module "${moduleNameKebab}" not found.`)}`);
						process.exit(1);
					}
				})
				.catch(() => console.log("Console has been closed"));
			return;
		}

		await this.generateEntity(modulePath, entityNameKebab, options);
	}

	private static async generateEntity(modulePath: string, resourceNameKebab: string, options: IGeneratorOptions): Promise<void> {
		const orm = resolveOrm(options.orm);
		const basePath = path.join(process.cwd(), "./src/modules/");
		const resourceDir = path.join(basePath, modulePath);
		startsInBasePath(basePath, resourceDir);

		const entityName = toPascalCase(resourceNameKebab);
		await createFile(path.join(resourceDir, "domain/entities", `${resourceNameKebab}.entity.ts`), domainEntityElement(entityName));

		if (orm === "typeorm") {
			const persistenceName = persistenceEntityName(resourceNameKebab, "typeorm");
			await createFile(
				path.join(resourceDir, "infrastructure/persistence", `${resourceNameKebab}.orm.entity.ts`),
				typeOrmPersistenceElement(persistenceName, resourceNameKebab)
			);
			await createFile(
				path.join(resourceDir, "infrastructure/mappers", `${resourceNameKebab}.mapper.ts`),
				infrastructureMapperElement(`${entityName}Mapper`, entityName, persistenceName, resourceNameKebab)
			);
		}
	}
}
