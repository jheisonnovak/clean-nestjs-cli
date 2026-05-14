import { describe, expect, it } from "vitest";
import { toRoutePath, toSnakeCase, toTableName } from "../../src/utils/naming";

describe("naming", () => {
	it("converte nomes compostos para snake_case", () => {
		expect(toSnakeCase("refresh-token")).toBe("refresh_token");
		expect(toSnakeCase("refreshToken")).toBe("refresh_token");
	});

	it("gera nomes de tabela em snake_case plural", () => {
		expect(toTableName("token")).toBe("tokens");
		expect(toTableName("refresh-token")).toBe("refresh_tokens");
	});

	it("mantem rotas convencionais singulares", () => {
		expect(toRoutePath("auth")).toBe("auth");
		expect(toRoutePath("health")).toBe("health");
		expect(toRoutePath("user")).toBe("users");
	});
});
