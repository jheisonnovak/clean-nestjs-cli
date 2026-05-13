export const infrastructureMapperElement = (
	mapperName: string,
	domainEntityName: string,
	persistenceEntityName: string,
	resourceNameKebab: string
): string => `import { ${domainEntityName} } from "../../domain/entities/${resourceNameKebab}.entity";
import { ${persistenceEntityName} } from "../persistence/${resourceNameKebab}.orm.entity";

export class ${mapperName} {
	static toDomain(entity: ${persistenceEntityName}): ${domainEntityName} {
		return new ${domainEntityName}(entity.id);
	}

	static toOrm(entity: ${domainEntityName}): ${persistenceEntityName} {
		return new ${persistenceEntityName}({ id: entity.id });
	}
}
`;

export const presentationMapperElement = (
	mapperName: string,
	responseDtoName: string,
	outputDtoName: string,
	resourceNameKebab: string
): string => `import { ${outputDtoName} } from "../../application/dtos/${resourceNameKebab}-output.dto";
import { ${responseDtoName} } from "../dtos/${resourceNameKebab}.response.dto";

export class ${mapperName} {
	static one(output: ${outputDtoName}): ${responseDtoName} {
		return ${responseDtoName}.fromOutput(output);
	}

	static list(outputs: ${outputDtoName}[]): ${responseDtoName}[] {
		return outputs.map(output => ${responseDtoName}.fromOutput(output));
	}
}
`;
