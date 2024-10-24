export const controllerElement = (
	capitalizedUseCaseName: string,
	resourceNameKebab: string,
	controllerRoute: string,
	decapitalizedUseCaseName: string
) => `import { Controller, Get } from "@nestjs/common";
import { ${capitalizedUseCaseName}UseCase } from "./${resourceNameKebab}.use-case";

@Controller("${controllerRoute}")
export class ${capitalizedUseCaseName}Controller {
	constructor(private readonly ${decapitalizedUseCaseName}UseCase: ${capitalizedUseCaseName}UseCase) {}

	@Get("${resourceNameKebab}")
	async execute() {
		return await this.${decapitalizedUseCaseName}UseCase.execute();
	}
}
`;
