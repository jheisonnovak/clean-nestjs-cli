import { mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { cleanNestConfigElement, normalizeOrm, readCleanNestConfig, resolveOrm } from "../../src/utils/clean-config";

describe("clean config", () => {
	it("normaliza ORMs suportados", () => {
		expect(normalizeOrm("TypeORM")).toBe("typeorm");
		expect(normalizeOrm("prisma")).toBe("prisma");
		expect(normalizeOrm("none")).toBe("none");
		expect(normalizeOrm("mongo")).toBeUndefined();
	});

	it("resolve ORM com prioridade para option, config e fallback", () => {
		const tempDir = path.join(tmpdir(), `clean-nestjs-cli-config-${Date.now()}`);
		mkdirSync(tempDir, { recursive: true });
		writeFileSync(path.join(tempDir, "clean-nest.json"), cleanNestConfigElement("prisma"), "utf8");

		try {
			expect(readCleanNestConfig(tempDir)?.orm).toBe("prisma");
			expect(resolveOrm("typeorm", tempDir)).toBe("typeorm");
			expect(resolveOrm(undefined, tempDir)).toBe("prisma");
			expect(resolveOrm(undefined, path.join(tempDir, "missing"))).toBe("typeorm");
		} finally {
			rmSync(tempDir, { recursive: true, force: true });
		}
	});
});
