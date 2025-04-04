import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { repositoryInterfaceElement } from "../elements/repository-interface.element";
import { repositoryElement } from "../elements/repository.element";
import { createModulePath } from "../utils/create-module-path";
import { capitalize, createFile, formatFile, kebabToCamel, startsInBasePath } from "../utils/file";
import { updateModuleFile } from "../utils/update-module-file";
import { IGenerator, IGeneratorOptions } from "./generate.generator";
import { ModuleGenerator } from "./module.generator";

export class RepositoryGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the repository name.");
			process.exit(1);
		}
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
						await this.generateRepository(resourceNameKebab, modulePath, moduleFilePath);
					} else {
						console.error(`${chalk.red(`Module "${moduleNameKebab}" not found.`)}`);
						process.exit(1);
					}
				})
				.catch(() => console.log("Console has been closed"));
		} else {
			await this.generateRepository(resourceNameKebab, modulePath, moduleFilePath);
		}
	}

	static async generateRepository(resourceNameKebab: string, modulePath: string, moduleFilePath: string) {
		const repositoryNameCamel = kebabToCamel(resourceNameKebab);
		const repositoryName = capitalize(repositoryNameCamel);
		const basePath = path.join(process.cwd(), "./src/modules/");
		const resourceDir = path.join(basePath, modulePath);
		startsInBasePath(basePath, resourceDir);

		const repositoryInterfaceContent = repositoryInterfaceElement(repositoryName);

		const repositoryContent = repositoryElement(repositoryName, resourceNameKebab);

		await createFile(path.join(resourceDir, "repositories", `${resourceNameKebab}.repository.ts`), repositoryContent);
		await createFile(path.join(resourceDir, "models/interfaces", `${resourceNameKebab}-repository.interface.ts`), repositoryInterfaceContent);

		const repository = `${repositoryName}TypeOrmRepository`;
		const repositoryInterface = `"I${repositoryName}Repository"`;
		const repositoryProvider = `{\n	provide: ${repositoryInterface},\n	useExisting: ${repository},\n}`;
		const repositoryPath = `./repositories/${resourceNameKebab}.repository`;

		updateModuleFile(moduleFilePath, [
			{
				arrayName: ["providers"],
				content: repository,
				imports: { name: repository, path: repositoryPath },
			},
			{
				arrayName: ["providers"],
				content: repositoryProvider,
			},
			{
				arrayName: ["exports"],
				content: repositoryInterface,
			},
		]);
		await formatFile(moduleFilePath);
	}
}
