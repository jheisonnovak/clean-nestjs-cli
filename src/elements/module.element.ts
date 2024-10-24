export const moduleElement = (moduleName: string, resourceNameKebab: string): string => `import { Module } from "@nestjs/common";
import { ${moduleName}TypeOrmRepository } from "./repositories/${resourceNameKebab}.repository";

@Module({
	providers: [
		${moduleName}TypeOrmRepository,
		{
			provide: "I${moduleName}Repository",
			useExisting: ${moduleName}TypeOrmRepository,
		},
	],
	exports: ["I${moduleName}Repository"],
})
export class ${moduleName}Module {}

`;
