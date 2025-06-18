export const getDevCommand = (packageManager: string): string => {
	return packageManager === "yarn" ? "--dev" : "--save-dev";
};
