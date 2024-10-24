import * as fs from "fs";
import * as path from "path";
import { IGenerator } from "./generate.generator";
import { addToArray, capitalize, createFile, decapitalize, kebabToCamel } from "../utils/file";
import { useCaseElement } from "../elements/use-case.element";
import { controllerElement } from "../elements/controller.element";
import { specElement } from "../elements/spec.element";
import { ModuleGenerator } from "./module.generator";
import { createModulePath } from "../utils/create-module-path";

export class UseCaseGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, resourcePath: string = "", resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the use case name.");
			process.exit(1);
		}
		const modulePath = createModulePath(resourcePath, moduleNameKebab);

		const moduleNameCamel = kebabToCamel(moduleNameKebab);
		const useCaseNameCamel = kebabToCamel(resourceNameKebab);
		const capitalizedModuleName = capitalize(moduleNameCamel);
		const capitalizedUseCaseName = capitalize(useCaseNameCamel) + capitalizedModuleName;
		const decapitalizedUseCaseName = decapitalize(useCaseNameCamel);

		const useCaseDir = path.join(process.cwd(), "./src/modules", modulePath, "use-cases", resourceNameKebab);

		const useCaseContent = useCaseElement(capitalizedUseCaseName);
		const controllerContent = controllerElement(capitalizedUseCaseName, resourceNameKebab, modulePath, decapitalizedUseCaseName);
		const specContent = specElement(
			capitalizedUseCaseName,
			moduleNameKebab,
			moduleNameCamel,
			decapitalizedUseCaseName,
			capitalizedModuleName,
			resourceNameKebab
		);

		const moduleFilePath = path.join(process.cwd(), "./src/modules", modulePath, `${moduleNameKebab}.module.ts`);
		if (!fs.existsSync(moduleFilePath)) {
			ModuleGenerator.generate(moduleNameKebab, resourcePath);
		}

		await createFile(path.join(useCaseDir, `${resourceNameKebab}.use-case.ts`), useCaseContent);
		await createFile(path.join(useCaseDir, `${resourceNameKebab}.controller.ts`), controllerContent);
		await createFile(path.join(useCaseDir, `${resourceNameKebab}.spec.ts`), specContent);

		this.updateModuleFile(
			moduleFilePath,
			`${capitalizedUseCaseName}Controller`,
			`${capitalizedUseCaseName}UseCase`,
			`use-cases/${resourceNameKebab}/${resourceNameKebab}.controller`,
			`use-cases/${resourceNameKebab}/${resourceNameKebab}.use-case`
		);
	}

	private static updateModuleFile(
		moduleFilePath: string,
		controllerName: string,
		useCaseName: string,
		controllerPath: string,
		useCasePath: string
	) {
		if (!fs.existsSync(moduleFilePath)) {
			console.warn(`Module file ${moduleFilePath} not found. Skipping import.`);
			process.exit(1);
		}

		let moduleFileContent = fs.readFileSync(moduleFilePath, "utf8");

		const importStatements = `
import { ${controllerName} } from "./${controllerPath}";
import { ${useCaseName} } from "./${useCasePath}";`;

		if (!moduleFileContent.includes(importStatements.trim())) {
			moduleFileContent = moduleFileContent.replace(/(import {.* from .*;)/, `$1${importStatements}`);
		}

		moduleFileContent = addToArray("controllers", controllerName, moduleFileContent);
		moduleFileContent = addToArray("providers", useCaseName, moduleFileContent);
		moduleFileContent = addToArray("exports", useCaseName, moduleFileContent);

		fs.writeFileSync(moduleFilePath, moduleFileContent, "utf8");
	}
}
