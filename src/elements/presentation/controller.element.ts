export const controllerElement = (moduleName: string, controllerRoute: string): string => `import { Controller } from "@nestjs/common";

@Controller("${controllerRoute}")
export class ${moduleName}Controller {
}
`;
