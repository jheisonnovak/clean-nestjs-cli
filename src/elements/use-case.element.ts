export const useCaseElement = (capitalizedUseCaseName: string, inputDtoName?: string, outputDtoName?: string): string => `import { Injectable } from "@nestjs/common";
${inputDtoName ? `import { ${inputDtoName} } from "../../dtos/${inputDtoName.replace(/Dto$/, "").replace(/[A-Z]/g, match => `-${match.toLowerCase()}`).replace(/^-/, "")}.dto";` : ""}${
	outputDtoName ? `\nimport { ${outputDtoName} } from "../../dtos/${outputDtoName.replace(/Dto$/, "").replace(/[A-Z]/g, match => `-${match.toLowerCase()}`).replace(/^-/, "")}.dto";` : ""
}

@Injectable()
export class ${capitalizedUseCaseName}UseCase {
	async execute(${inputDtoName ? `dto: ${inputDtoName}` : ""}): Promise<${outputDtoName ?? "void"}> {
		// Implement the use case
		${outputDtoName ? `return ${outputDtoName}.empty();` : ""}
	}
}
`;
