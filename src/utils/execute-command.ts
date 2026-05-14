import { spawn } from "child_process";

export const executeCommand = (command: string, projectDir: string): Promise<string> =>
	new Promise((resolve, reject) => {
		const child = spawn(command, {
			cwd: projectDir,
			shell: true,
			stdio: ["pipe", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (data: Buffer) => {
			stdout += data.toString();
		});

		child.stderr?.on("data", (data: Buffer) => {
			stderr += data.toString();
		});

		child.on("close", (code: number | null) => {
			if (code !== 0) {
				reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
			} else {
				resolve(stdout);
			}
		});

		child.on("error", (err: Error) => {
			reject(err);
		});
	});
