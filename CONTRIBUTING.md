# Contributing to Clean NestJS CLI

Thank you for your interest in contributing to Clean NestJS CLI! This document provides guidelines and information on how to contribute to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Reporting Issues](#reporting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm, yarn, or pnpm
- Git
- TypeScript knowledge
- Familiarity with NestJS and Clean Architecture principles

### Development Setup

1. **Fork the repository**

    ```bash
    # Click the "Fork" button on GitHub
    ```

2. **Clone your fork**

    ```bash
    git clone https://github.com/YOUR_USERNAME/clean-nestjs-cli.git
    cd clean-nestjs-cli
    ```

3. **Add upstream remote**

    ```bash
    git remote add upstream https://github.com/JheisonNovak/clean-nestjs-cli.git
    ```

4. **Install dependencies**

    ```bash
    npm install
    ```

5. **Build the project**

    ```bash
    npm run build
    ```

6. **Link the CLI globally for testing**
    ```bash
    npm link
    ```

Now you can use `clean-nest` or `cnest` commands globally to test your changes.

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes** - Fix existing issues
- **Feature enhancements** - Improve existing functionality
- **New features** - Add new commands or generators
- **Documentation** - Improve README, add examples, or create tutorials
- **Code quality** - Refactoring, performance improvements
- **Tests** - Add or improve test coverage

### Before You Start

1. **Check existing issues** - Look for existing issues or feature requests
2. **Create an issue** - If your contribution is significant, create an issue first to discuss it
3. **Get feedback** - Wait for maintainer feedback before starting major work

## Reporting Issues

When reporting issues, please include:

### Bug Reports

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**

1. Run command '...'
2. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**

- OS: [e.g., Windows 11, macOS 14, Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- CLI version: [e.g., 2.1.0]
- Package manager: [e.g., npm, yarn, pnpm]

**Additional Context**
Add any other context about the problem here.
```

### Feature Requests

```markdown
**Feature Description**
A clear description of what you want to happen.

**Use Case**
Describe the use case and why this feature would be useful.

**Proposed Solution**
Describe how you envision this feature working.

**Alternatives Considered**
Describe any alternative solutions you've considered.
```

## Submitting Pull Requests

### Pull Request Process

1. **Create a feature branch**

    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/issue-number-description
    ```

2. **Make your changes**

    - Follow the coding standards
    - Add tests if applicable
    - Update documentation if needed

3. **Test your changes**

    ```bash
    npm run build
    # Test the CLI manually
    clean-nest --help
    ```

4. **Commit your changes**

    ```bash
    git add .
    git commit -m "feat: add new feature description"
    # Follow conventional commit format
    ```

5. **Push to your fork**

    ```bash
    git push origin feature/your-feature-name
    ```

6. **Create a Pull Request**
    - Go to GitHub and create a PR from your fork
    - Fill out the PR template
    - Link any related issues

### Pull Request Guidelines

- **Title**: Use a descriptive title following conventional commits
- **Description**: Clearly describe what your PR does and why
- **Testing**: Describe how you tested your changes
- **Documentation**: Update relevant documentation
- **Breaking Changes**: Clearly mark any breaking changes

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Style

- **Formatting**: Use Prettier (configured in the project)
- **Linting**: Use ESLint (configured in the project)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required

### Running Code Quality Checks

```bash
# Format code
npx prettier --write .

# Lint code
npx eslint . --fix

# Type check
npx tsc --noEmit
```

## Project Structure

Understanding the project structure will help you contribute effectively:

```
clean-nestjs-cli/
├── bin/                    # CLI entry point
├── src/
│   ├── commands/          # CLI command definitions
│   ├── elements/          # File template elements
│   ├── generators/        # Code generators
│   └── utils/            # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

### Key Components

- **Commands** (`src/commands/`): Define CLI commands and their options
- **Elements** (`src/elements/`): Template files for code generation
- **Generators** (`src/generators/`): Logic for generating files and project structures
- **Utils** (`src/utils/`): Helper functions and utilities

### Adding New Features

When adding new features:

1. **Commands**: Add new command definitions in `src/commands/`
2. **Templates**: Create new templates in `src/elements/`
3. **Generators**: Implement generation logic in `src/generators/`
4. **Types**: Update TypeScript interfaces as needed

## Getting Help

If you need help:

- **Documentation**: Check the README and this contributing guide
- **Issues**: Search existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions
- **Contact**: Reach out to maintainers

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Special mentions for ongoing contributors

Thank you for contributing to Clean NestJS CLI! Your efforts help make NestJS development with Clean Architecture more accessible to developers worldwide.
