export const tsconfigElement = (): string => `{
	"compilerOptions": {
		"module": "commonjs",
		"declaration": true,
		"removeComments": true,
		"emitDecoratorMetadata": true,
		"experimentalDecorators": true,
		"allowSyntheticDefaultImports": true,
		"target": "ES2021",
		"sourceMap": true,
		"outDir": "./dist",
		"baseUrl": "./",
		"incremental": true,
		"skipLibCheck": true,
		"strictNullChecks": false,
		"noImplicitAny": false,
		"strictBindCallApply": false,
		"forceConsistentCasingInFileNames": false,
		"noFallthroughCasesInSwitch": false
	}
}
`;
