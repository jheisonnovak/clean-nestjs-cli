import { existsSync } from "fs";
import { join } from "path";
import { LoaderCommand } from "../commands/loader.command";

const localPath = [process.cwd(), "node_modules", "clean-nestjs-cli", "src", "commands"];

export const localLibraryExists = () => {
	return existsSync(join(...localPath, "loader.command.js"));
};

export const localLibraryPath = (): typeof LoaderCommand => {
	return require(join(...localPath, "loader.command")).LoaderCommand;
};
