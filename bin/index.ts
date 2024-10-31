#!/usr/bin/env node
import { program } from "commander";
import { localLibraryExists, localLibraryPath } from "../src/utils/local-library";
import { LoaderCommand } from "../src/commands/loader.command";

const main = async () => {
	localLibraryExists() ? await localLibraryPath().execute(program) : await LoaderCommand.execute(program);
	await program.parseAsync(process.argv);
};

main();
