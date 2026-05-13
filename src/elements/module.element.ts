export const moduleElement = (moduleName: string): string => `import { Module } from "@nestjs/common";

@Module({})
export class ${moduleName}Module {}
`;
