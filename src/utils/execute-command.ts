import { exec } from "child_process";

export const executeCommand = (command: string, projectDir: string) =>
	new Promise((resolve, reject) => {
		exec(command, { cwd: projectDir }, (err, stdout, stderr) => {
			if (err) {
				reject(err);
			}
			resolve(stdout);
		});
	});
