import * as fs from "fs";
import * as path from "path";
import { moduleElement } from "../elements/module.element";
import { repositoryInterfaceElement } from "../elements/repository-interface.element";
import { repositoryElement } from "../elements/repository.element";
import { createModulePath } from "../utils/create-module-path";
import { capitalize, createFile, formatFile, kebabToCamel, startsInBasePath } from "../utils/file";
import { updateModuleFile } from "../utils/update-module-file";
import { IGenerator, IGeneratorOptions } from "./generate.generator";

export class ModuleGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions) {
		const resourceNameCamel = kebabToCamel(moduleNameKebab);
		const moduleName = capitalize(resourceNameCamel);
		const resourcePath = options.path;
		const modulePath = createModulePath(resourcePath, moduleNameKebab);
		const basePath = path.join(process.cwd(), "./src/modules/");
		const resourceDir = path.join(basePath, modulePath);
		startsInBasePath(basePath, resourceDir);

		const moduleContent = moduleElement(moduleName, moduleNameKebab);
		const repositoryInterfaceContent = repositoryInterfaceElement(moduleName);
		const repositoryContent = repositoryElement(moduleName, moduleNameKebab);

		await createFile(path.join(resourceDir, `${moduleNameKebab}.module.ts`), moduleContent);
		await createFile(path.join(resourceDir, "repositories", `${moduleNameKebab}.repository.ts`), repositoryContent);
		await createFile(path.join(resourceDir, "models/interfaces", `${moduleNameKebab}-repository.interface.ts`), repositoryInterfaceContent);

		const modelDirs = ["dtos", "entities", "enums", "interfaces"];
		modelDirs.forEach(dir => {
			fs.mkdirSync(path.join(resourceDir, "models", dir), { recursive: true });
		});

		fs.mkdirSync(path.join(resourceDir, "use-cases"), { recursive: true });

		const appModuleFilePath = path.posix.join(process.cwd(), "src", "app.module.ts");
		const moduleClassName = `${moduleName}Module`;
		const moduleClassPath = "./" + path.posix.join("modules", modulePath, `${moduleNameKebab}.module`);
		updateModuleFile(appModuleFilePath, [
			{
				arrayName: ["imports"],
				content: moduleClassName,
				imports: { name: moduleClassName, path: moduleClassPath },
			},
		]);
		await formatFile(appModuleFilePath);
	}
}
