import { Command } from "commander";
import { writeFileSync } from "fs";
import path from "path";
import { editorConfigElement } from "../elements/app/editorconfig.element";
import { prettierrcElement } from "../elements/app/prettierrc.element";
import {
	cleanNestConfigElement,
	DEFAULT_FORMATTING,
	DEFAULT_ORM,
	FormattingPreferences,
	readFormattingPreferences,
	resolveOrm,
} from "../utils/clean-config";

export class ConfigCommand {
	async load(program: Command): Promise<void> {
		const config = program.command("config").description("manage Clean NestJS CLI configuration");

		config
			.command("init")
			.description("create clean-nest.json, .prettierrc and .editorconfig in the current directory")
			.option("--orm <orm>", "set default ORM: typeorm, prisma or none")
			.action((options: { orm?: string }) => {
				const orm = options.orm ? resolveOrm(options.orm) : DEFAULT_ORM;
				const formatting = readFormattingPreferences();
				this.writeConfigFiles(orm, formatting);
			});

		config
			.command("set <key> <value>")
			.description("set a formatting preference. Keys: formatting.indentation, formatting.tabWidth, formatting.printWidth")
			.action((key: string, value: string) => {
				const formatting = this.updateFormatting(readFormattingPreferences(), key, value);
				this.writeConfigFiles(resolveOrm(), formatting);
			});
	}

	private writeConfigFiles(orm: "typeorm" | "prisma" | "none", formatting: FormattingPreferences): void {
		writeFileSync(path.join(process.cwd(), "clean-nest.json"), cleanNestConfigElement(orm, formatting), "utf8");
		writeFileSync(path.join(process.cwd(), ".prettierrc"), prettierrcElement(formatting), "utf8");
		writeFileSync(path.join(process.cwd(), ".editorconfig"), editorConfigElement(formatting), "utf8");
	}

	private updateFormatting(formatting: FormattingPreferences, key: string, value: string): FormattingPreferences {
		if (key === "formatting.indentation") {
			if (value !== "tabs" && value !== "spaces") {
				console.error('Invalid indentation. Use "tabs" or "spaces".');
				process.exit(1);
			}
			return { ...formatting, indentation: value };
		}

		if (key === "formatting.tabWidth") {
			return { ...formatting, tabWidth: this.parsePositiveInteger(value, key) };
		}

		if (key === "formatting.printWidth") {
			return { ...formatting, printWidth: this.parsePositiveInteger(value, key) };
		}

		console.error("Invalid config key.");
		process.exit(1);
		throw new Error("Invalid config key.");
	}

	private parsePositiveInteger(value: string, key: string): number {
		const parsed = Number(value);
		if (!Number.isInteger(parsed) || parsed <= 0) {
			console.error(`${key} must be a positive integer.`);
			process.exit(1);
		}
		return parsed;
	}
}
