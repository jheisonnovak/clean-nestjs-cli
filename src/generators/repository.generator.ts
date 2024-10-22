import * as fs from "fs";
import * as path from "path";
import { IGenerator } from "./generate.generator";

export class RepositoryGenerator extends IGenerator {
	static override async generate(resourceNameKebab: string, resourcePath: string = "", useCaseNameKebab?: string): Promise<void> {
		console.log("oi2");
	}
}

// const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// const kebabToCamel = (str: string) => {
// 	return str.replace(/-./g, match => match[1].toUpperCase());
// };

// const createFile = (filePath: string, content: string) => {
// 	const dir = path.dirname(filePath);
// 	if (!fs.existsSync(dir)) {
// 		fs.mkdirSync(dir, { recursive: true });
// 	}
// 	fs.writeFileSync(filePath, content, "utf8");
// };

// let items = process.argv[2].split("/");
// const moduleNameKebab = items[items.length - 1];
// const modulePath = process.argv[2];
// const repositoryNameKebab = process.argv[3];

// if (!moduleNameKebab || !repositoryNameKebab) {
// 	console.error("Please provide the module and repository name.");
// 	process.exit(1);
// }

// const moduleNameCamel = kebabToCamel(moduleNameKebab);
// const repositoryNameCamel = kebabToCamel(repositoryNameKebab);
// const moduleName = capitalize(moduleNameCamel);
// const repositoryName = capitalize(repositoryNameCamel);
// const resourceDir = path.join(__dirname, "../src/modules", modulePath);

// const repositoryInterfaceContent = `export interface I${repositoryName}Repository {
//     // Defines the methods that the repository must implement
// }
// `;

// const repositoryContent = `import { Injectable } from "@nestjs/common";
// import { I${repositoryName}Repository } from "../models/interfaces/${repositoryNameKebab}-repository.interface";

// @Injectable()
// export class ${repositoryName}TypeOrmRepository implements I${repositoryName}Repository {
//     // Implements the methods defined in the interface
// }
// `;

// createFile(path.join(resourceDir, "repositories", `${repositoryNameKebab}.repository.ts`), repositoryContent);
// createFile(path.join(resourceDir, "models/interfaces", `${repositoryNameKebab}-repository.interface.ts`), repositoryInterfaceContent);

// console.log(`${repositoryName} repository and interface generated successfully in module ${moduleName}.`);

// const updateModuleFile = (moduleFilePath: string, repositoryName: string, repositoryPath: string) => {
// 	if (!fs.existsSync(moduleFilePath)) {
// 		console.warn(`Module file ${moduleFilePath} not found. Skipping import.`);
// 		return;
// 	}

// 	let moduleFileContent = fs.readFileSync(moduleFilePath, "utf8");

// 	const importStatement = `
// import { ${repositoryName}TypeOrmRepository } from "./${repositoryPath}";`;

// 	if (!moduleFileContent.includes(importStatement.trim())) {
// 		moduleFileContent = moduleFileContent.replace(/(import {.* from .*;)/, `$1${importStatement}`);
// 	}

// 	const addToArray = (arrayName: string, itemName: string) => {
// 		const regex = new RegExp(`(${arrayName}: \\[[^\\]]*)\\]`);
// 		const match = moduleFileContent.match(regex);
// 		if (match) {
// 			let arrayContent = match[1].trimEnd();
// 			if (!arrayContent.includes(itemName)) {
// 				const items = arrayContent.split(",").map(item => item.trim());
// 				const isInline = items.every(item => !item.includes("\n"));
// 				const indentMatch = moduleFileContent.match(new RegExp(`(\\s*)${arrayName}:`));
// 				const indent = indentMatch ? indentMatch[1] + "    " : "        ";

// 				if (isInline) {
// 					arrayContent = arrayContent.endsWith(",")
// 						? `${arrayContent} ${itemName}`
// 						: arrayContent.endsWith("[")
// 						? `${arrayContent}${itemName}`
// 						: `${arrayContent}, ${itemName}`;
// 					moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}]`);
// 				} else {
// 					arrayContent = arrayContent.endsWith(",") ? `${arrayContent}${indent}${itemName}` : `${arrayContent},${indent}${itemName}`;
// 					moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}${indent.slice(0, -4)}]`);
// 				}
// 			}
// 		} else {
// 			moduleFileContent = moduleFileContent.replace(/(@Module\(\{)/, `$1\n    ${arrayName}: [${itemName}],`);
// 		}
// 	};

// 	addToArray("providers", `${repositoryName}TypeOrmRepository`);
// 	addToArray(
// 		"providers",
// 		`{
//             provide: "I${repositoryName}Repository",
//             useExisting: ${repositoryName}TypeOrmRepository
//         }`
// 	);
// 	addToArray("exports", `"I${repositoryName}Repository"`);

// 	fs.writeFileSync(moduleFilePath, moduleFileContent, "utf8");
// };

// updateModuleFile(path.join(resourceDir, `${moduleNameKebab}.module.ts`), repositoryName, `repositories/${repositoryNameKebab}.repository`);
