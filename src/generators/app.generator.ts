import * as path from "path";
import { tsconfigElement } from "../elements/tsconfig.element";
import { packageElement } from "../elements/package.element";
import { appModuleElement } from "../elements/app-module.element";
import { mainElement } from "../elements/main.element";
import { gitIgnoreElement } from "../elements/gitignore.element";
import { createFile } from "../utils/file";
import { exec } from "child_process";

export class AppGenerator {
	static async generate(projectNameKebab: string, options: {}): Promise<void> {
		const projectDir = path.join(process.cwd(), projectNameKebab);
		const resourceArray = projectDir.split("\\");
		const projectName = resourceArray[resourceArray.length - 1];
		this.generateFiles(projectName, projectDir);

		new Promise((resolve, reject) => {
			exec("npm install --save", { cwd: projectDir }, (err, stdout, stderr) => {
				if (err) {
					reject(err);
				}
				if (stderr) {
					reject(stderr);
				}
				resolve(stdout);
			});
		});
	}

	private static generateFiles(projectName: string, projectDir: string) {
		const tsConfigContent = tsconfigElement();
		const packageContent = packageElement(projectName);
		const appModuleContent = appModuleElement();
		const mainContent = mainElement();
		const gitIgnoreContent = gitIgnoreElement();

		createFile(path.join(projectDir, "tsconfig.json"), tsConfigContent);
		createFile(path.join(projectDir, "package.json"), packageContent);
		createFile(path.join(projectDir, "src", "app.module.ts"), appModuleContent);
		createFile(path.join(projectDir, "src", "main.ts"), mainContent);
		createFile(path.join(projectDir, ".gitignore"), gitIgnoreContent);
	}
}
