export const repositoryElement = (repositoryName: string, resourceNameKebab: string): string => `import { Injectable } from "@nestjs/common";
import { I${repositoryName}Repository } from "../models/interfaces/${resourceNameKebab}-repository.interface";

@Injectable()
export class ${repositoryName}TypeOrmRepository implements I${repositoryName}Repository {
	// Implements the methods defined in the interface
}
`;
