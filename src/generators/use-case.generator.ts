import * as fs from "fs";
import * as path from "path";
import { IGenerator } from "./generate.generator";
import { addToArray, capitalize, createFile, decapitalize, kebabToCamel, startsInBasePath } from "../utils/file";
import { useCaseElement } from "../elements/use-case.element";
import { controllerElement } from "../elements/controller.element";
import { specElement } from "../elements/spec.element";
import { ModuleGenerator } from "./module.generator";
import { createModulePath } from "../utils/create-module-path";
import { updateModuleFile } from "../utils/update-module-file";

export class UseCaseGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, resourcePath: string = "", resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the use case name.");
			process.exit(1);
		}
		const modulePath = createModulePath(resourcePath, moduleNameKebab);
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

		const controllerName = `${capitalizedUseCaseName}Controller`;
		const useCaseName = `${capitalizedUseCaseName}UseCase`;
		const controllerPath = "./" + path.posix.join("use-cases", resourceNameKebab, `${resourceNameKebab}.controller`);
		const useCasePath = "./" + path.posix.join("use-cases", resourceNameKebab, `${resourceNameKebab}.use-case`);

		updateModuleFile(moduleFilePath, {
			arrayName: ["controllers"],
			content: controllerName,
			imports: [{ name: controllerName, path: controllerPath }],
		});
		updateModuleFile(moduleFilePath, {
			arrayName: ["providers", "exports"],
			content: useCaseName,
			imports: [{ name: useCaseName, path: useCasePath }],
		});
	}
}
