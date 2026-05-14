export const presentationRequestDtoElement = (dtoName: string): string => `import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ${dtoName} {
	@ApiPropertyOptional()
	@IsOptional()
	readonly id?: string;
}
`;

export const presentationResponseDtoElement = (dtoName: string, outputDtoName: string, outputDtoFileName: string): string => `import { ApiProperty } from "@nestjs/swagger";

import { ${outputDtoName} } from "../../application/dtos/${outputDtoFileName}.dto";

export class ${dtoName} {
	@ApiProperty()
	readonly id: string;

	constructor(id: string) {
		this.id = id;
	}

	static fromOutput(output: ${outputDtoName}): ${dtoName} {
		return new ${dtoName}(output.id);
	}
}
`;
