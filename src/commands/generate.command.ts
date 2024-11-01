import { Command } from "commander";
import { isValidName } from "../utils/file";
import { generators, getGenerator } from "../utils/get-generator";

export class GenerateCommand {
	public async load(program: Command) {
		program
			.command("generate <schematics> <module> [resource]")
			.alias("g")
			.description("generate a specified element")
			.option("--path <path>", "specify the destination directory inside /src/modules folder", "/")
			.action((element, module: string, resource: string, options) => {
				const generator = getGenerator(element);
				if (!generator) {
					console.error(`"${element}" not found. Available schematics: [${Object.keys(generators).join(", ")}]`);
					process.exit(1);
				}
				isValidName(module);
				isValidName(resource);
				isValidName(options.path, /^[a-zA-Z0-9_.\-\/]+$/, "Invalid path name. Ex: my-module/my-resource");
				generator.generate(module, options.path, resource);
			});
	}
}
