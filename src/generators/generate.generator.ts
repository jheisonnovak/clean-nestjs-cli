export class IGenerator {
	static generate(moduleNameKebab: string, options: IGeneratorOptions, resourceNameKebab?: string) {}
}

export interface IGeneratorOptions {
	path: string;
	spec: boolean;
}
