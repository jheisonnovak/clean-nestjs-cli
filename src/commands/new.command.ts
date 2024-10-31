import { Command } from "commander";
import { AppGenerator } from "../generators/app.generator";
import { isValidName } from "../utils/file";

export class NewCommand {
	async load(program: Command) {
		program
			.command("new <project-name>")
			.alias("n")
			.description("create a new clean project")
			.option("--no-linters", "disable linters (default is enabled)")
			.action(async (projectName: string, options) => {
				isValidName(projectName);
				await AppGenerator.generate(projectName, options);
			});
	}
}
