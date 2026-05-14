import { FormattingPreferences, readFormattingPreferences } from "./clean-config";

export const formatGeneratedContent = (content: string, formatting: FormattingPreferences = readFormattingPreferences()): string =>
	content
		.split("\n")
		.map(line => formatLineIndentation(line, formatting))
		.join("\n");

const formatLineIndentation = (line: string, formatting: FormattingPreferences): string => {
	const indentation = line.match(/^[\t ]*/)?.[0] ?? "";
	if (!indentation) return line;

	const rest = line.slice(indentation.length);
	const columns = [...indentation].reduce((total, char) => total + (char === "\t" ? formatting.tabWidth : 1), 0);

	if (formatting.indentation === "spaces") {
		return `${" ".repeat(columns)}${rest}`;
	}

	const tabs = Math.floor(columns / formatting.tabWidth);
	const spaces = columns % formatting.tabWidth;
	return `${"\t".repeat(tabs)}${" ".repeat(spaces)}${rest}`;
};
