import { Command } from "commander";
import { AppGenerator } from "../generators/app.generator";

export class NewCommand {
	load(program: Command) {
		program
			.command("new <project-name>")
			.alias("n")
			.description("create a new clean project")
			.option("--no-linters", "disable linters (default is enabled)")
			.action((projectName, options) => {
				AppGenerator.generate(projectName, options);
			});
	}
}
