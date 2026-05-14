import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { plural } from "pluralize";
import { applicationDtoElement } from "../elements/application/dto.element";
import { outputDtoElement } from "../elements/application/output-dto.element";
import { specElement } from "../elements/application/spec.element";
import { useCaseElement } from "../elements/application/use-case.element";
import { controllerElement } from "../elements/presentation/controller.element";
import { presentationRequestDtoElement, presentationResponseDtoElement } from "../elements/presentation/dto.element";
import { createModulePath } from "../utils/create-module-path";
import { createFile, decapitalize, formatFile, startsInBasePath } from "../utils/file";
import { getRouteFromAction } from "../utils/get-route-from-action";
import { toCamelCase, toPascalCase, toRoutePath } from "../utils/naming";
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
		const useCaseNameKebab = this.normalizeUseCaseName(moduleNameKebab, resourceNameKebab);
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
		const shouldUseBody = this.shouldUseBody(resourceNameKebab);
		const inputDtoName = shouldUseBody ? `${capitalizedUseCaseName}Dto` : undefined;
		const output = this.resolveOutput(moduleNameKebab, resourceNameKebab);
		const route = this.getControllerRoute(moduleNameKebab, resourceNameKebab);
		const usesId = route.path?.includes(":id") ?? false;
		const shouldGenerateController = options.controller !== false;

		if (output.kind !== "void") {
			await createFile(path.join(resourceDir, "application/dtos", `${output.outputDtoFileName}.dto.ts`), outputDtoElement(output.outputDtoName));
			if (shouldGenerateController) {
				await createFile(
					path.join(resourceDir, "presentation/dtos", `${output.responseDtoFileName}.dto.ts`),
					presentationResponseDtoElement(output.responseDtoName, output.outputDtoName, output.outputDtoFileName)
				);
			}
		}

		if (inputDtoName) {
			await createFile(path.join(resourceDir, "application/dtos", `${resourceNameKebab}.dto.ts`), applicationDtoElement(inputDtoName));
			if (shouldGenerateController) {
				await createFile(
					path.join(resourceDir, "presentation/dtos", `${resourceNameKebab}.request.dto.ts`),
					presentationRequestDtoElement(`${capitalizedUseCaseName}RequestDto`)
				);
			}
		}

		await createFile(
			path.join(useCaseDir, `${resourceNameKebab}.use-case.ts`),
			useCaseElement({
				capitalizedUseCaseName,
				inputDtoFileName: resourceNameKebab,
				inputDtoName,
				outputDtoFileName: output.kind !== "void" ? output.outputDtoFileName : undefined,
				outputDtoName: output.kind !== "void" ? output.outputDtoName : undefined,
				outputIsArray: output.kind !== "void" ? output.isArray : undefined,
				usesId,
			})
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

		if (shouldGenerateController) {
			const controllerFilePath = path.join(resourceDir, "presentation/controllers", `${moduleNameKebab}.controller.ts`);
			await this.ensureController(resourceDir, moduleFilePath, moduleNameKebab, moduleName);
			updateControllerFile(controllerFilePath, {
				applicationDtoName: inputDtoName,
				applicationDtoPath: inputDtoName ? `../../application/dtos/${resourceNameKebab}.dto` : undefined,
				bodyDtoName: inputDtoName ? `${capitalizedUseCaseName}RequestDto` : undefined,
				bodyDtoPath: inputDtoName ? `../dtos/${resourceNameKebab}.request.dto` : undefined,
				httpMethod: route.method,
				httpPath: route.path,
				methodName: toCamelCase(resourceNameKebab),
				responseDtoName: output.kind !== "void" ? output.responseDtoName : undefined,
				responseDtoPath: output.kind !== "void" ? `../dtos/${output.responseDtoFileName}.dto` : undefined,
				responseIsArray: output.kind !== "void" ? output.isArray : undefined,
				useCaseName,
				useCasePath: `../../application/use-cases/${resourceNameKebab}/${resourceNameKebab}.use-case`,
				useCasePropertyName,
			});
			await formatFile(controllerFilePath);
		}
	}

	private static shouldUseBody(resourceNameKebab: string): boolean {
		const action = this.getAction(resourceNameKebab);
		return ["add", "create", "login", "refresh", "register", "update"].includes(action);
	}

	private static getControllerRoute(moduleNameKebab: string, resourceNameKebab: string): { method: "Get" | "Post" | "Patch" | "Delete"; path?: string } {
		const route = getRouteFromAction(resourceNameKebab);
		const moduleRoute = toRoutePath(moduleNameKebab);
		if (!route.path || route.path === moduleRoute) return { method: route.method };
		if (route.path === `${moduleRoute}/:id`) return { method: route.method, path: ":id" };
		return route;
	}

	private static async ensureController(resourceDir: string, moduleFilePath: string, moduleNameKebab: string, moduleName: string): Promise<void> {
		const controllerFilePath = path.join(resourceDir, "presentation/controllers", `${moduleNameKebab}.controller.ts`);
		const controllerName = `${moduleName}Controller`;

		if (!fs.existsSync(controllerFilePath)) {
			await createFile(controllerFilePath, controllerElement(moduleName, toRoutePath(moduleNameKebab)));
		}

		updateModuleFile(moduleFilePath, [
			{
				arrayName: ["controllers"],
				content: controllerName,
				imports: { name: controllerName, path: `./presentation/controllers/${moduleNameKebab}.controller` },
			},
		]);
		await formatFile(moduleFilePath);
	}

	private static resolveOutput(moduleNameKebab: string, resourceNameKebab: string): UseCaseOutput {
		const action = this.getAction(resourceNameKebab);
		if (["delete", "logout", "remove"].includes(action)) {
			return { kind: "void" };
		}

		const isCrud = ["add", "create", "find", "get", "list", "update"].includes(action);
		const outputResourceName = isCrud ? moduleNameKebab : resourceNameKebab;
		const outputName = toPascalCase(outputResourceName);
		const isArray = action === "list" || resourceNameKebab.startsWith("find-all") || resourceNameKebab.startsWith("get-all");

		return {
			kind: isCrud ? "module" : "use-case",
			isArray,
			outputDtoFileName: `${outputResourceName}-output`,
			outputDtoName: `${outputName}OutputDto`,
			responseDtoFileName: isCrud ? `${moduleNameKebab}.response` : `${resourceNameKebab}.response`,
			responseDtoName: `${outputName}ResponseDto`,
		};
	}

	private static getAction(resourceNameKebab: string): string {
		return resourceNameKebab.split("-")[0];
	}

	private static normalizeUseCaseName(moduleNameKebab: string, resourceNameKebab: string): string {
		const normalizedCrudNames = new Map<string, string>([
			["add", `add-${moduleNameKebab}`],
			["create", `create-${moduleNameKebab}`],
			["delete", `delete-${moduleNameKebab}`],
			["find", `find-${moduleNameKebab}`],
			["find-all", `find-all-${plural(moduleNameKebab)}`],
			["find-by-id", `find-by-id-${moduleNameKebab}`],
			["find-one", `find-one-${moduleNameKebab}`],
			["get", `get-${moduleNameKebab}`],
			["get-all", `get-all-${plural(moduleNameKebab)}`],
			["get-by-id", `get-by-id-${moduleNameKebab}`],
			["get-one", `get-one-${moduleNameKebab}`],
			["list", `list-${plural(moduleNameKebab)}`],
			["remove", `remove-${moduleNameKebab}`],
			["update", `update-${moduleNameKebab}`],
		]);

		return normalizedCrudNames.get(resourceNameKebab) ?? resourceNameKebab;
	}
}

type UseCaseOutput =
	| {
			kind: "void";
	  }
	| {
			isArray: boolean;
			kind: "module" | "use-case";
			outputDtoFileName: string;
			outputDtoName: string;
			responseDtoFileName: string;
			responseDtoName: string;
	  };
