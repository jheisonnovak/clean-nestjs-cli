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
import { DistinctQuestion } from "inquirer/dist/commonjs/types";

export class AppGenerator {
	static async generate(projectNameKebab: string, options: { linters: boolean }): Promise<void> {
		const projectDir = path.join(process.cwd(), projectNameKebab);
		const resourceArray = projectDir.split("\\");
		const projectName = resourceArray[resourceArray.length - 1];
		const questions = this.getQuestions();
		console.clear();
		inquirer
			.prompt(questions)
			.then(async answers => {
				const { packageManager, orm } = answers;
				const commands: string[] = [];
				commands.push(`${packageManager} install`);
				if (orm === "TypeORM") {
					commands.push(`${packageManager} install @nestjs/typeorm typeorm @nestjs/config`);
				}
				const dependencies = ora("Installing dependencies...");
				const generatingFiles = ora("Generating files...");
				try {
					await executeCommand(`${packageManager} --version`, projectDir);
					generatingFiles.start();
					await this.generateFiles(projectName, projectDir, options.linters, orm);
					generatingFiles.succeed("Files generated");
					dependencies.start();
					for (const command of commands) {
						await executeCommand(command, projectDir);
					}
					dependencies.succeed("Dependencies installed");
				} catch {
					dependencies.fail("Error installing dependencies, check your package manager");
				}
			})
			.catch(() => console.log("Console has been closed"));
	}

	private static async generateFiles(projectName: string, projectDir: string, linters: boolean, orm: string) {
		const tsConfigContent = tsconfigElement();
		const packageContent = packageElement(projectName, linters);
		const appModuleContent = appModuleElement();
		const mainContent = mainElement();
		const gitIgnoreContent = gitIgnoreElement();
		if (linters) {
			const prettierrcContent = prettierrcElement();
			const eslintrcContent = eslintrcElement();
			await createFile(path.join(projectDir, ".prettierrc"), prettierrcContent);
			await createFile(path.join(projectDir, ".eslintrc.js"), eslintrcContent);
		}
		await createFile(path.join(projectDir, "tsconfig.json"), tsConfigContent);
		await createFile(path.join(projectDir, "package.json"), packageContent);
		await createFile(path.join(projectDir, "src", "app.module.ts"), appModuleContent);
		await createFile(path.join(projectDir, "src", "main.ts"), mainContent);
		await createFile(path.join(projectDir, ".gitignore"), gitIgnoreContent);
		if (orm === "TypeORM") {
			const databaseConfigContent = databaseConfigElement();
			await createFile(path.join(projectDir, "src", "shared", "config", "database.config.service.ts"), databaseConfigContent);
		}
	}

	private static getQuestions() {
		const questions: DistinctQuestion[] = [
			{
				type: "list",
				name: "packageManager",
				message: "Choose your package manager",
				choices: ["npm", "yarn", "pnpm"],
				default: "npm",
			},
			{
				type: "list",
				name: "orm",
				message: "Choose your ORM",
				choices: ["TypeORM", "None"],
				default: "TypeORM",
			},
		];
		return questions;
	}
}
