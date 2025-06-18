export abstract class IGenerator {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string): Promise<void> {
		throw new Error("Method 'generate' must be implemented in subclass");
	}
}

export interface IGeneratorOptions {
	path: string;
	spec: boolean;
}
