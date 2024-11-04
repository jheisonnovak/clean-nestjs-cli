import { Command } from "commander";
import { IGeneratorOptions } from "../generators/generate.generator";
import { isValidName } from "../utils/file";
import { getGenerator, getNameAliasPairs } from "../utils/get-generator";

export class GenerateCommand {
	public async load(program: Command) {
		program
			.command("generate <schematics> <module> [resource]")
			.alias("g")
			.description(`generate a specified element. Available schematics: [${getNameAliasPairs()}]`)
			.option("--path <path>", "specify the destination directory inside /src/modules folder", "/")
			.option("--no-spec", "do not generate a spec files")
			.action((element, module: string, resource: string, options: IGeneratorOptions) => {
				const generator = getGenerator(element);
				if (!generator) {
					console.error(`"${element}" not found. Available schematics: [${getNameAliasPairs()}]`);
					process.exit(1);
				}
				isValidName(module);
				isValidName(resource);
				isValidName(options.path, /^[a-zA-Z0-9_.\-\/]+$/, "Invalid path name. Ex: my-module/my-resource");
				generator.generate(module, options, resource);
			});
	}
}
