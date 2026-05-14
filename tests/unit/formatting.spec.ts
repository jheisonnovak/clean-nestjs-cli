import { describe, expect, it } from "vitest";
import { formatGeneratedContent } from "../../src/utils/formatting";

describe("formatting", () => {
	it("mantem tabs quando a preferencia e tabs", () => {
		const content = "export class User {\n    id: string;\n\tname: string;\n}\n";

		expect(formatGeneratedContent(content, { indentation: "tabs", printWidth: 150, tabWidth: 4 })).toContain("\tid: string;");
		expect(formatGeneratedContent(content, { indentation: "tabs", printWidth: 150, tabWidth: 4 })).toContain("\tname: string;");
	});

	it("converte tabs para spaces quando a preferencia e spaces", () => {
		const content = "export class User {\n\tid: string;\n}\n";

		expect(formatGeneratedContent(content, { indentation: "spaces", printWidth: 150, tabWidth: 2 })).toContain("  id: string;");
	});
});
