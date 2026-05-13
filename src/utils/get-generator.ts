import { EntityGenerator } from "../generators/entity.generator";
import { ErrorGenerator } from "../generators/error.generator";
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
	entity: EntityGenerator,
	e: EntityGenerator,
	error: ErrorGenerator,
	er: ErrorGenerator,
};

export function getGenerator(type: string): (typeof generators)[keyof typeof generators] | null {
	return generators[type as keyof typeof generators] || null;
}

export const getNameAliasPairs = (): string => {
	const names = Object.keys(generators);
	const pairs = [];
	for (let i = 0; i < names.length; i += 2) {
		const name = names[i];
		const alias = names[i + 1];
		pairs.push(`${name}|${alias}`);
	}
	return pairs.join(", ");
};
