export const useCaseElement = (capitalizedUseCaseName: string) => `import { Injectable } from "@nestjs/common";

@Injectable()
export class ${capitalizedUseCaseName}UseCase {
	async execute() {
		// Implement the use case
	}
}
`;
