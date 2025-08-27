export const controllerElement = (
	capitalizedUseCaseName: string,
	resourceNameKebab: string,
	controllerRoute: string,
	decapitalizedUseCaseName: string,
	controllerMethod: "Get" | "Post" | "Patch" | "Delete",
	controllerPath: string | undefined
): string => `import { Controller, ${controllerMethod} } from "@nestjs/common";
import { ${capitalizedUseCaseName}UseCase } from "./${resourceNameKebab}.use-case";

@Controller("${controllerRoute}")
export class ${capitalizedUseCaseName}Controller {
	constructor(private readonly ${decapitalizedUseCaseName}UseCase: ${capitalizedUseCaseName}UseCase) {}

	@${controllerMethod}(${controllerPath ? `"${controllerPath}"` : ""})
	async execute(): Promise<void> {
		return await this.${decapitalizedUseCaseName}UseCase.execute();
	}
}
`;
