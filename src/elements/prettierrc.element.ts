import { DEFAULT_FORMATTING, FormattingPreferences } from "../utils/clean-config";

export const prettierrcElement = (formatting: FormattingPreferences = DEFAULT_FORMATTING): string => `{
	"printWidth": ${formatting.printWidth},
	"arrowParens": "avoid",
	"formatOnSave": true,
	"singleQuote": false,
	"useTabs": ${formatting.indentation === "tabs"},
	"trailingComma": "es5",
	"endOfLine": "auto",
	"tabWidth": ${formatting.tabWidth}
}
`;
