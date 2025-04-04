import chalk from "chalk";
import { existsSync, promises as fs, mkdirSync } from "fs";
import path, { join } from "path";
import { SourceFile, SyntaxKind } from "ts-morph";
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

export const addToModuleArray = (sourceFile: SourceFile, arrayName: "imports" | "controllers" | "providers" | "exports", itemName: string) => {
	const classWithModule = sourceFile.getClasses().find(cls => cls.getDecorator("Module"));

	if (!classWithModule) {
		console.error("Module decorator not found in the file.");
		process.exit(1);
	}

	const decorator = classWithModule.getDecorator("Module");
	const arg = decorator?.getArguments()[0];

	if (!arg || !arg.compilerNode || arg.getKind() !== SyntaxKind.ObjectLiteralExpression) {
		console.error("Module decorator argument not found or is not an object literal.");
		process.exit(1);
	}

	const objLiteral = arg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

	const arrayProp = objLiteral.getProperties().find(p => {
		if (p.getKind() !== SyntaxKind.PropertyAssignment) return false;

		const name = p.getKindName();
		if (name !== arrayName) return false;

		const initializer = (p as any).getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
		return !!initializer;
	});
	if (!arrayProp) {
		objLiteral.addPropertyAssignment({
			name: arrayName,
			initializer: `[${itemName}]`,
		});
	} else if (arrayProp.getKind() === SyntaxKind.PropertyAssignment) {
		const initializer = arrayProp.getFirstDescendantByKind(SyntaxKind.ArrayLiteralExpression);
		if (initializer) {
			const alreadyExists = initializer.getElements().some(el => el.getText() === itemName);
			if (!alreadyExists) {
				initializer.addElement(itemName);
			}
		}
	}
	return sourceFile;
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
