import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { ModuleGenerator } from "../../src/generators/module.generator";
import { RepositoryGenerator } from "../../src/generators/repository.generator";
import { UseCaseGenerator } from "../../src/generators/use-case.generator";

const createTempProject = (suffix = ""): string => {
	const tempDir = path.join(tmpdir(), `clean-nestjs-cli-${Date.now()}${suffix}`);
	mkdirSync(path.join(tempDir, "src"), { recursive: true });
	writeFileSync(
		path.join(tempDir, "src", "app.module.ts"),
		`import { Module } from "@nestjs/common";

@Module({})
export class AppModule {}
`,
		"utf8"
	);
	return tempDir;
};

describe("module generator integration", () => {
	it("gera estrutura layered-clean e atualiza app.module.ts", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject();

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" });

			const moduleRoot = path.join(tempDir, "src", "modules", "user");
			expect(existsSync(path.join(moduleRoot, "user.module.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "domain", "entities", "user.entity.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "domain", "repositories", "user.repository.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "application", "dtos", "user-output.dto.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "infrastructure", "persistence", "user.orm.entity.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "infrastructure", "repositories", "user.typeorm.repository.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "presentation", "controllers", "user.controller.ts"))).toBe(true);
			expect(existsSync(path.join(tempDir, "clean-nest.json"))).toBe(true);

			const moduleFile = readFileSync(path.join(moduleRoot, "user.module.ts"), "utf8");
			expect(moduleFile).toContain("TypeOrmModule.forFeature([UserTypeOrmEntity])");
			expect(moduleFile).toContain("USER_REPOSITORY");

			const persistenceFile = readFileSync(path.join(moduleRoot, "infrastructure", "persistence", "user.orm.entity.ts"), "utf8");
			expect(persistenceFile).toContain('@Entity({ name: "users" })');

			const domainRepository = readFileSync(path.join(moduleRoot, "domain", "repositories", "user.repository.ts"), "utf8");
			expect(domainRepository).not.toMatch(/@nestjs|typeorm|prisma|application|infrastructure|presentation/);

			const appModuleContent = readFileSync(path.join(tempDir, "src", "app.module.ts"), "utf8");
			expect(appModuleContent).toContain('import { UserModule } from "./modules/user/user.module";');
			expect(appModuleContent).toContain("imports: [UserModule]");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera use-case em application e atualiza controller de presentation", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-uc");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" });
			await UseCaseGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" }, "create-user");

			const moduleRoot = path.join(tempDir, "src", "modules", "user");
			expect(existsSync(path.join(moduleRoot, "application", "use-cases", "create-user", "create-user.use-case.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "application", "use-cases", "create-user", "create-user.spec.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "application", "dtos", "create-user.dto.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "presentation", "dtos", "create-user.request.dto.ts"))).toBe(true);

			const moduleFile = readFileSync(path.join(moduleRoot, "user.module.ts"), "utf8");
			expect(moduleFile).toContain("CreateUserUseCase");

			const controllerFile = readFileSync(path.join(moduleRoot, "presentation", "controllers", "user.controller.ts"), "utf8");
			expect(controllerFile).toContain("CreateUserUseCase");
			expect(controllerFile).toContain("@Post()");
			expect(controllerFile).toContain("createUser");
			expect(controllerFile).toContain("const input: CreateUserDto = { ...dto };");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera Param para use-case com rota por id", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-param");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" });
			await UseCaseGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" }, "delete-user");

			const controllerFile = readFileSync(path.join(tempDir, "src", "modules", "user", "presentation", "controllers", "user.controller.ts"), "utf8");
			expect(controllerFile).toContain('Param("id")');
			expect(controllerFile).toContain("deleteUser(@Param");

			const useCaseFile = readFileSync(
				path.join(tempDir, "src", "modules", "user", "application", "use-cases", "delete-user", "delete-user.use-case.ts"),
				"utf8"
			);
			expect(useCaseFile).toContain("async execute(id: string): Promise<void>");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera repository prisma sem arquivos TypeORM", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-prisma");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("notification", { path: "/", spec: true, orm: "prisma" });
			await RepositoryGenerator.generate("notification", { path: "/", spec: true, orm: "prisma" }, "delivery");

			const moduleRoot = path.join(tempDir, "src", "modules", "notification");
			expect(existsSync(path.join(moduleRoot, "infrastructure", "repositories", "notification.prisma.repository.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "infrastructure", "repositories", "delivery.prisma.repository.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "infrastructure", "persistence", "notification.orm.entity.ts"))).toBe(false);

			const moduleFile = readFileSync(path.join(moduleRoot, "notification.module.ts"), "utf8");
			expect(moduleFile).not.toContain("TypeOrmModule");
			expect(moduleFile).toContain("DELIVERY_REPOSITORY");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera entity TypeORM com tabela snake_case plural", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-entity");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("auth", { path: "/", spec: true, orm: "typeorm" });
			const { EntityGenerator } = await import("../../src/generators/entity.generator");
			await EntityGenerator.generate("auth", { path: "/", spec: true, orm: "typeorm" }, "refresh-token");

			const entityFile = readFileSync(
				path.join(tempDir, "src", "modules", "auth", "infrastructure", "persistence", "refresh-token.orm.entity.ts"),
				"utf8"
			);
			expect(entityFile).toContain('@Entity({ name: "refresh_tokens" })');
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});
});
