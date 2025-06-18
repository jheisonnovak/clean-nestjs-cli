import * as path from "path";

export const createModulePath = (resourcePath: string, moduleName: string): string => {
	if (resourcePath !== "/") {
		return resourcePath.includes(moduleName) ? resourcePath : path.posix.join(resourcePath, moduleName);
	}
	return moduleName;
};
