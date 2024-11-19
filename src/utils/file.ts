import chalk from "chalk";
import { existsSync, promises as fs, mkdirSync } from "fs";
import path, { join } from "path";
import { executeCommand } from "./execute-command";

export const createFile = async (filePath: string, content: string) => {
	const relativePath = path.relative(process.cwd(), filePath);
	if (existsSync(filePath)) {
		console.warn(`${chalk.yellow("ALREADY EXISTS")} ${relativePath}`);
		return;
	}
	const dir = path.dirname(filePath);
	try {
		await fs.access(dir);
	} catch {
		await fs.mkdir(dir, { recursive: true });
	}
	try {
		await fs.writeFile(filePath, content, "utf8");
		console.log(`${chalk.green("CREATE")} ${relativePath}`);
	} catch (error) {
		throw error;
	}
};

export const createDirectory = (dirPath: string) => {
	if (!existsSync(dirPath)) {
		mkdirSync(dirPath, { recursive: true });
	}
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const decapitalize = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);

export const kebabToCamel = (str: string) => {
	return str.replace(/-./g, match => match[1].toUpperCase());
};

export const addToArray = (arrayName: "imports" | "controllers" | "providers" | "exports", itemName: string, moduleFileContent: string) => {
	const regex = new RegExp(`(${arrayName}: \\[[^\\]]*)\\]`);
	const match = moduleFileContent.match(regex);
	if (match) {
		let arrayContent = match[1].trimEnd();
		if (!arrayContent.includes(itemName)) {
			const items = arrayContent.split(",").map(item => item.trim());
			const isInline = items.every(item => !item.includes("\n"));
			const indentMatch = moduleFileContent.match(new RegExp(`(\\s*)${arrayName}:`));
			const indent = indentMatch ? indentMatch[1] + "	" : "		";

			if (isInline) {
				arrayContent = arrayContent.endsWith(",")
					? `${arrayContent} ${itemName}`
					: arrayContent.endsWith("[")
						? `${arrayContent}${itemName}`
						: `${arrayContent}, ${itemName}`;
				moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}]`);
			} else {
				arrayContent = arrayContent.endsWith(",") ? `${arrayContent}${indent}${itemName},\n	` : `${arrayContent},${indent}${itemName},`;
				moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}${indent.slice(0, -4)}]`);
			}
		}
	} else {
		moduleFileContent = moduleFileContent.replace(/(@Module\(\{)/, `$1\n	${arrayName}: [${itemName}],`);
	}
	return moduleFileContent;
};

export const isValidName = (
	fileName: string,
	pattern: RegExp = /^[a-z0-9.-]+$/,
	message = "Invalid file name. Try using a kebab-case format. Ex: my-name"
) => {
	const isValid = pattern.test(fileName);
	if (!isValid) {
		console.error(message);
		process.exit(1);
	}
};

export const startsInBasePath = (basePath: string, resourcePath: string) => {
	if (!resourcePath.startsWith(basePath)) {
		console.error("The resource path must be inside the base path");
		process.exit(1);
	}
};

export const formatFile = async (path: string) => {
	const prettierrc = join(process.cwd() + "/.prettierrc");
	if (existsSync(prettierrc)) {
		try {
			await executeCommand(`npx prettier --write ${path}`, process.cwd());
		} catch {
			return;
		}
	}
};
