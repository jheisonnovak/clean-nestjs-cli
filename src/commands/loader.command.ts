import { Command } from "commander";
import packageJson from "../../package.json";
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
	}
}
