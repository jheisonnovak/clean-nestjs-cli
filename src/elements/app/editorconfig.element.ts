import { DEFAULT_FORMATTING, FormattingPreferences } from "../../utils/clean-config";

export const editorConfigElement = (formatting: FormattingPreferences = DEFAULT_FORMATTING): string => `root = true

[*]
charset = utf-8
indent_style = ${formatting.indentation === "tabs" ? "tab" : "space"}
indent_size = ${formatting.tabWidth}
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
`;
