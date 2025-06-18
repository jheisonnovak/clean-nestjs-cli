import { existsSync } from "fs";
import { join } from "path";
import { LoaderCommand } from "../commands/loader.command";

const localPath = [process.cwd(), "node_modules", "clean-nestjs-cli", "src", "commands"];

export const localLibraryExists = (): boolean => {
	return existsSync(join(...localPath, "loader.command.js"));
};

export const localLibraryPath = async (): Promise<typeof LoaderCommand> => {
	const module = await import(join(...localPath, "loader.command"));
	return module.LoaderCommand;
};
