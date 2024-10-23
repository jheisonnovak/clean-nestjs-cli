import * as fs from "fs";
import * as path from "path";
import { capitalize, createFile, kebabToCamel } from "../utils/file";
import { moduleElement } from "../elements/module.element";
import { repositoryInterfaceElement } from "../elements/repository-interface.element";
import { repositoryElement } from "../elements/repository.element";
import { IGenerator } from "./generate.generator";
import { createModulePath } from "../utils/create-module-path";

export class ModuleGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, resourcePath: string = "") {
		const resourceNameCamel = kebabToCamel(moduleNameKebab);
		const moduleName = capitalize(resourceNameCamel);
		const modulePath = createModulePath(resourcePath, moduleNameKebab);
		const resourceDir = path.join(process.cwd(), "./src/modules/", modulePath);

		const moduleContent = moduleElement(moduleName, moduleNameKebab);
		const repositoryInterfaceContent = repositoryInterfaceElement(moduleName);
		const repositoryContent = repositoryElement(moduleName, moduleNameKebab);

		createFile(path.join(resourceDir, `${moduleNameKebab}.module.ts`), moduleContent);
		createFile(path.join(resourceDir, "repositories", `${moduleNameKebab}.repository.ts`), repositoryContent);
		createFile(path.join(resourceDir, "models/interfaces", `${moduleNameKebab}-repository.interface.ts`), repositoryInterfaceContent);

		const modelDirs = ["dtos", "entities", "enums", "interfaces"];
		modelDirs.forEach(dir => {
			fs.mkdirSync(path.join(resourceDir, "models", dir), { recursive: true });
		});

		fs.mkdirSync(path.join(resourceDir, "use-cases"), { recursive: true });
	}
}
