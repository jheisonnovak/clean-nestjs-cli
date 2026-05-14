import { Command } from "commander";
import packageJson from "../../package.json";
import { ConfigCommand } from "./config.command";
import { GenerateCommand } from "./generate.command";
import { NewCommand } from "./new.command";

export class LoaderCommand {
	static async execute(program: Command): Promise<void> {
		program
			.name("clean-nest")
			.version(packageJson.version, "-v, --version", "output the current version")
			.usage("<command> [options]")
			.helpOption("-h, --help");

		await new NewCommand().load(program);
		await new GenerateCommand().load(program);
		await new ConfigCommand().load(program);
	}
}
