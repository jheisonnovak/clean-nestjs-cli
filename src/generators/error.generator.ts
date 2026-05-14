import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { applicationErrorElement } from "../elements/application/error.element";
import { domainErrorElement } from "../elements/domain/error.element";
import { createModulePath } from "../utils/create-module-path";
import { createFile, startsInBasePath } from "../utils/file";
import { toPascalCase } from "../utils/naming";
import { IGenerator, IGeneratorOptions } from "./generate.generator";
import { ModuleGenerator } from "./module.generator";

type ErrorLayer = "domain" | "application";

export class ErrorGenerator extends IGenerator {
	static override async generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string): Promise<void> {
		if (!resourceNameKebab) {
			console.error("Please provide the error name.");
			process.exit(1);
			return;
		}
		const errorNameKebab = resourceNameKebab;

		const modulePath = createModulePath(options.path, moduleNameKebab);
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
						await this.generateError(modulePath, errorNameKebab, this.resolveLayer(options.layer));
					} else {
						console.error(`${chalk.red(`Module "${moduleNameKebab}" not found.`)}`);
						process.exit(1);
					}
				})
				.catch(() => console.log("Console has been closed"));
			return;
		}

		await this.generateError(modulePath, errorNameKebab, this.resolveLayer(options.layer));
	}

	private static async generateError(modulePath: string, resourceNameKebab: string, layer: ErrorLayer): Promise<void> {
		const basePath = path.join(process.cwd(), "./src/modules/");
		const resourceDir = path.join(basePath, modulePath);
		startsInBasePath(basePath, resourceDir);

		const errorName = `${toPascalCase(resourceNameKebab)}Error`;
		const template = layer === "domain" ? domainErrorElement(errorName) : applicationErrorElement(errorName);
		await createFile(path.join(resourceDir, layer, "errors", `${resourceNameKebab}.error.ts`), template);
	}

	private static resolveLayer(layer?: string): ErrorLayer {
		return layer === "application" ? "application" : "domain";
	}
}
