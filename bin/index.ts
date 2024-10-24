#!/usr/bin/env node
import { program } from "commander";
import * as process from "process";
import { GenerateCommand } from "../src/commands/generate.command";
import { NewCommand } from "../src/commands/new.command";

const main = async () => {
	program
		.name("clean-nest")
		.version(require("../package.json").version, "-v, --version", "output the current version")
		.usage("<command> [options]")
		.helpOption("-h, --help");

	new GenerateCommand().load(program);
	new NewCommand().load(program);

	program.parse(process.argv);
};

main();
