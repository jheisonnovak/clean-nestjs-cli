export interface UseCaseElementOptions {
	capitalizedUseCaseName: string;
	inputDtoFileName?: string;
	inputDtoName?: string;
	outputDtoFileName?: string;
	outputDtoName?: string;
	usesId?: boolean;
}

export const useCaseElement = ({
	capitalizedUseCaseName,
	inputDtoFileName,
	inputDtoName,
	outputDtoFileName,
	outputDtoName,
	usesId,
}: UseCaseElementOptions): string => `import { Injectable } from "@nestjs/common";
${inputDtoName && inputDtoFileName ? `import { ${inputDtoName} } from "../../dtos/${inputDtoFileName}.dto";` : ""}${
	outputDtoName && outputDtoFileName ? `\nimport { ${outputDtoName} } from "../../dtos/${outputDtoFileName}.dto";` : ""
}

@Injectable()
export class ${capitalizedUseCaseName}UseCase {
	async execute(${[usesId ? "id: string" : "", inputDtoName ? `dto: ${inputDtoName}` : ""].filter(Boolean).join(", ")}): Promise<${outputDtoName ?? "void"}> {
		// Implement the use case
		${outputDtoName ? `return ${outputDtoName}.empty();` : ""}
	}
}
`;
