import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { plural } from "pluralize";
import { applicationDtoElement } from "../elements/application-dto.element";
import { presentationRequestDtoElement } from "../elements/presentation-dto.element";
import { specElement } from "../elements/spec.element";
import { useCaseElement } from "../elements/use-case.element";
import { createModulePath } from "../utils/create-module-path";
import { createFile, decapitalize, formatFile, startsInBasePath } from "../utils/file";
import { getRouteFromAction } from "../utils/get-route-from-action";
import { toCamelCase, toPascalCase } from "../utils/naming";
import { updateControllerFile } from "../utils/update-controller-file";
import { updateModuleFile } from "../utils/update-module-file";
import { IGenerator, IGeneratorOptions } from "./generate.generator";
import { ModuleGenerator } from "./module.generator";

export class UseCaseGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the use case name.");
			process.exit(1);
			return;
		}
		const useCaseNameKebab = resourceNameKebab;
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
						await this.generateUseCase(modulePath, moduleFilePath, moduleNameKebab, useCaseNameKebab, options);
					} else {
						console.error(`${chalk.red(`Module "${moduleNameKebab}" not found.`)}`);
						process.exit(1);
					}
				})
				.catch(() => console.log("Console has been closed"));
		} else {
			await this.generateUseCase(modulePath, moduleFilePath, moduleNameKebab, useCaseNameKebab, options);
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
		const resourceDir = path.join(basePath, modulePath);
		const useCaseDir = path.join(resourceDir, "application/use-cases", resourceNameKebab);
		startsInBasePath(basePath, useCaseDir);

		const capitalizedUseCaseName = toPascalCase(resourceNameKebab);
		const useCaseName = `${capitalizedUseCaseName}UseCase`;
		const useCasePropertyName = `${decapitalize(capitalizedUseCaseName)}UseCase`;
		const moduleName = toPascalCase(moduleNameKebab);
		const outputDtoName = `${moduleName}OutputDto`;
		const shouldUseBody = this.shouldUseBody(resourceNameKebab);
		const isDelete = resourceNameKebab.startsWith("delete-") || resourceNameKebab.startsWith("remove-");
		const inputDtoName = shouldUseBody ? `${capitalizedUseCaseName}Dto` : undefined;
		const responseDtoName = isDelete ? undefined : `${moduleName}ResponseDto`;

		if (inputDtoName) {
			await createFile(path.join(resourceDir, "application/dtos", `${resourceNameKebab}.dto.ts`), applicationDtoElement(inputDtoName));
			await createFile(
				path.join(resourceDir, "presentation/dtos", `${resourceNameKebab}.request.dto.ts`),
				presentationRequestDtoElement(`${capitalizedUseCaseName}RequestDto`)
			);
		}

		await createFile(
			path.join(useCaseDir, `${resourceNameKebab}.use-case.ts`),
			useCaseElement(capitalizedUseCaseName, inputDtoName, responseDtoName ? outputDtoName : undefined)
		);
		if (options.spec) {
			await createFile(
				path.join(useCaseDir, `${resourceNameKebab}.spec.ts`),
				specElement(capitalizedUseCaseName, decapitalize(capitalizedUseCaseName), resourceNameKebab)
			);
		}

		updateModuleFile(moduleFilePath, [
			{
				arrayName: ["providers", "exports"],
				content: useCaseName,
				imports: { name: useCaseName, path: `./application/use-cases/${resourceNameKebab}/${resourceNameKebab}.use-case` },
			},
		]);
		await formatFile(moduleFilePath);

		const controllerFilePath = path.join(resourceDir, "presentation/controllers", `${moduleNameKebab}.controller.ts`);
		const route = this.getControllerRoute(moduleNameKebab, resourceNameKebab);
		updateControllerFile(controllerFilePath, {
			bodyDtoName: inputDtoName ? `${capitalizedUseCaseName}RequestDto` : undefined,
			bodyDtoPath: inputDtoName ? `../dtos/${resourceNameKebab}.request.dto` : undefined,
			httpMethod: route.method,
			httpPath: route.path,
			methodName: toCamelCase(resourceNameKebab),
			responseDtoName,
			responseDtoPath: responseDtoName ? `../dtos/${moduleNameKebab}.response.dto` : undefined,
			useCaseName,
			useCasePath: `../../application/use-cases/${resourceNameKebab}/${resourceNameKebab}.use-case`,
			useCasePropertyName,
		});
		await formatFile(controllerFilePath);
	}

	private static shouldUseBody(resourceNameKebab: string): boolean {
		return resourceNameKebab.startsWith("create-") || resourceNameKebab.startsWith("add-") || resourceNameKebab.startsWith("update-");
	}

	private static getControllerRoute(moduleNameKebab: string, resourceNameKebab: string): { method: "Get" | "Post" | "Patch" | "Delete"; path?: string } {
		const route = getRouteFromAction(resourceNameKebab);
		const moduleRoute = plural(moduleNameKebab);
		if (!route.path || route.path === moduleRoute) return { method: route.method };
		if (route.path === `${moduleRoute}/:id`) return { method: route.method, path: ":id" };
		return route;
	}
}
