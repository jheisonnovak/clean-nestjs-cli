import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export const createFile = (filePath: string, content: string) => {
	const dir = path.dirname(filePath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(filePath, content, "utf8");
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
