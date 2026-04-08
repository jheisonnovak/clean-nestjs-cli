import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { ModuleGenerator } from "../../src/generators/module.generator";
import { UseCaseGenerator } from "../../src/generators/use-case.generator";

describe("module generator integration", () => {
	it("gera estrutura de módulo e atualiza app.module.ts", async () => {
		const previousCwd = process.cwd();
		const tempDir = path.join(tmpdir(), `clean-nestjs-cli-${Date.now()}`);
		mkdirSync(path.join(tempDir, "src"), { recursive: true });
		writeFileSync(
			path.join(tempDir, "src", "app.module.ts"),
			`import { Module } from "@nestjs/common";

@Module({})
export class AppModule {}
`,
			"utf8"
		);

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { path: "/", spec: true });

			expect(existsSync(path.join(tempDir, "src", "modules", "user", "user.module.ts"))).toBe(true);
			expect(existsSync(path.join(tempDir, "src", "modules", "user", "repositories", "user.repository.ts"))).toBe(true);
			expect(existsSync(path.join(tempDir, "src", "modules", "user", "models", "interfaces", "user-repository.interface.ts"))).toBe(true);

			const appModuleContent = readFileSync(path.join(tempDir, "src", "app.module.ts"), "utf8");
			expect(appModuleContent).toContain('import { UserModule } from "./modules/user/user.module";');
			expect(appModuleContent).toContain("imports: [UserModule]");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera use-case em módulo existente", async () => {
		const previousCwd = process.cwd();
		const tempDir = path.join(tmpdir(), `clean-nestjs-cli-${Date.now()}-uc`);
		mkdirSync(path.join(tempDir, "src"), { recursive: true });
		writeFileSync(
			path.join(tempDir, "src", "app.module.ts"),
			`import { Module } from "@nestjs/common";

@Module({})
export class AppModule {}
`,
			"utf8"
		);

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { path: "/", spec: true });
			await UseCaseGenerator.generate("user", { path: "/", spec: true }, "create-user");

			expect(existsSync(path.join(tempDir, "src", "modules", "user", "use-cases", "create-user", "create-user.use-case.ts"))).toBe(true);
			expect(existsSync(path.join(tempDir, "src", "modules", "user", "use-cases", "create-user", "create-user.controller.ts"))).toBe(true);
			expect(existsSync(path.join(tempDir, "src", "modules", "user", "use-cases", "create-user", "create-user.spec.ts"))).toBe(true);

			const moduleFile = readFileSync(path.join(tempDir, "src", "modules", "user", "user.module.ts"), "utf8");
			expect(moduleFile).toContain("CreateUserUserController");
			expect(moduleFile).toContain("CreateUserUserUseCase");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});
});
