#!/usr/bin/env node
import { program } from "commander";
import { LoaderCommand } from "../src/commands/loader.command";
import { localLibraryExists, localLibraryPath } from "../src/utils/local-library";

const main = async () => {
	if (localLibraryExists()) await localLibraryPath().execute(program);
	else await LoaderCommand.execute(program);
	await program.parseAsync(process.argv);
};

main();
