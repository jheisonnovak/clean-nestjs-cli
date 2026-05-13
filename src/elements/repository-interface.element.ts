export const repositoryInterfaceElement = (repositoryName: string, tokenName: string): string => `export const ${tokenName} = Symbol("${tokenName}");

export interface ${repositoryName} {
	// Defines the methods that the repository must implement.
}
`;
