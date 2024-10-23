import * as path from "path";
import { tsconfigElement } from "../elements/tsconfig.element";
import { packageElement } from "../elements/package.element";
import { appModuleElement } from "../elements/app-module.element";
import { mainElement } from "../elements/main.element";
import { gitIgnoreElement } from "../elements/gitignore.element";
import { createFile } from "../utils/file";
import { prettierrcElement } from "../elements/prettierrc.element";
import { eslintrcElement } from "../elements/eslintrc.element";
import inquirer from "inquirer";
import ora from "ora";
import { executeCommand } from "../utils/execute-command";
import { databaseConfigElement } from "../elements/database-config.element";

export class AppGenerator {
	static async generate(projectNameKebab: string, options: { linters: boolean }): Promise<void> {
		const projectDir = path.join(process.cwd(), projectNameKebab);
		const resourceArray = projectDir.split("\\");
		const projectName = resourceArray[resourceArray.length - 1];

		inquirer
			.prompt([
				{
					type: "list",
					name: "packageManager",
					message: "Choose your package manager",
					choices: ["npm", "yarn"],
					default: "npm",
				},
				{
					type: "list",
					name: "orm",
					message: "Choose your ORM",
					choices: ["TypeORM", "None"],
					default: "TypeORM",
				},
			])
			.then(async answers => {
				const { packageManager, orm } = answers;
				this.generateFiles(projectName, projectDir, options.linters, orm);
				const commands: string[] = [];
				commands.push(`${packageManager} install`);
				if (orm === "TypeORM") {
					commands.push(`${packageManager} install @nestjs/typeorm typeorm @nestjs/config`);
				}

				const spinner = ora("Installing dependencies...").start();
				try {
					for (const command of commands) {
						await executeCommand(command, projectDir);
					}
					spinner.succeed("Dependencies installed");
				} catch {
					spinner.fail("Error installing dependencies");
				}
			});
	}

	private static generateFiles(projectName: string, projectDir: string, linters: boolean, orm: string) {
		const tsConfigContent = tsconfigElement();
		const packageContent = packageElement(projectName, true);
		const appModuleContent = appModuleElement();
		const mainContent = mainElement();
		const gitIgnoreContent = gitIgnoreElement();
		if (linters) {
			const prettierrcContent = prettierrcElement();
			const eslintrcContent = eslintrcElement();
			createFile(path.join(projectDir, ".prettierrc"), prettierrcContent);
			createFile(path.join(projectDir, ".eslintrc.js"), eslintrcContent);
		}
		if (orm === "TypeORM") {
			const databaseConfigContent = databaseConfigElement();
			createFile(path.join(projectDir, "src", "shared", "config", "database.config.service.ts"), databaseConfigContent);
		}

		createFile(path.join(projectDir, "tsconfig.json"), tsConfigContent);
		createFile(path.join(projectDir, "package.json"), packageContent);
		createFile(path.join(projectDir, "src", "app.module.ts"), appModuleContent);
		createFile(path.join(projectDir, "src", "main.ts"), mainContent);
		createFile(path.join(projectDir, ".gitignore"), gitIgnoreContent);
	}
}
