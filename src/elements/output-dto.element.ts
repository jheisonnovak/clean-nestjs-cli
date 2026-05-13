export const outputDtoElement = (dtoName: string): string => `export class ${dtoName} {
	readonly id: string;

	constructor(id: string) {
		this.id = id;
	}

	static empty(): ${dtoName} {
		return new ${dtoName}("");
	}
}
`;
