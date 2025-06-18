export const getInstallCommand = (packageManager: string): string => {
	return packageManager === "npm" ? "install" : "add";
};
