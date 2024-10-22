#!/usr/bin/env node
import { program } from "commander";
import { newCommand } from "../src/commands/new.command";
import * as process from "process";
import { GenerateCommand } from "../src/commands/generate.command";

const main = async () => {
	program
		.name("clean-arch-nestjs-cli")
		.version(require("../package.json").version, "-v, --version")
		.usage("<command> [options]")
		.helpOption("-h, --help")
		.command("new <project-name> [options]")
		.alias("n")
		.description("create a new clean project")
		.action(newCommand);

	new GenerateCommand().load(program);

	program.parse(process.argv);
};

main();
