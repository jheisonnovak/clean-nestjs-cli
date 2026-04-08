import { Project } from "ts-morph";
import { describe, expect, it, vi } from "vitest";
import { addToModuleArray, capitalize, decapitalize, isValidName, kebabToCamel, startsInBasePath } from "../../src/utils/file";

describe("file utils", () => {
	it("capitaliza e decapitaliza nomes", () => {
		expect(capitalize("user")).toBe("User");
		expect(decapitalize("User")).toBe("user");
	});

	it("converte kebab-case para camelCase", () => {
		expect(kebabToCamel("create-user-profile")).toBe("createUserProfile");
	});

	it("valida nomes corretos", () => {
		expect(isValidName("user-profile")).toBe(true);
	});

	it("interrompe execução para nome inválido", () => {
		const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit called");
		}) as never);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

		expect(() => isValidName("Invalid_Name")).toThrow("process.exit called");
		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(errorSpy).toHaveBeenCalled();
	});

	it("interrompe execução para path fora da base", () => {
		const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit called");
		}) as never);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

		expect(() => startsInBasePath("/root/project", "../outside")).toThrow("process.exit called");
		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(errorSpy).toHaveBeenCalled();
	});

	it("adiciona item em array do Module sem duplicar", () => {
		const project = new Project({ useInMemoryFileSystem: true });
		const sourceFile = project.createSourceFile(
			"app.module.ts",
			`import { Module } from "@nestjs/common";

@Module({ imports: [] })
export class AppModule {}
`
		);

		addToModuleArray(sourceFile, "imports", "UsersModule");
		addToModuleArray(sourceFile, "imports", "UsersModule");

		const text = sourceFile.getFullText();
		expect(text).toContain("imports: [UsersModule]");
		expect(text.match(/UsersModule/g)?.length).toBe(1);
	});

	it("adiciona propriedade quando array não existe", () => {
		const project = new Project({ useInMemoryFileSystem: true });
		const sourceFile = project.createSourceFile(
			"app.module.ts",
			`import { Module } from "@nestjs/common";

@Module({})
export class AppModule {}
`
		);

		addToModuleArray(sourceFile, "controllers", "UsersController");
		expect(sourceFile.getFullText()).toContain("controllers: [UsersController]");
	});
});
