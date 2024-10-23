import * as path from "path";

export const createModulePath = (resourcePath: string, moduleName: string) => {
	if (resourcePath) {
		return resourcePath.includes(moduleName) ? resourcePath : path.join(resourcePath, moduleName);
	}
	return moduleName;
};
