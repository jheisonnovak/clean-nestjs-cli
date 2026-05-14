export const specElement = (
	capitalizedUseCaseName: string,
	decapitalizedUseCaseName: string,
	resourceNameKebab: string
): string => `import { Test, TestingModule } from "@nestjs/testing";
import { ${capitalizedUseCaseName}UseCase } from "./${resourceNameKebab}.use-case";

describe("${capitalizedUseCaseName}", () => {
	let ${decapitalizedUseCaseName}UseCase: ${capitalizedUseCaseName}UseCase;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [${capitalizedUseCaseName}UseCase],
		}).compile();

		${decapitalizedUseCaseName}UseCase = module.get<${capitalizedUseCaseName}UseCase>(${capitalizedUseCaseName}UseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(${decapitalizedUseCaseName}UseCase).toBeDefined();
	});

	describe("execute", () => {
		// add test cases
	});
});
`;
