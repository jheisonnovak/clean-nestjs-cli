import { Command } from "commander";
import { AppGenerator } from "../generators/app.generator";
import { isValidName } from "../utils/file";

export class NewCommand {
	load(program: Command) {
		program
			.command("new <project-name>")
			.alias("n")
			.description("create a new clean project")
			.option("--no-linters", "disable linters (default is enabled)")
			.action((projectName: string, options) => {
				isValidName(projectName);
				AppGenerator.generate(projectName, options);
			});
	}
}
