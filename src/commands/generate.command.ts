import { Command } from "commander";
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
				let moduleArray = module.split("/");
				generator.generate(moduleArray[moduleArray.length - 1], options.path, resource);
			});
	}
}
