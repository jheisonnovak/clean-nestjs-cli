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

	it("mantem rota convencional para modulo auth", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-auth-route");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("auth", { path: "/", spec: true, orm: "typeorm" });

			const controllerFile = readFileSync(path.join(tempDir, "src", "modules", "auth", "presentation", "controllers", "auth.controller.ts"), "utf8");
			expect(controllerFile).toContain('@Controller("auth")');
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
			expect(controllerFile).toContain('import { CreateUserDto } from "../../application/dtos/create-user.dto";');
			expect(controllerFile).toContain('import { CreateUserRequestDto } from "../dtos/create-user.request.dto";');
			expect(controllerFile).toContain("CreateUserUseCase");
			expect(controllerFile).toContain("@Post()");
			expect(controllerFile).toContain("createUser");
			expect(controllerFile).toContain("const input: CreateUserDto = { ...dto };");

			const useCaseFile = readFileSync(path.join(moduleRoot, "application", "use-cases", "create-user", "create-user.use-case.ts"), "utf8");
			expect(useCaseFile).toContain('import { CreateUserDto } from "../../dtos/create-user.dto";');
			expect(useCaseFile).toContain('import { UserOutputDto } from "../../dtos/user-output.dto";');
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("normaliza nome CRUD cru com o nome do módulo", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-normalized-crud");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { controller: true, path: "/", spec: true, orm: "typeorm" });
			await UseCaseGenerator.generate("user", { controller: true, path: "/", spec: true, orm: "typeorm" }, "create");

			const moduleRoot = path.join(tempDir, "src", "modules", "user");
			expect(existsSync(path.join(moduleRoot, "application", "use-cases", "create-user", "create-user.use-case.ts"))).toBe(true);

			const useCaseFile = readFileSync(path.join(moduleRoot, "application", "use-cases", "create-user", "create-user.use-case.ts"), "utf8");
			expect(useCaseFile).toContain("export class CreateUserUseCase");
			expect(useCaseFile).not.toContain("export class CreateUseCase");

			const controllerFile = readFileSync(path.join(moduleRoot, "presentation", "controllers", "user.controller.ts"), "utf8");
			expect(controllerFile).toContain("createUser");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("cria controller ausente ao gerar use-case em módulo parcial", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-missing-controller");

		try {
			process.chdir(tempDir);
			const moduleRoot = path.join(tempDir, "src", "modules", "user");
			mkdirSync(path.join(moduleRoot, "application", "use-cases"), { recursive: true });
			mkdirSync(path.join(moduleRoot, "presentation", "controllers"), { recursive: true });
			mkdirSync(path.join(moduleRoot, "presentation", "dtos"), { recursive: true });
			mkdirSync(path.join(moduleRoot, "application", "dtos"), { recursive: true });
			writeFileSync(
				path.join(moduleRoot, "user.module.ts"),
				`import { Module } from "@nestjs/common";

@Module({})
export class UserModule {}
`,
				"utf8"
			);

			await UseCaseGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" }, "create-user");

			expect(existsSync(path.join(moduleRoot, "presentation", "controllers", "user.controller.ts"))).toBe(true);
			const moduleFile = readFileSync(path.join(moduleRoot, "user.module.ts"), "utf8");
			expect(moduleFile).toContain("controllers: [UserController]");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera output especifico para use-case nao CRUD", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-login-output");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("auth", { path: "/", spec: true, orm: "typeorm" });
			await UseCaseGenerator.generate("auth", { path: "/", spec: true, orm: "typeorm" }, "login");

			const moduleRoot = path.join(tempDir, "src", "modules", "auth");
			expect(existsSync(path.join(moduleRoot, "application", "dtos", "login-output.dto.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "presentation", "dtos", "login.response.dto.ts"))).toBe(true);

			const useCaseFile = readFileSync(path.join(moduleRoot, "application", "use-cases", "login", "login.use-case.ts"), "utf8");
			expect(useCaseFile).toContain('import { LoginOutputDto } from "../../dtos/login-output.dto";');
			expect(useCaseFile).toContain("Promise<LoginOutputDto>");

			const controllerFile = readFileSync(path.join(moduleRoot, "presentation", "controllers", "auth.controller.ts"), "utf8");
			expect(controllerFile).toContain('import { LoginResponseDto } from "../dtos/login.response.dto";');
			expect(controllerFile).toContain("@Post(\"login\")");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera void para logout", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-logout-output");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("auth", { path: "/", spec: true, orm: "typeorm" });
			await UseCaseGenerator.generate("auth", { path: "/", spec: true, orm: "typeorm" }, "logout");

			const moduleRoot = path.join(tempDir, "src", "modules", "auth");
			expect(existsSync(path.join(moduleRoot, "application", "dtos", "logout-output.dto.ts"))).toBe(false);
			const useCaseFile = readFileSync(path.join(moduleRoot, "application", "use-cases", "logout", "logout.use-case.ts"), "utf8");
			expect(useCaseFile).toContain("Promise<void>");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera array para list use-case CRUD", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-list-output");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" });
			await UseCaseGenerator.generate("user", { path: "/", spec: true, orm: "typeorm" }, "list-users");

			const useCaseFile = readFileSync(
				path.join(tempDir, "src", "modules", "user", "application", "use-cases", "list-users", "list-users.use-case.ts"),
				"utf8"
			);
			expect(useCaseFile).toContain("Promise<UserOutputDto[]>");

			const controllerFile = readFileSync(path.join(tempDir, "src", "modules", "user", "presentation", "controllers", "user.controller.ts"), "utf8");
			expect(controllerFile).toContain("Promise<UserResponseDto[]>");
			expect(controllerFile).toContain(".map(output => UserResponseDto.fromOutput(output))");
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

	it("gera find-one como rota por id", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-find-one");

		try {
			process.chdir(tempDir);
			await ModuleGenerator.generate("user", { controller: true, path: "/", spec: true, orm: "typeorm" });
			await UseCaseGenerator.generate("user", { controller: true, path: "/", spec: true, orm: "typeorm" }, "find-one");

			const controllerFile = readFileSync(path.join(tempDir, "src", "modules", "user", "presentation", "controllers", "user.controller.ts"), "utf8");
			expect(controllerFile).toContain('@Get(":id")');
			expect(controllerFile).toContain('Param("id")');
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("gera use-case sem controller quando --no-controller for usado", async () => {
		const previousCwd = process.cwd();
		const tempDir = createTempProject("-no-controller");

		try {
			process.chdir(tempDir);
			const moduleRoot = path.join(tempDir, "src", "modules", "worker");
			mkdirSync(path.join(moduleRoot, "application", "dtos"), { recursive: true });
			mkdirSync(path.join(moduleRoot, "application", "use-cases"), { recursive: true });
			writeFileSync(
				path.join(moduleRoot, "worker.module.ts"),
				`import { Module } from "@nestjs/common";

@Module({})
export class WorkerModule {}
`,
				"utf8"
			);

			await UseCaseGenerator.generate("worker", { controller: false, path: "/", spec: true, orm: "typeorm" }, "process-job");

			expect(existsSync(path.join(moduleRoot, "application", "use-cases", "process-job", "process-job.use-case.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "application", "dtos", "process-job-output.dto.ts"))).toBe(true);
			expect(existsSync(path.join(moduleRoot, "presentation", "controllers", "worker.controller.ts"))).toBe(false);
			expect(existsSync(path.join(moduleRoot, "presentation", "dtos", "process-job.response.dto.ts"))).toBe(false);
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
			expect(existsSync(path.join(moduleRoot, "domain", "entities", "delivery.entity.ts"))).toBe(true);
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
