export const specElement = (
	capitalizedUseCaseName: string,
	moduleNameKebab: string,
	moduleNameCamel: string,
	decapitalizedUseCaseName: string,
	capitalizedModuleName: string,
	resourceNameKebab: string
): string => `import { Test, TestingModule } from "@nestjs/testing";
import { ${capitalizedUseCaseName}UseCase } from "./${resourceNameKebab}.use-case";
import { I${capitalizedModuleName}Repository } from "../../models/interfaces/${moduleNameKebab}-repository.interface";

describe("${capitalizedUseCaseName}", () => {
	let ${decapitalizedUseCaseName}UseCase: ${capitalizedUseCaseName}UseCase;
	let ${moduleNameCamel}Repository: I${capitalizedModuleName}Repository;
	const mockRepository = {};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [${capitalizedUseCaseName}UseCase, { provide: "I${capitalizedModuleName}Repository", useValue: mockRepository }],
		}).compile();

		${decapitalizedUseCaseName}UseCase = module.get<${capitalizedUseCaseName}UseCase>(${capitalizedUseCaseName}UseCase);
		${moduleNameCamel}Repository = module.get<I${capitalizedModuleName}Repository>("I${capitalizedModuleName}Repository");
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(${decapitalizedUseCaseName}UseCase).toBeDefined();
		expect(${moduleNameCamel}Repository).toBeDefined();
	});

	describe("execute", () => {
		// add test cases
	});
});
`;
