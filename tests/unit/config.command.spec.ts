import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { ConfigCommand } from "../../src/commands/config.command";

describe("config command", () => {
	it("cria arquivos de configuracao com preferencias de formatacao", async () => {
		const previousCwd = process.cwd();
		const tempDir = path.join(tmpdir(), `clean-nestjs-cli-config-command-${Date.now()}`);
		mkdirSync(tempDir, { recursive: true });

		try {
			process.chdir(tempDir);
			const program = new Command();
			await new ConfigCommand().load(program);
			program.parse(["node", "test", "config", "set", "formatting.indentation", "spaces"]);

			expect(existsSync(path.join(tempDir, "clean-nest.json"))).toBe(true);
			expect(existsSync(path.join(tempDir, ".prettierrc"))).toBe(true);
			expect(existsSync(path.join(tempDir, ".editorconfig"))).toBe(true);
			expect(readFileSync(path.join(tempDir, ".editorconfig"), "utf8")).toContain("indent_style = space");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});
});
