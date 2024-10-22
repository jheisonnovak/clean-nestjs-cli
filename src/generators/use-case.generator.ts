import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { IGenerator } from "./generate.generator";
import { capitalize, createFile, decapitalize, kebabToCamel } from "../utils/file";
import { useCaseElement } from "../elements/use-case.element";
import { controllerElement } from "../elements/controller.element";
import { specElement } from "../elements/spec.element";
import { ModuleGenerator } from "./module.generator";

export class UseCaseGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, modulePath: string = "", resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the use case name.");
			process.exit(1);
		}

		const controllerRoute = (!!modulePath ? `${modulePath}${modulePath.endsWith("/") ? "" : "/"}` : "") + moduleNameKebab;
		const moduleNameCamel = kebabToCamel(moduleNameKebab);
		const useCaseNameCamel = kebabToCamel(resourceNameKebab);
		const capitalizedModuleName = capitalize(moduleNameCamel);
		const capitalizedUseCaseName = capitalize(useCaseNameCamel) + capitalizedModuleName;
		const decapitalizedUseCaseName = decapitalize(useCaseNameCamel);

		const useCaseDir = path.join(__dirname, "../src/modules", modulePath, "use-cases", resourceNameKebab);

		const useCaseContent = useCaseElement(capitalizedUseCaseName);
		const controllerContent = controllerElement(capitalizedUseCaseName, resourceNameKebab, controllerRoute, decapitalizedUseCaseName);
		const specContent = specElement(
			capitalizedUseCaseName,
			moduleNameKebab,
			moduleNameCamel,
			decapitalizedUseCaseName,
			capitalizedModuleName,
			resourceNameKebab
		);

		const moduleFilePath = path.join(__dirname, "../src/modules", modulePath, `${moduleNameKebab}.module.ts`);
		if (!fs.existsSync(moduleFilePath)) {
			ModuleGenerator.generate(moduleNameKebab, modulePath);
		}

		createFile(path.join(useCaseDir, `${resourceNameKebab}.use-case.ts`), useCaseContent);
		createFile(path.join(useCaseDir, `${resourceNameKebab}.controller.ts`), controllerContent);
		createFile(path.join(useCaseDir, `${resourceNameKebab}.spec.ts`), specContent);

		this.updateModuleFile(
			moduleFilePath,
			`${capitalizedUseCaseName}Controller`,
			`${capitalizedUseCaseName}UseCase`,
			`use-cases/${resourceNameKebab}/${resourceNameKebab}.controller`,
			`use-cases/${resourceNameKebab}/${resourceNameKebab}.use-case`
		);

		console.log(`${capitalizedUseCaseName} use-case generated successfully in module ${capitalizedModuleName}.`);
	}

	private static updateModuleFile(
		moduleFilePath: string,
		controllerName: string,
		useCaseName: string,
		controllerPath: string,
		useCasePath: string
	) {
		if (!fs.existsSync(moduleFilePath)) {
			console.error(`Module file ${moduleFilePath} not found.`);
			return;
		}

		let moduleFileContent = fs.readFileSync(moduleFilePath, "utf8");

		const importStatements = `
import { ${controllerName} } from "./${controllerPath}";
import { ${useCaseName} } from "./${useCasePath}";`;

		if (!moduleFileContent.includes(importStatements.trim())) {
			moduleFileContent = moduleFileContent.replace(/(import {.* from .*;)/, `$1${importStatements}`);
		}

		this.addToArray("controllers", controllerName, moduleFileContent);
		this.addToArray("providers", useCaseName, moduleFileContent);
		this.addToArray("exports", useCaseName, moduleFileContent);

		fs.writeFileSync(moduleFilePath, moduleFileContent, "utf8");
	}

	private static addToArray(arrayName: string, itemName: string, moduleFileContent: string) {
		const regex = new RegExp(`(${arrayName}: \\[[^\\]]*)\\]`);
		const match = moduleFileContent.match(regex);
		if (match) {
			let arrayContent = match[1].trimEnd();
			if (!arrayContent.includes(itemName)) {
				const items = arrayContent.split(",").map(item => item.trim());
				const isInline = items.every(item => !item.includes("\n"));
				const indentMatch = moduleFileContent.match(new RegExp(`(\\s*)${arrayName}:`));
				const indent = indentMatch ? indentMatch[1] + "    " : "        ";

				if (isInline) {
					arrayContent = arrayContent.endsWith(",")
						? `${arrayContent} ${itemName}`
						: arrayContent.endsWith("[")
						? `${arrayContent}${itemName}`
						: `${arrayContent}, ${itemName}`;
					moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}]`);
				} else {
					arrayContent = arrayContent.endsWith(",") ? `${arrayContent}${indent}${itemName},` : `${arrayContent},${indent}${itemName},`;
					moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}${indent.slice(0, -4)}]`);
				}
			}
		} else {
			moduleFileContent = moduleFileContent.replace(/(@Module\(\{)/, `$1\n    ${arrayName}: [${itemName}],`);
		}
	}
}
