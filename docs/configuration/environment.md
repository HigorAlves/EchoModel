# Environment Configuration (@foundry/enviroment)

Type-safe environment variable management with Zod validation.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/enviroment` |
| Location | `config/enviroment` |
| Purpose | Environment configuration |
| Dependencies | `@t3-oss/env-core`, `zod` |

## Core Features

- Type-safe environment variables with Zod
- Configuration builders for different domains
- Environment detection helpers
- Connection string builders
- Default values for development/testing

## Environment Variables

### Server Configuration

```bash
# Server
PORT=3000
HOST=0.0.0.0
API_PREFIX=/lambdas
NODE_ENV=development  # development, production, test, staging
```

### Database Configuration

```bash
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secret
DATABASE_NAME=foundry
DATABASE_SSL=false
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
DATABASE_POOL_SIZE=20
DATABASE_CONNECTION_TIMEOUT=30000
```

### Redis Configuration

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false
REDIS_KEY_PREFIX=foundry:
```

### Cache Configuration

```bash
# Cache
CACHE_ENABLED=true
CACHE_TTL=300000
CACHE_MAX_SIZE=10000
CACHE_CHECK_PERIOD=60000
```

### Queue Configuration

```bash
# Queue (Bull)
QUEUE_DEFAULT_JOB_OPTIONS_ATTEMPTS=3
QUEUE_DEFAULT_JOB_OPTIONS_BACKOFF_TYPE=exponential
QUEUE_DEFAULT_JOB_OPTIONS_BACKOFF_DELAY=1000
QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_COMPLETE=true
QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_FAIL=false
```

### Health Check Configuration

```bash
# Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT=60000
CIRCUIT_BREAKER_MONITORING_PERIOD=300000
```

### Security Configuration

```bash
# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

# Password Hashing
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Feature Flags Configuration

```bash
# Feature Flags
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_CACHE_TTL=60000
FEATURE_FLAGS_ANALYTICS_ENABLED=true
FEATURE_FLAGS_ANALYTICS_SAMPLING_RATE=1.0
```

### Encryption Configuration

```bash
# Encryption
ENCRYPTION_ALGORITHM=aes-256-gcm
ENCRYPTION_KEY_ROTATION_DAYS=90
ENCRYPTION_COMPRESSION_ENABLED=true
ENCRYPTION_COMPRESSION_ALGORITHM=gzip
ENCRYPTION_COMPRESSION_LEVEL=6

# Compliance
ENCRYPTION_AUDIT_ENABLED=true
ENCRYPTION_AUDIT_SAMPLING_RATE=1.0
ENCRYPTION_COMPLIANCE_REGULATIONS=GDPR,LGPD
```

### Observability Configuration

```bash
# Metrics
METRICS_ENABLED=true
METRICS_PORT=9090
METRICS_PREFIX=foundry_

# Tracing
TRACING_ENABLED=true
TRACING_EXPORTER=jaeger
TRACING_ENDPOINT=http://localhost:14268/api/traces
TRACING_SERVICE_NAME=foundry
TRACING_SAMPLING_RATE=0.1

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_PRETTY=false
```

## Usage

### Accessing Environment

```typescript
import { env, IS_DEV, IS_PROD, IS_TEST } from '@foundry/enviroment'

// Access validated environment variables
console.log(env.DATABASE_HOST)
console.log(env.PORT)

// Environment checks
if (IS_DEV) {
  console.log('Running in development mode')
}

if (IS_PROD) {
  // Production-only logic
}

if (IS_TEST) {
  // Test-only logic
}
```

### Configuration Builders

#### Database Configuration

```typescript
import { buildDatabaseConfig } from '@foundry/enviroment'

const dbConfig = buildDatabaseConfig()
// {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'secret',
//   database: 'foundry',
//   ssl: false,
//   synchronize: false,
//   logging: false,
//   poolSize: 20,
//   connectionTimeout: 30000
// }
```

#### Redis Configuration

```typescript
import { buildRedisConfig } from '@foundry/enviroment'

const redisConfig = buildRedisConfig()
// {
//   host: 'localhost',
//   port: 6379,
//   password: undefined,
//   db: 0,
//   tls: false,
//   keyPrefix: 'foundry:'
// }
```

#### Cache Configuration

```typescript
import { buildCacheConfig } from '@foundry/enviroment'

const cacheConfig = buildCacheConfig()
// {
//   enabled: true,
//   ttl: 300000,
//   maxSize: 10000,
//   checkPeriod: 60000
// }
```

#### Queue Configuration

```typescript
import { buildQueueConfig } from '@foundry/enviroment'

const queueConfig = buildQueueConfig()
// {
//   redis: { host, port, password, db },
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: { type: 'exponential', delay: 1000 },
//     removeOnComplete: true,
//     removeOnFail: false
//   }
// }
```

#### Health Check Configuration

```typescript
import { buildHealthCheckConfig } from '@foundry/enviroment'

const healthConfig = buildHealthCheckConfig()
// {
//   enabled: true,
//   interval: 30000,
//   timeout: 5000,
//   circuitBreaker: {
//     enabled: true,
//     threshold: 5,
//     resetTimeout: 60000,
//     monitoringPeriod: 300000
//   }
// }
```

#### Security Configuration

```typescript
import { buildSecurityConfig } from '@foundry/enviroment'

const securityConfig = buildSecurityConfig()
// {
//   jwt: {
//     secret: 'your-secret',
//     expiresIn: '1h',
//     refreshExpiresIn: '7d',
//     algorithm: 'HS256'
//   },
//   bcrypt: { rounds: 12 },
//   rateLimit: {
//     enabled: true,
//     windowMs: 60000,
//     maxRequests: 100
//   }
// }
```

#### Feature Flags Configuration

```typescript
import { buildFeatureFlagsConfig } from '@foundry/enviroment'

const flagsConfig = buildFeatureFlagsConfig()
// {
//   enabled: true,
//   cacheTTL: 60000,
//   analytics: {
//     enabled: true,
//     samplingRate: 1.0
//   }
// }
```

#### Encryption Configuration

```typescript
import { buildEncryptionConfig } from '@foundry/enviroment'

const encryptionConfig = buildEncryptionConfig()
// {
//   algorithm: 'aes-256-gcm',
//   keyRotationDays: 90,
//   compression: {
//     enabled: true,
//     algorithm: 'gzip',
//     level: 6
//   },
//   audit: {
//     enabled: true,
//     samplingRate: 1.0,
//     regulations: ['GDPR', 'LGPD']
//   }
// }
```

#### Observability Configuration

```typescript
import { buildObservabilityConfig } from '@foundry/enviroment'

const observabilityConfig = buildObservabilityConfig()
// {
//   metrics: {
//     enabled: true,
//     port: 9090,
//     prefix: 'foundry_'
//   },
//   tracing: {
//     enabled: true,
//     exporter: 'jaeger',
//     endpoint: 'http://localhost:14268/api/traces',
//     serviceName: 'foundry',
//     samplingRate: 0.1
//   },
//   logging: {
//     level: 'info',
//     format: 'json',
//     pretty: false
//   }
// }
```

### Connection String Builders

```typescript
import { buildPostgresConnectionString, buildRedisConnectionString } from '@foundry/enviroment'

// PostgreSQL
const pgUrl = buildPostgresConnectionString()
// 'postgresql://postgres:secret@localhost:5432/foundry'

// Redis
const redisUrl = buildRedisConnectionString()
// 'redis://localhost:6379/0'
```

### Validation

The package validates environment variables at startup:

```typescript
import { env } from '@foundry/enviroment'

// If validation fails, the application will throw an error with details:
// Error: Invalid environment variables:
//   DATABASE_PORT: Expected number, received string
//   JWT_SECRET: Required
```

### Test Defaults

For testing, the package provides sensible defaults:

```typescript
// In test environment, most variables have defaults
// so you don't need to set them all

// These are automatically set in test:
// DATABASE_HOST=localhost
// DATABASE_PORT=5432
// DATABASE_NAME=foundry_test
// JWT_SECRET=test-secret
// etc.
```

## Best Practices

1. **Never commit secrets**: Use `.env.local` for local secrets
2. **Validate in CI**: Run type checking to catch missing variables
3. **Use builders**: Configuration builders ensure consistency
4. **Environment-specific files**:
   - `.env` - Default values (committed)
   - `.env.local` - Local overrides (not committed)
   - `.env.test` - Test environment (committed)
   - `.env.production` - Production template (committed without secrets)

## Adding New Variables

```typescript
// 1. Add to Zod schema in env.ts
export const env = createEnv({
  server: {
    MY_NEW_VAR: z.string().min(1),
    MY_OPTIONAL_VAR: z.string().optional().default('default-value'),
  },
  runtimeEnv: {
    MY_NEW_VAR: process.env.MY_NEW_VAR,
    MY_OPTIONAL_VAR: process.env.MY_OPTIONAL_VAR,
  },
})

// 2. Add to configuration builder if needed
export function buildMyConfig() {
  return {
    myVar: env.MY_NEW_VAR,
    optionalVar: env.MY_OPTIONAL_VAR,
  }
}

// 3. Export from index.ts
export { buildMyConfig }
```
