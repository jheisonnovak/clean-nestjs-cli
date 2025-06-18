export const useCaseElement = (capitalizedUseCaseName: string): string => `import { Injectable } from "@nestjs/common";

@Injectable()
export class ${capitalizedUseCaseName}UseCase {
	async execute(): Promise<void> {
		// Implement the use case
	}
}
`;
