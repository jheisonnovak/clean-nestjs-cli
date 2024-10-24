# Description

**Clean NestJS CLI** is a command-line interface tool designed to streamline the creation and management of NestJS projects following Clean Architecture principles.

## Installation

```bash
npm install -g clean-nestjs-cli
```

Or

```bash
yarn global add clean-nestjs-cli
```

Or

```bash
pnpm add -g clean-nestjs-cli
```

## Global Options

`-v, --version`: Outputs the current version of the CLI.

Example:

```bash
clean-nest -v
```

`-h, --help`: Displays help with all available commands and their options.

Example:

```bash
clean-nest -h
```

## Usage

After installation, you can access the CLI using the `clean-nest` or `cnest` command.

```bash
cnest <command> [options]
```

### Available Commands

`new <project-name> [options]`

Creates a new project with a clean and structured setup.

**Alias**: `n`

```bash
clean-nest new my-new-project
```

**Options:**

-   `--no-linters`: Disables linters (enabled by default).

    Example:

    ```bash
    clean-nest new my-new-project --no-linters
    ```

#### `generate <schematics> <module> [resource] [options]`

Generates a new element in your project, such as modules or resources.

**Alias**: `g`

```bash
clean-nest generate module user
```

**Options:**

-   `--path <path>`: Specifies the destination directory inside the `/src/modules` folder. The default path is the module root (`/`).

    Example:

    ```bash
    clean-nest generate module user --path auth
    ```

## Folder Structure

When using the `new` command, a NestJS project with the following clean structure will be created:

```
my-new-project/
├──src/
│  ├── modules/
│  │   ├── module-example/
│  │   │   ├── models/
│  │   │   │   ├── dtos/
│  │   │   │   ├── entities/
│  │   │   │   ├── interfaces/
│  │   │   │   ├── enums/
│  │   │   ├── repositories/
│  │   │   ├── use-cases/
│  │   │   │   ├── use-case-example-1/
│  │   │   │   └── use-case-example-2/
│  ├── app.module.ts
│  └── main.ts
│  ├── shared/
│  │   ├── config/
└── ...
```

## Contribution

Contributions are welcome! Feel free to open issues and pull requests on the official repository.

## License

This project is licensed under the [MIT License](./LICENSE).
