import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { controllerElement } from "../elements/controller.element";
import { specElement } from "../elements/spec.element";
import { useCaseElement } from "../elements/use-case.element";
import { createModulePath } from "../utils/create-module-path";
import { capitalize, createFile, decapitalize, formatFile, kebabToCamel, startsInBasePath } from "../utils/file";
import { updateModuleFile } from "../utils/update-module-file";
import { IGenerator, IGeneratorOptions } from "./generate.generator";
import { ModuleGenerator } from "./module.generator";

export class UseCaseGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the use case name.");
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
						await this.generateUseCase(modulePath, moduleFilePath, moduleNameKebab, resourceNameKebab, options);
					} else {
						console.error(`${chalk.red(`Module "${moduleNameKebab}" not found.`)}`);
						process.exit(1);
					}
				})
				.catch(() => console.log("Console has been closed"));
		} else {
			await this.generateUseCase(modulePath, moduleFilePath, moduleNameKebab, resourceNameKebab, options);
		}
	}

	static async generateUseCase(
		modulePath: string,
		moduleFilePath: string,
		moduleNameKebab: string,
		resourceNameKebab: string,
		options: IGeneratorOptions
	): Promise<void> {
		const basePath = path.join(process.cwd(), "./src/modules");
		const useCaseDir = path.join(basePath, modulePath, "use-cases", resourceNameKebab);
		startsInBasePath(basePath, useCaseDir);

		const moduleNameCamel = kebabToCamel(moduleNameKebab);
		const useCaseNameCamel = kebabToCamel(resourceNameKebab);
		const capitalizedModuleName = capitalize(moduleNameCamel);
		const capitalizedUseCaseName = capitalize(useCaseNameCamel) + capitalizedModuleName;
		const decapitalizedUseCaseName = decapitalize(useCaseNameCamel);

		const useCaseContent = useCaseElement(capitalizedUseCaseName);
		const controllerContent = controllerElement(capitalizedUseCaseName, resourceNameKebab, modulePath, decapitalizedUseCaseName);

		await createFile(path.join(useCaseDir, `${resourceNameKebab}.use-case.ts`), useCaseContent);
		await createFile(path.join(useCaseDir, `${resourceNameKebab}.controller.ts`), controllerContent);
		if (options.spec) {
			const specContent = specElement(
				capitalizedUseCaseName,
				moduleNameKebab,
				moduleNameCamel,
				decapitalizedUseCaseName,
				capitalizedModuleName,
				resourceNameKebab
			);
			await createFile(path.join(useCaseDir, `${resourceNameKebab}.spec.ts`), specContent);
		}

		const controllerName = `${capitalizedUseCaseName}Controller`;
		const useCaseName = `${capitalizedUseCaseName}UseCase`;
		const controllerPath = "./" + path.posix.join("use-cases", resourceNameKebab, `${resourceNameKebab}.controller`);
		const useCasePath = "./" + path.posix.join("use-cases", resourceNameKebab, `${resourceNameKebab}.use-case`);

		updateModuleFile(moduleFilePath, [
			{
				arrayName: ["controllers"],
				content: controllerName,
				imports: { name: controllerName, path: controllerPath },
			},
			{
				arrayName: ["providers", "exports"],
				content: useCaseName,
				imports: { name: useCaseName, path: useCasePath },
			},
		]);
		await formatFile(moduleFilePath);
	}
}
