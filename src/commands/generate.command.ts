import { Command } from "commander";
import { getGenerator } from "../utils/get-generator";

export class GenerateCommand {
	public async load(program: Command) {
		program
			.command("generate <schema> <module> [resource]")
			.alias("g")
			.description("Generate an element")
			.option("--path <path>", "Specify the destination directory", "")
			.action((element, module: string, resource: string, options) => {
				const generator = getGenerator(element);
				if (!generator) {
					console.error(`Generator ${element} not found`);
					process.exit(1);
				}
				generator.generate(module, options.path, resource);
			});
	}
}
