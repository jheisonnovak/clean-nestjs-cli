export const pnpmWorkspaceElement = (): string => `allowBuilds:
  "@nestjs/core": true
  "@prisma/client": true
  "@prisma/engines": true
  "@scarf/scarf": true
  "prisma": true
  "sqlite3": true
  "unrs-resolver": true
onlyBuiltDependencies:
  - "@nestjs/core"
  - "@prisma/client"
  - "@prisma/engines"
  - "@scarf/scarf"
  - "prisma"
  - "sqlite3"
  - "unrs-resolver"
`;
