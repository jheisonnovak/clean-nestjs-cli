import { Command } from "commander";
import { GenerateCommand } from "./generate.command";
import { NewCommand } from "./new.command";

export class LoaderCommand {
	static async execute(program: Command) {
		program
			.name("clean-nest")
			.version(require("../../package.json").version, "-v, --version", "output the current version")
			.usage("<command> [options]")
			.helpOption("-h, --help");

		await new NewCommand().load(program);
		await new GenerateCommand().load(program);
	}
}
