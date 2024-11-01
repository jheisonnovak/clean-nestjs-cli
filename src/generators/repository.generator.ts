import * as fs from "fs";
import * as path from "path";
import { IGenerator } from "./generate.generator";
import { capitalize, createFile, kebabToCamel, startsInBasePath } from "../utils/file";
import { createModulePath } from "../utils/create-module-path";
import { repositoryInterfaceElement } from "../elements/repository-interface.element";
import { repositoryElement } from "../elements/repository.element";
import { ModuleGenerator } from "./module.generator";
import { updateModuleFile } from "../utils/update-module-file";

export class RepositoryGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, resourcePath: string = "", resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the repository name.");
			process.exit(1);
		}
		const modulePath = createModulePath(resourcePath, moduleNameKebab);
		const repositoryNameCamel = kebabToCamel(resourceNameKebab);
		const repositoryName = capitalize(repositoryNameCamel);
		const basePath = path.join(process.cwd(), "./src/modules/");
		const resourceDir = path.join(basePath, modulePath);
		startsInBasePath(basePath, resourceDir);

		const repositoryInterfaceContent = repositoryInterfaceElement(repositoryName);

		const repositoryContent = repositoryElement(repositoryName, resourceNameKebab);

		const moduleFilePath = path.join(process.cwd(), "./src/modules", modulePath, `${moduleNameKebab}.module.ts`);
		if (!fs.existsSync(moduleFilePath)) {
			ModuleGenerator.generate(moduleNameKebab, resourcePath);
		}

		await createFile(path.join(resourceDir, "repositories", `${resourceNameKebab}.repository.ts`), repositoryContent);
		await createFile(path.join(resourceDir, "models/interfaces", `${resourceNameKebab}-repository.interface.ts`), repositoryInterfaceContent);

		const repository = `${repositoryName}TypeOrmRepository`;
		const repositoryInterface = `"I${repositoryName}Repository"`;
		const repositoryProvider = `{
		    provide: ${repositoryInterface},
		    useExisting: ${repository}
		}`;
		const repositoryPath = `./repositories/${resourceNameKebab}.repository`;

		updateModuleFile(moduleFilePath, {
			arrayName: ["providers"],
			content: repositoryProvider,
			imports: [{ name: repository, path: repositoryPath }],
		});
		updateModuleFile(moduleFilePath, {
			arrayName: ["exports"],
			content: repositoryInterface,
			imports: [],
		});
	}
}
