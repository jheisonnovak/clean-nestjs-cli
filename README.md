<p align="center">
    <a href="https://www.npmjs.com/package/clean-nestjs-cli"><img src="https://img.shields.io/npm/v/clean-nestjs-cli.svg" alt ="NPM Version"></a> <a href="https://www.npmjs.com/package/clean-nestjs-cli"><img src="https://img.shields.io/npm/l/clean-nestjs-cli.svg" alt ="License"></a> <a href="https://www.npmjs.com/package/clean-nestjs-cli"><img src="https://img.shields.io/npm/d18m/clean-nestjs-cli.svg" alt ="Downloads"></a>
</p>
<h1 align="center">Clean NestJS CLI</h1>

## Description

A command-line interface for creating NestJS projects and modules using a layered Clean Architecture.

Version 3 generates a new module structure with explicit `domain`, `application`, `infrastructure`, and `presentation` layers. The old v2 flat structure is no longer generated.

## Installation

```bash
npm install -g clean-nestjs-cli
```

Or:

```bash
yarn global add clean-nestjs-cli
```

Or:

```bash
pnpm add -g clean-nestjs-cli
```

## Usage

Use either `clean-nest` or `cnest`.

```bash
cnest <command> [options]
```

## Commands

### `new <project-name>`

Creates a new NestJS project and writes a `clean-nest.json` file.

```bash
cnest new my-api
```

Options:

- `--no-linters`: disables ESLint and Prettier files.

During creation, choose one persistence option:

- `typeorm`
- `prisma`
- `none`

### `generate <schematic> <module> [resource]`

Generates files inside `src/modules`.

```bash
cnest generate module user
cnest generate use-case user create-user
cnest generate repository user profile
cnest generate entity user address
cnest generate error user user-not-found --layer application
```

Alias:

```bash
cnest g module user
```

Available schematics:

- `module|mo`
- `repository|rp`
- `use-case|uc`
- `entity|e`
- `error|er`

Options:

- `--path <path>`: destination path inside `src/modules`.
- `--orm <typeorm|prisma|none>`: overrides the ORM from `clean-nest.json`.
- `--layer <domain|application>`: used by `error`.
- `--no-spec`: disables spec generation where applicable.

## Configuration

Version 3 projects include:

```json
{
	"version": 3,
	"architecture": "layered-clean",
	"orm": "typeorm"
}
```

The ORM resolution order is:

1. `--orm` command option.
2. `clean-nest.json`.
3. `typeorm` fallback.

## Folder Structure

Generated modules follow this structure:

```txt
src/modules/user/
  user.module.ts
  domain/
    entities/
    enums/
    errors/
    repositories/
  application/
    dtos/
    errors/
    ports/
    use-cases/
  infrastructure/
    persistence/
    repositories/
    mappers/
  presentation/
    controllers/
    dtos/
    mappers/
```

Layer rules:

- `domain` does not depend on NestJS, ORM libraries, or other layers.
- `application` depends on `domain`.
- `presentation` depends on `application`.
- `infrastructure` depends on `domain` and may implement `application/ports`.

## Version 3 Breaking Changes

- The v2 flat folders `models`, `repositories`, and root `use-cases` are no longer generated.
- Controllers are generated per module in `presentation/controllers`, not beside each use case.
- Repository contracts live in `domain/repositories`.
- Repository injection tokens use exported symbols such as `USER_REPOSITORY`.
- TypeORM and Prisma generate different infrastructure adapter files.
- Existing v2 projects are not migrated automatically.

## Author

**Jheison Novak**

- [GitHub Profile](https://github.com/jheisonnovak)
- [LinkedIn Profile](https://www.linkedin.com/in/jheison-novak)

## License

Copyright (c) 2024, [Jheison Novak](https://github.com/jheisonnovak).
Released under the [MIT License](LICENSE).
