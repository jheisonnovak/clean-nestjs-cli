export const repositoryElement = (moduleName: string, resourceNameKebab: string): string => `import { Injectable } from "@nestjs/common";
import { I${moduleName}Repository } from "../models/interfaces/${resourceNameKebab}-repository.interface";

@Injectable()
export class ${moduleName}TypeOrmRepository implements I${moduleName}Repository {
	// Implements the methods defined in the interface
}
`;
