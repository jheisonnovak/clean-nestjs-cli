export interface UseCaseElementOptions {
	capitalizedUseCaseName: string;
	inputDtoFileName?: string;
	inputDtoName?: string;
	outputDtoFileName?: string;
	outputDtoName?: string;
	outputIsArray?: boolean;
	usesId?: boolean;
}

export const useCaseElement = ({
	capitalizedUseCaseName,
	inputDtoFileName,
	inputDtoName,
	outputDtoFileName,
	outputDtoName,
	outputIsArray,
	usesId,
}: UseCaseElementOptions): string => `import { Injectable } from "@nestjs/common";
${inputDtoName && inputDtoFileName ? `import { ${inputDtoName} } from "../../dtos/${inputDtoFileName}.dto";` : ""}${
	outputDtoName && outputDtoFileName ? `\nimport { ${outputDtoName} } from "../../dtos/${outputDtoFileName}.dto";` : ""
}

@Injectable()
export class ${capitalizedUseCaseName}UseCase {
	async execute(${[usesId ? "id: string" : "", inputDtoName ? `dto: ${inputDtoName}` : ""].filter(Boolean).join(", ")}): Promise<${outputDtoName ? `${outputDtoName}${outputIsArray ? "[]" : ""}` : "void"}> {
		// Implement the use case
		${outputDtoName ? `return ${outputIsArray ? "[]" : `${outputDtoName}.empty()`};` : ""}
	}
}
`;
