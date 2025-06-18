import chalk from "chalk";
import { existsSync, writeFileSync } from "fs";
import path from "path";
import { Project } from "ts-morph";
import { addToModuleArray } from "./file";

export function updateModuleFile(moduleFilePath: string, filesModuleUpdate: IFileModuleUpdate[]): void {
	const relativePath = path.relative(process.cwd(), moduleFilePath);
	if (!existsSync(moduleFilePath)) {
		console.warn(`${chalk.red("NOT FOUND")} ${relativePath}`);
		process.exit(1);
	}
	const project = new Project();
	let sourceFile = project.addSourceFileAtPath(moduleFilePath);

	filesModuleUpdate.forEach(fileModuleUpdate => {
		if (fileModuleUpdate.imports) {
			const existingImport = sourceFile.getImportDeclarations().find(decl => decl.getModuleSpecifierValue() === fileModuleUpdate.imports?.name);
			if (existingImport) {
				const namedImports = existingImport.getNamedImports();
				if (!namedImports.some(ni => ni.getName() === fileModuleUpdate.imports?.name)) {
					existingImport.addNamedImport(fileModuleUpdate.imports?.name);
				}
			} else {
				sourceFile.addImportDeclaration({
					namedImports: [fileModuleUpdate.imports?.name],
					moduleSpecifier: fileModuleUpdate.imports?.path,
				});
			}
		}

		fileModuleUpdate.arrayName.forEach(arrayName => {
			sourceFile = addToModuleArray(sourceFile, arrayName, fileModuleUpdate.content);
		});
	});
	writeFileSync(moduleFilePath, sourceFile.getFullText(), "utf8");
	console.log(`${chalk.yellow("UPDATE")} ${relativePath}`);
}

export interface IFileModuleUpdate {
	content: string;
	arrayName: Array<"imports" | "controllers" | "providers" | "exports">;
	imports?: {
		name: string;
		path: string;
	};
}
