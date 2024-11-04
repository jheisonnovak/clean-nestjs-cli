import { ModuleGenerator } from "../generators/module.generator";
import { RepositoryGenerator } from "../generators/repository.generator";
import { UseCaseGenerator } from "../generators/use-case.generator";

export const generators = {
	module: ModuleGenerator,
	mo: ModuleGenerator,
	repository: RepositoryGenerator,
	rp: RepositoryGenerator,
	"use-case": UseCaseGenerator,
	uc: UseCaseGenerator,
};

export function getGenerator(type: string) {
	return generators[type as keyof typeof generators] || null;
}

export const getNameAliasPairs = () => {
	const names = Object.keys(generators);
	const pairs = [];
	for (let i = 0; i < names.length; i += 2) {
		const name = names[i];
		const alias = names[i + 1];
		pairs.push(`${name}|${alias}`);
	}
	return pairs.join(", ");
};
