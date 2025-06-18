import { existsSync, mkdirSync } from "fs";
import inquirer from "inquirer";
import { DistinctQuestion } from "inquirer/dist/commonjs/types";
import ora from "ora";
import * as path from "path";
import { appE2eSpecElement } from "../elements/app-e2e-spec.element";
import { appModuleElement } from "../elements/app-module.element";
import { databaseConfigElement } from "../elements/database-config.element";
import { eslintElement } from "../elements/eslintrc.element";
import { gitIgnoreElement } from "../elements/gitignore.element";
import { jestE2eElement } from "../elements/jest-e2e.element";
import { mainElement } from "../elements/main.element";
import { packageElement } from "../elements/package.element";
import { prettierrcElement } from "../elements/prettierrc.element";
import { readmeElement } from "../elements/readme.element";
import { tsconfigBuildElement } from "../elements/tsconfig-build.element";
import { tsconfigElement } from "../elements/tsconfig.element";
import { executeCommand } from "../utils/execute-command";
import { createFile } from "../utils/file";

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
				this.createDir(projectDir);
				const commands: string[] = [];
				commands.push(
					`${packageManager} ${packageManager === "npm" ? "install" : "add"} clean-nestjs-cli ${
						packageManager === "yarn" ? "--dev" : "--save-dev"
					}`
				);
				if (orm === "TypeORM") {
					commands.push(`${packageManager} ${packageManager === "npm" ? "install" : "add"} @nestjs/typeorm typeorm @nestjs/config`);
				}
				commands.push(`${packageManager} install`);
				const dependencies = ora("Installing dependencies...");
				const generatingFiles = ora("Generating files...");
				try {
					await executeCommand(`${packageManager} --version`, projectDir);
					await this.generateFiles(projectName, projectDir, options.linters, orm, packageManager);
					generatingFiles.succeed("Files generated");
					dependencies.start();
					for (const command of commands) {
						await executeCommand(command, projectDir);
					}
					dependencies.succeed("Dependencies installed");
				} catch (e) {
					dependencies.fail("Error installing dependencies. " + e);
				}
			})
			.catch(() => console.log("Console has been closed"));
	}

	private static async generateFiles(
		projectName: string,
		projectDir: string,
		linters: boolean,
		orm: string,
		packageManager: string
	): Promise<void> {
		const tsConfigContent = tsconfigElement();
		const tsConfigBuildContent = tsconfigBuildElement();
		const packageContent = packageElement(projectName, linters);
		const appModuleContent = appModuleElement();
		const mainContent = mainElement();
		const gitIgnoreContent = gitIgnoreElement();
		const readmeContent = readmeElement(packageManager);
		const appE2eSpecContent = appE2eSpecElement();
		const jestE2eContent = jestE2eElement();
		if (linters) {
			const prettierrcContent = prettierrcElement();
			const eslintrcContent = eslintElement();
			await createFile(path.join(projectDir, ".prettierrc"), prettierrcContent);
			await createFile(path.join(projectDir, "eslint.config.mjs"), eslintrcContent);
		}
		await createFile(path.join(projectDir, "README.md"), readmeContent);
		await createFile(path.join(projectDir, "tsconfig.json"), tsConfigContent);
		await createFile(path.join(projectDir, "tsconfig.build.json"), tsConfigBuildContent);
		await createFile(path.join(projectDir, "package.json"), packageContent);
		await createFile(path.join(projectDir, "src", "app.module.ts"), appModuleContent);
		await createFile(path.join(projectDir, "src", "main.ts"), mainContent);
		await createFile(path.join(projectDir, ".gitignore"), gitIgnoreContent);
		await createFile(path.join(projectDir, "test", "app.e2e-spec.ts"), appE2eSpecContent);
		await createFile(path.join(projectDir, "test", "jest-e2e.json"), jestE2eContent);
		if (orm === "TypeORM") {
			const databaseConfigContent = databaseConfigElement();
			await createFile(path.join(projectDir, "src", "shared", "databases", "database.config.service.ts"), databaseConfigContent);
		}
	}

	private static getQuestions(): DistinctQuestion[] {
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

	private static createDir(dir: string): void {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	}
}
