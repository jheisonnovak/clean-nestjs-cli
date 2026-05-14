export const domainEntityElement = (entityName: string): string => `export class ${entityName} {
	constructor(public readonly id: string) {}
}
`;
