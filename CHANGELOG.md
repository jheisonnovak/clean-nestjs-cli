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

### Changed

- `module|mo` now creates the full layered module structure.
- `repository|rp` now creates domain contracts plus infrastructure adapters.
- `use-case|uc` now creates application use cases and updates the module controller.
- The CLI project now builds with TypeScript 6.0.3.
