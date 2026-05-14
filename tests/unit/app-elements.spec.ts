import { describe, expect, it } from "vitest";
import { pnpmWorkspaceElement } from "../../src/elements/app/pnpm-workspace.element";
import { prismaSchemaElement } from "../../src/elements/app/prisma-schema.element";

describe("app elements", () => {
	it("gera configuracao pnpm para permitir build scripts conhecidos", () => {
		const content = pnpmWorkspaceElement();

		expect(content).toContain("allowBuilds:");
		expect(content).toContain('"@nestjs/core": true');
		expect(content).toContain('"prisma": true');
		expect(content).toContain("onlyBuiltDependencies:");
	});

	it("gera schema Prisma compativel com import via @prisma/client", () => {
		const content = prismaSchemaElement();

		expect(content).toContain('provider = "prisma-client-js"');
		expect(content).not.toContain("output");
		expect(content).toContain('provider = "sqlite"');
	});
});
