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

export const addToArray = (arrayName: string, itemName: string, moduleFileContent: string) => {
	const regex = new RegExp(`(${arrayName}: \\[[^\\]]*)\\]`);
	const match = moduleFileContent.match(regex);
	if (match) {
		let arrayContent = match[1].trimEnd();
		if (!arrayContent.includes(itemName)) {
			const items = arrayContent.split(",").map(item => item.trim());
			const isInline = items.every(item => !item.includes("\n"));
			const indentMatch = moduleFileContent.match(new RegExp(`(\\s*)${arrayName}:`));
			const indent = indentMatch ? indentMatch[1] + "    " : "        ";

			if (isInline) {
				arrayContent = arrayContent.endsWith(",")
					? `${arrayContent} ${itemName}`
					: arrayContent.endsWith("[")
					? `${arrayContent}${itemName}`
					: `${arrayContent}, ${itemName}`;
				moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}]`);
			} else {
				arrayContent = arrayContent.endsWith(",") ? `${arrayContent}${indent}${itemName},` : `${arrayContent},${indent}${itemName},`;
				moduleFileContent = moduleFileContent.replace(regex, `${arrayContent}${indent.slice(0, -4)}]`);
			}
		}
	} else {
		moduleFileContent = moduleFileContent.replace(/(@Module\(\{)/, `$1\n    ${arrayName}: [${itemName}],`);
	}
	return moduleFileContent;
};
