import { Command } from "commander";
import { describe, expect, it } from "vitest";
import { LoaderCommand } from "../../src/commands/loader.command";
import { executeCommand } from "../../src/utils/execute-command";
import { getGenerator } from "../../src/utils/get-generator";
import { getRouteFromAction } from "../../src/utils/get-route-from-action";

describe("dependency contracts", () => {
	it("mantém aliases de generators", () => {
		expect(getGenerator("module")?.name).toBe("ModuleGenerator");
		expect(getGenerator("mo")?.name).toBe("ModuleGenerator");
		expect(getGenerator("repository")?.name).toBe("RepositoryGenerator");
		expect(getGenerator("rp")?.name).toBe("RepositoryGenerator");
		expect(getGenerator("use-case")?.name).toBe("UseCaseGenerator");
		expect(getGenerator("uc")?.name).toBe("UseCaseGenerator");
		expect(getGenerator("unknown")).toBeNull();
	});

	it("mantém mapeamento de rotas para ações", () => {
		expect(getRouteFromAction("create-user")).toEqual({ method: "Post", path: "users" });
		expect(getRouteFromAction("update-user")).toEqual({ method: "Patch", path: "users/:id" });
		expect(getRouteFromAction("delete-user")).toEqual({ method: "Delete", path: "users/:id" });
	});

	it("registra comandos esperados no commander", async () => {
		const program = new Command();
		await LoaderCommand.execute(program);

		const commands = program.commands.map(command => command.name());
		expect(commands).toContain("new");
		expect(commands).toContain("generate");
	});

	it("parse de comando preserva argumentos com aspas", async () => {
		const output = await executeCommand('node -e "console.log(123)"', process.cwd());
		expect(output).toContain("123");
	});
});
