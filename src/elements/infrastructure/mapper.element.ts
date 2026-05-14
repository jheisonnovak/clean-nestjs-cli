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
