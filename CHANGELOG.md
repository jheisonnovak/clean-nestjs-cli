# Changelog

## 3.0.0

### Breaking Changes

- Replaced the v2 flat module layout with a layered Clean Architecture layout.
- Removed generation of root-level `models`, `repositories`, and `use-cases` folders.
- Moved repository contracts to `domain/repositories`.
- Moved repository implementations to `infrastructure/repositories`.
- Moved use cases to `application/use-cases`.
- Moved controllers to `presentation/controllers`.
- Changed repository provider tokens from string tokens such as `"IUserRepository"` to exported symbols such as `USER_REPOSITORY`.
- Existing v2 projects are not migrated automatically.

### Added

- Added `clean-nest.json` for v3 project configuration.
- Added ORM resolution through `--orm`, `clean-nest.json`, and `typeorm` fallback.
- Added TypeORM and Prisma infrastructure template families.
- Added `entity|e` schematic.
- Added `error|er` schematic with `--layer domain|application`.
- Added separated application DTO and presentation DTO generation.
- Added formatting preference sync from `clean-nest.json` or `.prettierrc`.
- Added snake_case plural table names for TypeORM entities.
- Added `.editorconfig` generation.
- Added `config init` and `config set` commands for local CLI preferences.
- Added indentation normalization when writing generated files.
- Added conventional singular route handling for modules such as `auth` and `health`.
- Added `pnpm-workspace.yaml` generation for pnpm projects to allow known dependency build scripts.
- Added a Prisma schema template that uses the classic `@prisma/client` import flow.

### Changed

- `module|mo` now creates the full layered module structure.
- `repository|rp` now creates domain contracts plus infrastructure adapters.
- `use-case|uc` now creates application use cases and updates the module controller.
- The CLI project now builds with TypeScript 6.0.3.
- Generated projects now include `ConfigModule`, global validation, and Swagger setup.
- Internal file templates are now grouped by app/layer/infrastructure responsibility.
- Controllers now map request DTOs into application DTOs before calling use cases.
- TypeORM configuration now loads only `*.orm.entity` files.
- Generated project `tsconfig.json` now excludes `test` from the main program.
- Generated TypeORM projects now register the root TypeORM connection in `AppModule`.
- Repository generation now creates the matching domain entity when needed.
- Use case generation now chooses module, use-case-specific, array, or void output DTOs from the action name.
- Auth-like actions such as `login` and `logout` now use POST route defaults.
- Added `--no-controller` for use cases without HTTP presentation.
- `find-one` and `find-by-id` use cases now generate `:id` routes when controller generation is enabled.
- Bare CRUD use case names such as `create` now expand to include the module resource name.
- Prisma projects now pin `prisma` and `@prisma/client` to `6.19.3` and run `prisma generate` during project creation.
- Prisma projects now use SQLite by default so newly generated projects can build and start without external database credentials.
- New projects now install the current CLI package version instead of always installing `clean-nestjs-cli@latest` when that version is already published.
