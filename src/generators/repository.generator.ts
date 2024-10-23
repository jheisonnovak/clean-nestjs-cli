import * as fs from "fs";
import * as path from "path";
import { IGenerator } from "./generate.generator";
import { addToArray, capitalize, createFile, kebabToCamel } from "../utils/file";
import { createModulePath } from "../utils/create-module-path";
import { repositoryInterfaceElement } from "../elements/repository-interface.element";
import { repositoryElement } from "../elements/repository.element";

export class RepositoryGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, resourcePath: string = "", resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the repository name.");
			process.exit(1);
		}
		const modulePath = createModulePath(resourcePath, moduleNameKebab);
		const moduleNameCamel = kebabToCamel(moduleNameKebab);
		const repositoryNameCamel = kebabToCamel(resourceNameKebab);
		const moduleName = capitalize(moduleNameCamel);
		const repositoryName = capitalize(repositoryNameCamel);
		const resourceDir = path.join(process.cwd(), "./src/modules", modulePath);

		const repositoryInterfaceContent = repositoryInterfaceElement(repositoryName);

		const repositoryContent = repositoryElement(repositoryName, resourceNameKebab);

		createFile(path.join(resourceDir, "repositories", `${resourceNameKebab}.repository.ts`), repositoryContent);
		createFile(path.join(resourceDir, "models/interfaces", `${resourceNameKebab}-repository.interface.ts`), repositoryInterfaceContent);

		const updateModuleFile = (moduleFilePath: string, repositoryName: string, repositoryPath: string) => {
			if (!fs.existsSync(moduleFilePath)) {
				console.warn(`Module file ${moduleFilePath} not found. Skipping import.`);
				process.exit(1);
			}

			let moduleFileContent = fs.readFileSync(moduleFilePath, "utf8");

			const importStatement = `
import { ${repositoryName}TypeOrmRepository } from "./${repositoryPath}";`;
			const providersContent = `{
            provide: "I${repositoryName}Repository",
            useExisting: ${repositoryName}TypeOrmRepository
        }`;

			if (!moduleFileContent.includes(importStatement.trim())) {
				moduleFileContent = moduleFileContent.replace(/(import {.* from .*;)/, `$1${importStatement}`);
			}

			moduleFileContent = addToArray("providers", `${repositoryName}TypeOrmRepository`, moduleFileContent);
			moduleFileContent = addToArray("providers", providersContent, moduleFileContent);
			moduleFileContent = addToArray("exports", `"I${repositoryName}Repository"`, moduleFileContent);

			fs.writeFileSync(moduleFilePath, moduleFileContent, "utf8");
		};

		updateModuleFile(path.join(resourceDir, `${moduleNameKebab}.module.ts`), repositoryName, `repositories/${resourceNameKebab}.repository`);
	}
}
