export const tsconfigBuildElement = () => `{
    "extends": "./tsconfig.json",
    "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
`;
