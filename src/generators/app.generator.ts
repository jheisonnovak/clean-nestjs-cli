import { existsSync, mkdirSync } from "fs";
import inquirer, { DistinctQuestion } from "inquirer";
import ora from "ora";
import * as path from "path";
import packageJson from "../../package.json";
import { appE2eSpecElement } from "../elements/app/app-e2e-spec.element";
import { appModuleElement } from "../elements/app/app-module.element";
import { editorConfigElement } from "../elements/app/editorconfig.element";
import { databaseConfigElement } from "../elements/app/database-config.element";
import { eslintElement } from "../elements/app/eslintrc.element";
import { gitIgnoreElement } from "../elements/app/gitignore.element";
import { jestE2eElement } from "../elements/app/jest-e2e.element";
import { mainElement } from "../elements/app/main.element";
import { packageElement } from "../elements/app/package.element";
import { pnpmWorkspaceElement } from "../elements/app/pnpm-workspace.element";
import { prettierrcElement } from "../elements/app/prettierrc.element";
import { prismaModuleElement } from "../elements/app/prisma-module.element";
import { prismaSchemaElement } from "../elements/app/prisma-schema.element";
import { prismaServiceElement } from "../elements/app/prisma-service.element";
import { readmeElement } from "../elements/app/readme.element";
import { tsconfigBuildElement } from "../elements/app/tsconfig-build.element";
import { tsconfigElement } from "../elements/app/tsconfig.element";
import { cleanNestConfigElement, normalizeOrm, Orm, readFormattingPreferences } from "../utils/clean-config";
import { executeCommand } from "../utils/execute-command";
import { createFile } from "../utils/file";
import { getInstallCommand } from "../utils/get-install-command";

export class AppGenerator {
	static async generate(projectNameKebab: string, options: { linters: boolean }): Promise<void> {
		const projectDir = path.join(process.cwd(), projectNameKebab);
		const projectName = path.basename(projectDir);
		const questions = this.getQuestions();
		console.clear();
		inquirer
			.prompt(questions)
			.then(async answers => {
				const { packageManager, orm } = answers;
				const normalizedOrm = normalizeOrm(orm) ?? "typeorm";
				this.createDir(projectDir);
				const formatting = readFormattingPreferences(process.cwd());
				const commands: string[] = [];
				if (normalizedOrm === "typeorm") commands.push(`${packageManager} ${getInstallCommand(packageManager)} @nestjs/typeorm typeorm sqlite3`);
				else if (normalizedOrm === "prisma") {
					commands.push(`${packageManager} ${getInstallCommand(packageManager)} prisma@6.19.3 -D`);
					commands.push(`${packageManager} ${getInstallCommand(packageManager)} @prisma/client@6.19.3`);
					commands.push(this.getPrismaCommand(packageManager, "generate"));
				}
				commands.push(`${packageManager} install`);
				const dependencies = ora("Installing dependencies...");
				const generatingFiles = ora("Generating files...");
				try {
					await executeCommand(`${packageManager} --version`, projectDir);
					await this.generateFiles(projectName, projectDir, options.linters, normalizedOrm, packageManager, formatting);
					generatingFiles.succeed("Files generated");
					if (await this.isCliPackageVersionPublished(projectDir)) {
						commands.unshift(`${packageManager} ${getInstallCommand(packageManager)} clean-nestjs-cli@${packageJson.version} -D`);
					}
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
		orm: Orm,
		packageManager: string,
		formatting = readFormattingPreferences()
	): Promise<void> {
		const tsConfigContent = tsconfigElement();
		const tsConfigBuildContent = tsconfigBuildElement();
		const packageContent = packageElement(projectName, linters);
		const appModuleContent = appModuleElement(orm);
		const mainContent = mainElement();
		const gitIgnoreContent = gitIgnoreElement();
		const readmeContent = readmeElement(packageManager);
		const appE2eSpecContent = appE2eSpecElement();
		const jestE2eContent = jestE2eElement();
		if (linters) {
			const prettierrcContent = prettierrcElement(formatting);
			const eslintrcContent = eslintElement();
			await createFile(path.join(projectDir, ".prettierrc"), prettierrcContent);
			await createFile(path.join(projectDir, "eslint.config.mjs"), eslintrcContent);
		}
		await createFile(path.join(projectDir, ".editorconfig"), editorConfigElement(formatting));
		await createFile(path.join(projectDir, "README.md"), readmeContent);
		await createFile(path.join(projectDir, "clean-nest.json"), cleanNestConfigElement(orm, formatting));
		if (packageManager === "pnpm") {
			await createFile(path.join(projectDir, "pnpm-workspace.yaml"), pnpmWorkspaceElement());
		}
		await createFile(path.join(projectDir, "tsconfig.json"), tsConfigContent);
		await createFile(path.join(projectDir, "tsconfig.build.json"), tsConfigBuildContent);
		await createFile(path.join(projectDir, "package.json"), packageContent);
		await createFile(path.join(projectDir, "src", "app.module.ts"), appModuleContent);
		await createFile(path.join(projectDir, "src", "main.ts"), mainContent);
		await createFile(path.join(projectDir, ".gitignore"), gitIgnoreContent);
		await createFile(path.join(projectDir, "test", "app.e2e-spec.ts"), appE2eSpecContent);
		await createFile(path.join(projectDir, "test", "jest-e2e.json"), jestE2eContent);
		if (orm === "typeorm") {
			const databaseConfigContent = databaseConfigElement();
			await createFile(path.join(projectDir, "src", "shared", "databases", "database.config.service.ts"), databaseConfigContent);
		} else if (orm === "prisma") {
			await createFile(path.join(projectDir, ".env"), 'DATABASE_URL="file:./dev.db"\n');
			await createFile(path.join(projectDir, "prisma", "schema.prisma"), prismaSchemaElement());
			await createFile(path.join(projectDir, "src", "shared", "databases", "prisma.service.ts"), prismaServiceElement());
			await createFile(path.join(projectDir, "src", "shared", "databases", "prisma.module.ts"), prismaModuleElement());
		}
	}

	private static getQuestions(): DistinctQuestion[] {
		const questions: DistinctQuestion[] = [
			{
				type: "select",
				name: "packageManager",
				message: "Choose your package manager",
				choices: ["npm", "yarn", "pnpm"],
				default: "npm",
			},
			{
				type: "select",
				name: "orm",
				message: "Choose your ORM",
				choices: ["typeorm", "prisma", "none"],
				default: "typeorm",
			},
		];
		return questions;
	}

	private static createDir(dir: string): void {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	}

	private static getPrismaCommand(packageManager: string, command: string): string {
		if (packageManager === "pnpm") return `pnpm exec prisma ${command}`;
		if (packageManager === "yarn") return `yarn prisma ${command}`;
		return `npx prisma ${command}`;
	}

	private static async isCliPackageVersionPublished(projectDir: string): Promise<boolean> {
		try {
			await executeCommand(`npm view clean-nestjs-cli@${packageJson.version} version`, projectDir);
			return true;
		} catch {
			return false;
		}
	}
}
