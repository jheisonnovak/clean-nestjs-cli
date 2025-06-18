import { spawn } from "child_process";

export const executeCommand = (command: string, projectDir: string): Promise<string> =>
	new Promise((resolve, reject) => {
		const parts = parseCommand(command);
		const program = parts[0];
		const args = parts.slice(1);

		const child = spawn(program, args, {
			cwd: projectDir,
			shell: true,
			stdio: ["pipe", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", data => {
			stdout += data.toString();
		});

		child.stderr?.on("data", data => {
			stderr += data.toString();
		});

		child.on("close", code => {
			if (code !== 0) {
				reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
			} else {
				resolve(stdout);
			}
		});

		child.on("error", err => {
			reject(err);
		});
	});

function parseCommand(command: string): string[] {
	const parts: string[] = [];
	let current = "";
	let inQuotes = false;
	let quoteChar = "";

	for (let i = 0; i < command.length; i++) {
		const char = command[i];

		if ((char === '"' || char === "'") && !inQuotes) {
			inQuotes = true;
			quoteChar = char;
		} else if (char === quoteChar && inQuotes) {
			inQuotes = false;
			quoteChar = "";
		} else if (char === " " && !inQuotes) {
			if (current.trim()) {
				parts.push(current.trim());
				current = "";
			}
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		parts.push(current.trim());
	}

	return parts;
}
