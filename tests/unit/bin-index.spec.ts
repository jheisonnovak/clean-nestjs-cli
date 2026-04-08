import { beforeEach, describe, expect, it, vi } from "vitest";

const flushMainExecution = async (): Promise<void> => {
	await new Promise(resolve => setTimeout(resolve, 0));
};

describe("bin/index", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("usa LoaderCommand padrao quando biblioteca local nao existe", async () => {
		const parseAsync = vi.fn().mockResolvedValue(undefined);
		const program = { parseAsync };
		const defaultExecute = vi.fn().mockResolvedValue(undefined);
		const localExecute = vi.fn().mockResolvedValue(undefined);

		vi.doMock("commander", () => ({ program }));
		vi.doMock("../../src/utils/local-library", () => ({
			localLibraryExists: vi.fn(() => false),
			localLibraryPath: vi.fn(async () => ({ execute: localExecute })),
		}));
		vi.doMock("../../src/commands/loader.command", () => ({
			LoaderCommand: { execute: defaultExecute },
		}));

		await import("../../bin/index");
		await flushMainExecution();

		expect(defaultExecute).toHaveBeenCalledWith(program);
		expect(localExecute).not.toHaveBeenCalled();
		expect(parseAsync).toHaveBeenCalledWith(process.argv);
	});

	it("usa LoaderCommand local quando biblioteca local existe", async () => {
		const parseAsync = vi.fn().mockResolvedValue(undefined);
		const program = { parseAsync };
		const defaultExecute = vi.fn().mockResolvedValue(undefined);
		const localExecute = vi.fn().mockResolvedValue(undefined);

		vi.doMock("commander", () => ({ program }));
		vi.doMock("../../src/utils/local-library", () => ({
			localLibraryExists: vi.fn(() => true),
			localLibraryPath: vi.fn(async () => ({ execute: localExecute })),
		}));
		vi.doMock("../../src/commands/loader.command", () => ({
			LoaderCommand: { execute: defaultExecute },
		}));

		await import("../../bin/index");
		await flushMainExecution();

		expect(localExecute).toHaveBeenCalledWith(program);
		expect(defaultExecute).not.toHaveBeenCalled();
		expect(parseAsync).toHaveBeenCalledWith(process.argv);
	});
});
