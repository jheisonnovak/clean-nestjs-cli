export const domainErrorElement = (errorName: string): string => `export class ${errorName} extends Error {
	constructor(message = "${errorName}") {
		super(message);
		this.name = "${errorName}";
	}
}
`;
