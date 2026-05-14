import chalk from "chalk";
import { existsSync, writeFileSync } from "fs";
import path from "path";
import { Project, Scope } from "ts-morph";
import { formatGeneratedContent } from "./formatting";

export interface ControllerMethodUpdate {
	applicationDtoName?: string;
	applicationDtoPath?: string;
	bodyDtoName?: string;
	bodyDtoPath?: string;
	methodName: string;
	httpMethod: "Get" | "Post" | "Patch" | "Delete";
	httpPath?: string;
	responseDtoName?: string;
	responseDtoPath?: string;
	responseIsArray?: boolean;
	useCaseName: string;
	useCasePath: string;
	useCasePropertyName: string;
}

export function updateControllerFile(controllerFilePath: string, update: ControllerMethodUpdate): void {
	const relativePath = path.relative(process.cwd(), controllerFilePath);
	if (!existsSync(controllerFilePath)) {
		console.warn(`${chalk.red("NOT FOUND")} ${relativePath}`);
		process.exit(1);
	}

	const project = new Project();
	const sourceFile = project.addSourceFileAtPath(controllerFilePath);

	addNamedImport(sourceFile, update.httpMethod, "@nestjs/common");
	const usesId = update.httpPath?.includes(":id") ?? false;
	if (usesId) {
		addNamedImport(sourceFile, "Param", "@nestjs/common");
	}
	if (update.bodyDtoName && update.bodyDtoPath) {
		addNamedImport(sourceFile, "Body", "@nestjs/common");
		addNamedImport(sourceFile, update.bodyDtoName, update.bodyDtoPath);
	}
	if (update.applicationDtoName && update.applicationDtoPath) {
		addNamedImport(sourceFile, update.applicationDtoName, update.applicationDtoPath);
	}
	if (update.responseDtoName && update.responseDtoPath) {
		addNamedImport(sourceFile, update.responseDtoName, update.responseDtoPath);
	}
	addNamedImport(sourceFile, update.useCaseName, update.useCasePath);

	const controllerClass = sourceFile.getClasses()[0];
	if (!controllerClass) {
		console.error("Controller class not found in the file.");
		process.exit(1);
		throw new Error("Controller class not found in the file.");
	}

	const constructor = controllerClass.getConstructors()[0] ?? controllerClass.addConstructor({ parameters: [] });
	const hasUseCaseParam = constructor.getParameters().some(parameter => parameter.getName() === update.useCasePropertyName);
	if (!hasUseCaseParam) {
		constructor.addParameter({
			name: update.useCasePropertyName,
			type: update.useCaseName,
			scope: Scope.Private,
			isReadonly: true,
		});
	}

	if (!controllerClass.getMethod(update.methodName)) {
		const hasBody = Boolean(update.bodyDtoName);
		const responseType = update.responseDtoName ? `${update.responseDtoName}${update.responseIsArray ? "[]" : ""}` : undefined;
		const returnType = responseType ? `Promise<${responseType}>` : "Promise<void>";
		const executeArgs = [usesId ? "id" : "", hasBody ? "input" : ""].filter(Boolean).join(", ");
		const useCaseCall = `await this.${update.useCasePropertyName}.execute(${executeArgs})`;
		const returnStatement = update.responseDtoName
			? update.responseIsArray
				? `return (${useCaseCall}).map(output => ${update.responseDtoName}.fromOutput(output));`
				: `return ${update.responseDtoName}.fromOutput(${useCaseCall});`
			: `return await this.${update.useCasePropertyName}.execute(${executeArgs});`;
		const statements =
			hasBody && update.applicationDtoName ? [`const input: ${update.applicationDtoName} = { ...dto };`, returnStatement] : [returnStatement];

		controllerClass.addMethod({
			name: update.methodName,
			isAsync: true,
			returnType,
			parameters: [
				...(usesId ? [{ name: "id", type: "string", decorators: [{ name: "Param", arguments: ['"id"'] }] }] : []),
				...(hasBody ? [{ name: "dto", type: update.bodyDtoName, decorators: [{ name: "Body", arguments: [] }] }] : []),
			],
			decorators: [{ name: update.httpMethod, arguments: update.httpPath ? [`"${update.httpPath}"`] : [] }],
			statements,
		});
	}

	writeFileSync(controllerFilePath, formatGeneratedContent(sourceFile.getFullText()), "utf8");
	console.log(`${chalk.yellow("UPDATE")} ${relativePath}`);
}

function addNamedImport(sourceFile: import("ts-morph").SourceFile, name: string, moduleSpecifier: string): void {
	const existingImport = sourceFile.getImportDeclarations().find(decl => decl.getModuleSpecifierValue() === moduleSpecifier);
	if (existingImport) {
		if (!existingImport.getNamedImports().some(namedImport => namedImport.getName() === name)) {
			existingImport.addNamedImport(name);
		}
		return;
	}

	sourceFile.addImportDeclaration({
		namedImports: [name],
		moduleSpecifier,
	});
}
