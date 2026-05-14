export const presentationMapperElement = (
	mapperName: string,
	responseDtoName: string,
	outputDtoName: string,
	resourceNameKebab: string
): string => `import { ${outputDtoName} } from "../../application/dtos/${resourceNameKebab}-output.dto";
import { ${responseDtoName} } from "../dtos/${resourceNameKebab}.response.dto";

export class ${mapperName} {
	static one(output: ${outputDtoName}): ${responseDtoName} {
		return ${responseDtoName}.fromOutput(output);
	}

	static list(outputs: ${outputDtoName}[]): ${responseDtoName}[] {
		return outputs.map(output => ${responseDtoName}.fromOutput(output));
	}
}
`;
