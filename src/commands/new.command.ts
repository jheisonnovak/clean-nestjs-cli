import { Command } from "commander";

export class NewCommand {
	load(program: Command) {
		program
			.command("new <project-name>")
			.alias("n")
			.description("create a new clean project")
			.option("--path <path>", "Specify the destination directory", "/")
			.action((projectName, options) => {});
	}
}
