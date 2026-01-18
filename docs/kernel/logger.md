# Logger Package (@foundry/logger)

The logger package provides centralized, structured logging for the entire Foundry monorepo using Pino.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/logger` |
| Location | `kernel/logger` |
| Purpose | Centralized structured logging |
| Dependencies | `pino`, `pino-pretty` |

## Why Use This Package

- **Structured Logging**: JSON-formatted logs for easy parsing and analysis
- **Performance**: Pino is one of the fastest Node.js loggers
- **Consistency**: Single logging interface across all packages
- **Pretty Output**: Human-readable logs in development
- **Context Propagation**: Child loggers maintain context through request lifecycle

## Installation

The logger is already included in packages that need it. To add it to a new package:

```json
{
  "dependencies": {
    "@foundry/logger": "*"
  }
}
```

## Quick Start

```typescript
import { createLogger } from '@foundry/logger'

const logger = createLogger('MyService')

logger.info('Service started')
logger.warn({ cacheSize: 1000 }, 'Cache approaching limit')
logger.error(new Error('Connection failed'), 'Database error')
```

## API Reference

### createLogger(name, config?)

Creates a named logger instance. Loggers with the same name and config are cached and reused.

```typescript
import { createLogger } from '@foundry/logger'

// Basic usage
const logger = createLogger('UserService')

// With configuration
const logger = createLogger('PaymentService', {
  level: 'debug',
  context: { service: 'payments', version: '1.0.0' }
})
```

**Parameters:**
- `name` (string): Logger name, typically the module or class name
- `config` (LoggerConfig): Optional configuration object

**Returns:** `Logger` instance

### Logger Class

#### Log Methods

All log methods support two calling patterns:

```typescript
// Message only
logger.info('Operation completed')

// Object + message (structured logging)
logger.info({ userId: '123', duration: 45 }, 'User created')
```

**Available methods:**
- `trace(msg)` / `trace(obj, msg)` - Verbose debugging
- `debug(msg)` / `debug(obj, msg)` - Debug information
- `info(msg)` / `info(obj, msg)` - General information
- `warn(msg)` / `warn(obj, msg)` - Warning conditions
- `error(msg)` / `error(obj, msg)` / `error(err, msg)` - Error conditions
- `fatal(msg)` / `fatal(obj, msg)` / `fatal(err, msg)` - Fatal errors

#### Error Logging

The `error` and `fatal` methods accept Error objects directly:

```typescript
try {
  await riskyOperation()
} catch (error) {
  logger.error(error, 'Operation failed')
  // or with additional context
  logger.error({ err: error, userId, operation: 'create' }, 'Operation failed')
}
```

#### Child Loggers

Create child loggers with additional context that persists across all log calls:

```typescript
const logger = createLogger('RequestHandler')

// Create child logger for a specific request
const requestLogger = logger.child({
  requestId: 'req-123',
  userId: 'user-456'
})

requestLogger.info('Processing request')  // Includes requestId and userId
requestLogger.info('Fetching data')       // Includes requestId and userId
requestLogger.info('Request completed')   // Includes requestId and userId
```

#### getPinoInstance()

Access the underlying Pino logger for advanced use cases:

```typescript
const pinoLogger = logger.getPinoInstance()
```

### Configuration Functions

#### configureLogger(options)

Configure the root logger. Call early in application startup before creating loggers.

```typescript
import { configureLogger } from '@foundry/logger'
import type { LoggerOptions } from 'pino'

const options: LoggerOptions = {
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
}

configureLogger(options)
```

#### resetLogger()

Reset the logger state. Useful in tests.

```typescript
import { resetLogger } from '@foundry/logger'

beforeEach(() => {
  resetLogger()
})
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Minimum log level | `info` |
| `LOG_PRETTY` | Enable pretty printing | `false` (auto `true` in dev) |
| `LOG_SINGLE_LINE` | Single line output | `false` |
| `NODE_ENV` | Environment (pretty logs if `development`) | - |

### Log Levels

From most to least verbose:

1. `trace` - Very detailed debugging
2. `debug` - Debug information
3. `info` - General operational information
4. `warn` - Warning conditions
5. `error` - Error conditions
6. `fatal` - System is unusable
7. `silent` - No logging

```bash
# Show all logs including debug
LOG_LEVEL=debug yarn dev

# Only show warnings and errors
LOG_LEVEL=warn yarn start
```

## Output Formats

### JSON Format (Production)

Default in production for machine parsing:

```json
{"level":30,"time":1704364245123,"name":"UserService","msg":"User created","userId":"123"}
```

### Pretty Format (Development)

Human-readable format enabled automatically in development:

```
INFO  [2026-01-04 10:30:45.123] UserService | User created
    userId: "123"
    action: "signup"
```

Enable manually:
```bash
LOG_PRETTY=true yarn start
```

## Usage Patterns

### Service/Module Logger

Create one logger per service or module:

```typescript
// user.service.ts
import { createLogger } from '@foundry/logger'

const logger = createLogger('UserService')

export class UserService {
  async createUser(data: CreateUserDTO) {
    logger.debug({ email: data.email }, 'Creating user')

    const user = await this.repository.create(data)

    logger.info({ userId: user.id }, 'User created successfully')
    return user
  }
}
```

### Event Handler Logger

```typescript
// UserCreated.event.ts
import { createLogger } from '@foundry/logger'

const logger = createLogger('UserCreatedEvent')

export class UserCreatedEvent implements IEventHandler {
  async handle(event: IntegrationEvent): Promise<void> {
    logger.info({ aggregateId: event.aggregateId }, 'User created event received')
    // Process event...
  }
}
```

### Request Context Logger

Pass context through the request lifecycle:

```typescript
// middleware/logging.ts
import { createLogger } from '@foundry/logger'

const logger = createLogger('HTTP')

export function loggingMiddleware(req, res, next) {
  const requestLogger = logger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
    userId: req.user?.id
  })

  req.logger = requestLogger
  requestLogger.info('Request started')

  res.on('finish', () => {
    requestLogger.info({ status: res.statusCode }, 'Request completed')
  })

  next()
}

// In route handlers
app.get('/users/:id', (req, res) => {
  req.logger.debug('Fetching user')
  // All logs include requestId, method, path, userId
})
```

### Error Handling

```typescript
import { createLogger } from '@foundry/logger'

const logger = createLogger('PaymentProcessor')

async function processPayment(paymentId: string) {
  try {
    logger.info({ paymentId }, 'Processing payment')
    await chargeCard(paymentId)
    logger.info({ paymentId }, 'Payment successful')
  } catch (error) {
    logger.error(
      { err: error, paymentId, provider: 'stripe' },
      'Payment processing failed'
    )
    throw error
  }
}
```

### Conditional Debug Logging

```typescript
const logger = createLogger('QueryOptimizer')

function executeQuery(query: string) {
  // Only logged when LOG_LEVEL=debug or trace
  logger.debug({ query, params }, 'Executing query')

  const result = database.execute(query)

  logger.debug({ rowCount: result.length }, 'Query completed')
  return result
}
```

## Best Practices

### DO

1. **Use structured logging** - Include relevant context as objects
   ```typescript
   logger.info({ userId, action, duration }, 'Action completed')
   ```

2. **Use appropriate log levels**
   - `debug` for development/troubleshooting info
   - `info` for business events and milestones
   - `warn` for recoverable issues
   - `error` for failures requiring attention

3. **Include error objects properly**
   ```typescript
   logger.error(error, 'Operation failed')
   // or
   logger.error({ err: error, context }, 'Operation failed')
   ```

4. **Create child loggers for request tracing**
   ```typescript
   const reqLogger = logger.child({ requestId })
   ```

5. **Use meaningful logger names**
   ```typescript
   createLogger('UserService')      // Good
   createLogger('PaymentGateway')   // Good
   ```

### DON'T

1. **Never use console.log/warn/error**
   ```typescript
   // Bad
   console.log('User created')

   // Good
   logger.info('User created')
   ```

2. **Don't log sensitive data**
   ```typescript
   // Bad
   logger.info({ password, creditCard }, 'User data')

   // Good
   logger.info({ userId, email }, 'User data')
   ```

3. **Don't create loggers in hot paths**
   ```typescript
   // Bad - creates logger on every call
   function process() {
     const logger = createLogger('Processor')
     logger.info('Processing')
   }

   // Good - reuse logger
   const logger = createLogger('Processor')
   function process() {
     logger.info('Processing')
   }
   ```

4. **Avoid overly verbose logging in loops**
   ```typescript
   // Bad
   for (const item of items) {
     logger.debug({ item }, 'Processing item')
   }

   // Good
   logger.debug({ count: items.length }, 'Processing items')
   for (const item of items) {
     // process...
   }
   logger.debug({ count: items.length }, 'Items processed')
   ```

## Integration with Other Packages

The logger is used throughout the Foundry monorepo:

- **@foundry/application** - Event handlers log event processing
- **@foundry/encryption** - Key management operations are logged
- **@foundry/feature-flags** - Analytics collection logging
- **@foundry/database** - Connection and query logging
- **@foundry/enviroment** - Configuration loading logs

## Testing

In tests, you can reset the logger or configure it for test output:

```typescript
import { resetLogger, configureLogger } from '@foundry/logger'

beforeEach(() => {
  resetLogger()
})

// Or configure silent logging in tests
beforeAll(() => {
  configureLogger({ level: 'silent' })
})
```

## Pino Ecosystem

The logger is built on [Pino](https://getpino.io/). You can use Pino ecosystem tools:

- **pino-pretty** - Pretty print logs (included)
- **pino-elasticsearch** - Send logs to Elasticsearch
- **pino-datadog** - Send logs to Datadog
- **pino-sentry** - Send errors to Sentry

Example with custom transport:
```typescript
import { configureLogger } from '@foundry/logger'

configureLogger({
  level: 'info',
  transport: {
    targets: [
      { target: 'pino-pretty', level: 'info' },
      { target: 'pino-elasticsearch', level: 'error', options: { node: 'http://localhost:9200' } }
    ]
  }
})
```
