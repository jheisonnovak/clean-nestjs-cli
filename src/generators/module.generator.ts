import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { capitalize, createFile, kebabToCamel } from "../utils/file";
import { moduleElement } from "../elements/module.element";
import { repositoryInterfaceElement } from "../elements/repository-interface.element";
import { repositoryElement } from "../elements/repository.element";
import { IGenerator } from "./generate.generator";

export class ModuleGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, modulePath: string = "") {
		const resourceNameCamel = kebabToCamel(moduleNameKebab);
		const moduleName = capitalize(resourceNameCamel);
		const resourceDir = path.join(__dirname, "../src/modules/", modulePath);

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
