export const typeOrmRepositoryElement = (
	repositoryName: string,
	repositoryInterfaceName: string,
	resourceNameKebab: string
): string => `import { Injectable } from "@nestjs/common";
import { ${repositoryInterfaceName} } from "../../domain/repositories/${resourceNameKebab}.repository";

@Injectable()
export class ${repositoryName} implements ${repositoryInterfaceName} {
	// Implements the methods defined in the domain repository contract.
}
`;

export const prismaRepositoryElement = (
	repositoryName: string,
	repositoryInterfaceName: string,
	resourceNameKebab: string
): string => `import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/databases/prisma.service";
import { ${repositoryInterfaceName} } from "../../domain/repositories/${resourceNameKebab}.repository";

@Injectable()
export class ${repositoryName} implements ${repositoryInterfaceName} {
	constructor(private readonly prisma: PrismaService) {}

	// Implements the methods defined in the domain repository contract.
}
`;
