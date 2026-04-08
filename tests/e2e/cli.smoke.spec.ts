import { spawnSync, type SpawnSyncReturns } from "child_process";
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");
const cliPath = path.join(repoRoot, "bin", "index.js");

const runCli = (args: string[]): SpawnSyncReturns<string> =>
	spawnSync(process.execPath, [cliPath, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});

describe("CLI smoke tests", () => {
	it("exibe help com sucesso", () => {
		const result = runCli(["--help"]);
		expect(result.status).toBe(0);
		expect(result.stdout).toContain("Usage:");
		expect(result.stdout).toContain("clean-nest");
	});

	it("exibe versão atual", () => {
		const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as { version: string };
		const result = runCli(["--version"]);

		expect(result.status).toBe(0);
		expect(result.stdout).toContain(pkg.version);
	});

	it("retorna erro para schematic inválido", () => {
		const result = runCli(["generate", "invalid-schematic", "user"]);
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("not found");
	});

	it("retorna erro para nome de projeto inválido", () => {
		const result = runCli(["new", "Invalid_Name"]);
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("Invalid file name");
	});
});
