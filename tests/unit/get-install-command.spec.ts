import { describe, expect, it } from "vitest";
import { getInstallCommand } from "../../src/utils/get-install-command";

describe("getInstallCommand", () => {
	it("retorna install para npm", () => {
		expect(getInstallCommand("npm")).toBe("install");
	});

	it("retorna add para yarn e pnpm", () => {
		expect(getInstallCommand("yarn")).toBe("add");
		expect(getInstallCommand("pnpm")).toBe("add");
	});
});
