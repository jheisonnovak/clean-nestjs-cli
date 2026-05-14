export const readmeElement = (packageManager: string): string => `<p align="center">
    <a href="https://www.npmjs.com/package/clean-nestjs-cli"><img src="https://img.shields.io/npm/v/clean-nestjs-cli.svg" alt ="NPM Version"></a> <a href="https://www.npmjs.com/package/clean-nestjs-cli"><img src="https://img.shields.io/npm/l/clean-nestjs-cli.svg" alt ="License"></a> <a href="https://www.npmjs.com/package/clean-nestjs-cli"><img src="https://img.shields.io/npm/d18m/clean-nestjs-cli.svg" alt ="Downloads"></a>
</p>
<h1 align="center">Clean Architecture Project</h1>
This project was created using <a href="https://github.com/JheisonNovak/clean-nestjs-cli">Clean NestJS CLI</a>

## Description

Clean architecture [Nest](https://github.com/nestjs/nest) project.

## Start the project

\`\`\`bash
${packageManager} install
\`\`\`

## Compile your project

The basic commands to run your project:

-   Run to start

    \`\`\`bash
    ${packageManager} run start
    \`\`\`

-   Run in watch mode

    \`\`\`bash
    ${packageManager} run start:dev
    \`\`\`

-   Run in production mode

    \`\`\`bash
    ${packageManager} run start:prod
    \`\`\`

## Tests

Run tests

\`\`\`bash
# unit tests
${packageManager} run test

# e2e tests
${packageManager} run test:e2e

# test coverage
${packageManager} run test:cov
\`\`\`

## Documentation

Please refer to the [NestJS Documentation](https://docs.nestjs.com) for more information on how to compile your project.

## Contact us

-   [GitHub Profile](https://github.com/JheisonNovak)
-   [LinkedIn Profile](https://www.linkedin.com/in/jheison-novak)

## License

Copyright © 2024, [Jheison Novak](https://github.com/JheisonNovak).
Released under the [MIT License](LICENSE).
`;
