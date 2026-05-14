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

Prisma projects are generated with `prisma` and `@prisma/client` pinned to `6.19.3`, a SQLite datasource by default, and `prisma generate` is run during project creation. When using `pnpm`, the CLI also creates `pnpm-workspace.yaml` with the known build scripts allowed so dependency installation does not stop at `pnpm approve-builds`.

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
- `--no-controller`: skips presentation controller and presentation DTO generation for use cases used by jobs, consumers, queues, or other non-HTTP integrations.
- `--no-spec`: disables spec generation where applicable.

### `config`

Creates or updates local CLI preferences.

```bash
cnest config init
cnest config set formatting.indentation spaces
cnest config set formatting.tabWidth 2
cnest config set formatting.printWidth 100
```

`config init` writes:

- `clean-nest.json`
- `.prettierrc`
- `.editorconfig`

`config set` keeps those three files in sync. If you change indentation in an existing project, run the project formatter afterwards so existing files are rewritten:

```bash
npm run format
```

## Configuration

Version 3 projects include:

```json
{
	"version": 3,
	"architecture": "layered-clean",
	"orm": "typeorm",
	"formatting": {
		"indentation": "tabs",
		"printWidth": 150,
		"tabWidth": 4
	}
}
```

The ORM resolution order is:

1. `--orm` command option.
2. `clean-nest.json`.
3. `typeorm` fallback.

When creating a project, the CLI also reads formatting preferences from an existing `clean-nest.json` or `.prettierrc` in the current directory and writes them into the generated project. Generated files are written using the resolved indentation preference, and generated projects always include `.editorconfig`.

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

Route names are pluralized by default, with conventional singleton routes such as `auth` and `health` kept singular.

Use case output generation follows a naming heuristic:

- CRUD-like actions such as `create-*`, `find-*`, `list-*`, and `update-*` use the module output DTO.
- List actions return arrays of the module output DTO.
- Actions such as `delete-*`, `remove-*`, and `logout` return `void`.
- Non-CRUD actions such as `login` and `refresh-token` get use-case-specific output and response DTOs.
- `find-one`, `find-one-*`, `find-by-id`, and `find-by-id-*` generate `:id` controller routes when controller generation is enabled.
- Bare CRUD names are completed with the module resource name. For example, `cnest g use-case user create` generates `create-user` and `CreateUserUseCase`.

## Version 3 Breaking Changes

- The v2 flat folders `models`, `repositories`, and root `use-cases` are no longer generated.
- Controllers are generated per module in `presentation/controllers`, not beside each use case.
- Repository contracts live in `domain/repositories`.
- Repository injection tokens use exported symbols such as `USER_REPOSITORY`.
- TypeORM and Prisma generate different infrastructure adapter files.
- Existing v2 projects are not migrated automatically.
- New projects install the CLI using the version that created the project instead of forcing `clean-nestjs-cli@latest`, as long as that version is already published.

## Author

**Jheison Novak**

- [GitHub Profile](https://github.com/jheisonnovak)
- [LinkedIn Profile](https://www.linkedin.com/in/jheison-novak)

## License

Copyright (c) 2024, [Jheison Novak](https://github.com/jheisonnovak).
Released under the [MIT License](LICENSE).
