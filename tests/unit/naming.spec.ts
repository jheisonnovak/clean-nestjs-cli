import { describe, expect, it } from "vitest";
import { toSnakeCase, toTableName } from "../../src/utils/naming";

describe("naming", () => {
	it("converte nomes compostos para snake_case", () => {
		expect(toSnakeCase("refresh-token")).toBe("refresh_token");
		expect(toSnakeCase("refreshToken")).toBe("refresh_token");
	});

	it("gera nomes de tabela em snake_case plural", () => {
		expect(toTableName("token")).toBe("tokens");
		expect(toTableName("refresh-token")).toBe("refresh_tokens");
	});
});
