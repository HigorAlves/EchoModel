# TypeScript Configuration (@foundry/typescript-config)

Shared TypeScript compiler configurations for the monorepo.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/typescript-config` |
| Location | `config/typescript-config` |
| Purpose | Shared TypeScript settings |

## Available Configurations

### Base Configuration

The foundation for all TypeScript projects in the monorepo.

```json
// config/typescript-config/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "lib": ["ES2022"],

    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,

    "types": ["reflect-metadata", "node"]
  }
}
```

**Features:**
- ES2022 target for modern JavaScript features
- Strict type checking enabled
- Decorator support for dependency injection
- Declaration maps for debugging
- Incremental compilation for speed

### Library Configuration

For internal packages and libraries.

```json
// packages/my-package/tsconfig.json
{
  "extends": "@foundry/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### Next.js Configuration

For Next.js applications.

```json
// apps/web/tsconfig.json
{
  "extends": "@foundry/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Next.js specific settings:**
- JSX preservation for Next.js compilation
- Bundler module resolution
- Next.js plugin integration
- No emit (Next.js handles compilation)

### React Library Configuration

For shared React component libraries.

```json
// libs/ui/tsconfig.json
{
  "extends": "@foundry/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.stories.tsx"]
}
```

## Usage in Packages

### Setting Up a New Package

1. Add the dependency:
```json
{
  "devDependencies": {
    "@foundry/typescript-config": "workspace:*"
  }
}
```

2. Create `tsconfig.json`:
```json
{
  "extends": "@foundry/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

3. Add type checking script:
```json
{
  "scripts": {
    "check-types": "tsc --noEmit"
  }
}
```

### Path Aliases

Configure path aliases for cleaner imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@domain/*": ["./src/domain/*"],
      "@infra/*": ["./src/infra/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

Usage:
```typescript
// Instead of
import { User } from '../../../domain/entities/User'

// Use
import { User } from '@domain/entities/User'
```

## Global Type Definitions

The package provides global type definitions:

```typescript
// config/typescript-config/types/global.d.ts

// JSON type utilities
type JsonPrimitive = string | number | boolean | null
type JsonArray = JsonValue[]
type JsonObject = { [key: string]: JsonValue }
type JsonValue = JsonPrimitive | JsonArray | JsonObject
```

Usage:
```typescript
function parseConfig(json: string): JsonObject {
  return JSON.parse(json)
}
```

## Best Practices

### 1. Always Extend Base Config

```json
{
  "extends": "@foundry/typescript-config/base.json"
}
```

### 2. Use Strict Mode

All configurations have strict mode enabled. Don't disable it:

```json
// DON'T DO THIS
{
  "compilerOptions": {
    "strict": false  // Bad!
  }
}
```

### 3. Keep Decorators Enabled

Required for dependency injection:

```typescript
// Works because emitDecoratorMetadata is enabled
@Injectable()
class UserService {
  constructor(private readonly repo: UserRepository) {}
}
```

### 4. Use Type-Only Imports

```typescript
// Preferred - removed at compile time
import type { User } from '@domain/entities/User'

// Only for values
import { UserStatus } from '@domain/entities/User'
```

### 5. Exclude Test Files from Compilation

```json
{
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}
```

## Troubleshooting

### Module Resolution Issues

If imports don't resolve:
1. Check `baseUrl` is set correctly
2. Verify `paths` mapping
3. Ensure `moduleResolution` is `bundler`

### Decorator Metadata Missing

If DI doesn't work:
1. Ensure `emitDecoratorMetadata: true`
2. Import `reflect-metadata` at entry point
3. Check `types` includes `reflect-metadata`

### Incremental Build Errors

If incremental builds fail:
1. Delete `.tsbuildinfo` file
2. Run `tsc --build --clean`
3. Rebuild with `tsc --build`
