import chalk from "chalk";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { addToArray } from "./file";

export function updateModuleFile(moduleFilePath: string, fileModuleUpdate: IFileModuleUpdate) {
	if (!existsSync(moduleFilePath)) {
		const relativePath = path.relative(process.cwd(), moduleFilePath);
		console.warn(`${chalk.red("NOT FOUND")} ${relativePath}`);
		process.exit(1);
	}
	let moduleFileContent = readFileSync(moduleFilePath, "utf8");
	const importStatements = createImport(fileModuleUpdate.imports);

	if (!moduleFileContent.includes(importStatements.trim())) {
		moduleFileContent = moduleFileContent.replace(/(import {.* from .*;)/, `$1${importStatements}`);
	}
	fileModuleUpdate.arrayName.forEach(arrayName => {
		moduleFileContent = addToArray(arrayName, fileModuleUpdate.content, moduleFileContent);
	});

	writeFileSync(moduleFilePath, moduleFileContent, "utf8");
}

function createImport(imports: Array<{ name: string; path: string }>) {
	return imports
		.map(
			({ name, path }) => `
import { ${name} } from "${path}";`
		)
		.join("");
}

export interface IFileModuleUpdate {
	content: string;
	imports: Array<{
		name: string;
		path: string;
	}>;
	arrayName: Array<"imports" | "controllers" | "providers" | "exports">;
}
