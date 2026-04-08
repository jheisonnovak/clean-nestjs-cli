import { mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it, vi } from "vitest";

describe("local-library", () => {
	it("retorna false quando biblioteca local nao existe", async () => {
		const previousCwd = process.cwd();
		const tempDir = path.join(tmpdir(), `clean-nestjs-cli-local-${Date.now()}`);
		mkdirSync(tempDir, { recursive: true });

		try {
			process.chdir(tempDir);
			vi.resetModules();

			const { localLibraryExists } = await import("../../src/utils/local-library");
			expect(localLibraryExists()).toBe(false);
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it("retorna true e carrega LoaderCommand quando biblioteca local existe", async () => {
		const previousCwd = process.cwd();
		const tempDir = path.join(tmpdir(), `clean-nestjs-cli-local-${Date.now()}-exists`);
		const commandDir = path.join(tempDir, "node_modules", "clean-nestjs-cli", "src", "commands");
		mkdirSync(commandDir, { recursive: true });
		writeFileSync(path.join(commandDir, "loader.command.js"), "exports.LoaderCommand = { execute: async () => Promise.resolve() };", "utf8");

		try {
			process.chdir(tempDir);
			vi.resetModules();

			const { localLibraryExists, localLibraryPath } = await import("../../src/utils/local-library");
			expect(localLibraryExists()).toBe(true);

			const loader = await localLibraryPath();
			expect(typeof loader.execute).toBe("function");
		} finally {
			process.chdir(previousCwd);
			rmSync(tempDir, { recursive: true, force: true });
		}
	});
});
