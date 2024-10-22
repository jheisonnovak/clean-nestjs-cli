import { ModuleGenerator } from "../generators/module.generator";
import { RepositoryGenerator } from "../generators/repository.generator";
import { UseCaseGenerator } from "../generators/use-case.generator";

const generators = {
	module: ModuleGenerator,
	repository: RepositoryGenerator,
	"use-case": UseCaseGenerator,
};

export function getGenerator(type: string) {
	return generators[type as keyof typeof generators] || null;
}
