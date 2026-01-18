# Encryption Package (@foundry/encryption)

Enterprise encryption system with multiple algorithms, key management, searchable encryption, and compliance audit logging.

## Overview

| Property | Value |
|----------|-------|
| Package | `@foundry/encryption` |
| Location | `kernel/encryption` |
| Purpose | Data encryption and compliance |
| Dependencies | `@foundry/error`, `zod` |
| Peer Dependencies | `argon2` (optional) |

## Core Features

- Multiple encryption algorithms (AES-256-GCM, ChaCha20-Poly1305)
- Key management with rotation policies
- Field-level encryption with decorators
- Searchable encryption (blind indexes)
- Compliance audit trails (GDPR, LGPD, CCPA)
- Compression before encryption
- Metrics and monitoring

## Getting Started

### Basic Encryption

```typescript
import { EncryptionService, InMemoryKeyProvider } from '@foundry/encryption'

// Create key provider
const keyProvider = new InMemoryKeyProvider()
await keyProvider.generateKey('default', 'aes-256-gcm')

// Create encryption service
const encryptionService = new EncryptionService({
  keyProvider,
  defaultAlgorithm: 'aes-256-gcm',
  compression: true
})

// Encrypt data
const encrypted = await encryptionService.encrypt('sensitive data', {
  keyId: 'default',
  context: { userId: 'user-123' }  // AAD for authentication
})

// Decrypt data
const decrypted = await encryptionService.decrypt(encrypted, {
  context: { userId: 'user-123' }
})
```

## Encryption Algorithms

### Available Algorithms

```typescript
import { AlgorithmRegistry } from '@foundry/encryption'

// Built-in algorithms
AlgorithmRegistry.get('aes-256-gcm')      // Recommended - authenticated encryption
AlgorithmRegistry.get('aes-256-cbc')      // Legacy support
AlgorithmRegistry.get('chacha20-poly1305') // High performance

// Register custom algorithm
AlgorithmRegistry.register('custom-algo', new CustomAlgorithm())
```

### AES-256-GCM (Recommended)

```typescript
const encryptionService = new EncryptionService({
  keyProvider,
  defaultAlgorithm: 'aes-256-gcm',
  options: {
    ivLength: 12,      // 96-bit IV
    tagLength: 16      // 128-bit auth tag
  }
})
```

**Features:**
- Authenticated encryption (integrity + confidentiality)
- Hardware acceleration on modern CPUs
- Recommended for most use cases

### ChaCha20-Poly1305

```typescript
const encryptionService = new EncryptionService({
  keyProvider,
  defaultAlgorithm: 'chacha20-poly1305'
})
```

**Features:**
- High performance on non-AES hardware
- Constant-time implementation (side-channel resistant)
- Good for mobile/embedded systems

## Key Management

### Key Providers

#### In-Memory Provider (Development)

```typescript
import { InMemoryKeyProvider } from '@foundry/encryption'

const keyProvider = new InMemoryKeyProvider()

// Generate key
await keyProvider.generateKey('my-key', 'aes-256-gcm')

// Get key
const key = await keyProvider.getKey('my-key')

// Rotate key
await keyProvider.rotateKey('my-key')

// List keys
const keys = await keyProvider.listKeys()
```

#### Environment Provider

```typescript
import { EnvironmentKeyProvider } from '@foundry/encryption'

// Keys from environment variables
// ENCRYPTION_KEY_DEFAULT=base64-encoded-key
// ENCRYPTION_KEY_BACKUP=base64-encoded-key

const keyProvider = new EnvironmentKeyProvider({
  prefix: 'ENCRYPTION_KEY_'
})
```

### Key Manager

```typescript
import { KeyManager } from '@foundry/encryption'

const keyManager = new KeyManager(keyProvider, {
  cacheTTL: 300000,           // Cache keys for 5 minutes
  rotationCheckInterval: 3600000  // Check rotation hourly
})

// Get key with caching
const key = await keyManager.getKey('my-key')

// Derive key from password
const derivedKey = await keyManager.deriveKey('password', 'salt', {
  algorithm: 'argon2id',
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
})

// Check key expiration
const isExpired = await keyManager.isKeyExpired('my-key')

// Rotate key
await keyManager.rotateKey('my-key')
```

### Key Derivation Functions

#### Argon2 (Recommended)

```typescript
import { Argon2Kdf } from '@foundry/encryption'

const kdf = new Argon2Kdf({
  variant: 'argon2id',   // argon2i, argon2d, argon2id
  memoryCost: 65536,     // 64 MB
  timeCost: 3,           // 3 iterations
  parallelism: 4,        // 4 threads
  hashLength: 32         // 256-bit key
})

const key = await kdf.derive('password', 'salt')
```

#### PBKDF2

```typescript
import { Pbkdf2Kdf } from '@foundry/encryption'

const kdf = new Pbkdf2Kdf({
  iterations: 600000,
  hashFunction: 'sha512',
  keyLength: 32
})

const key = await kdf.derive('password', 'salt')
```

## Field-Level Encryption

### Decorators

```typescript
import { Encrypted, EncryptedField } from '@foundry/encryption'

@Encrypted({
  schemaVersion: 1,
  defaultAlgorithm: 'aes-256-gcm',
  defaultKeyId: 'user-data-key',
  auditEnabled: true
})
class User {
  id: string
  name: string  // Not encrypted

  @EncryptedField({
    dataClassification: 'pii',
    blindIndex: true  // Enable searchable encryption
  })
  email: string

  @EncryptedField({
    dataClassification: 'confidential',
    algorithm: 'chacha20-poly1305',
    keyId: 'sensitive-key'
  })
  ssn: string

  @EncryptedField({
    dataClassification: 'pii'
  })
  phoneNumber: string
}
```

### Field Encryptor

```typescript
import { FieldEncryptor } from '@foundry/encryption'

const fieldEncryptor = new FieldEncryptor(encryptionService, {
  auditEnabled: true
})

// Encrypt all decorated fields
const encryptedUser = await fieldEncryptor.encryptFields(user, {
  context: { userId: 'current-user' }
})

// Decrypt all decorated fields
const decryptedUser = await fieldEncryptor.decryptFields(encryptedUser, {
  context: { userId: 'current-user' }
})
```

## Searchable Encryption

### Deterministic Encryption

For exact-match searches on encrypted data:

```typescript
import { DeterministicEncryptor } from '@foundry/encryption'

const deterministicEncryptor = new DeterministicEncryptor(keyProvider, 'search-key')

// Same input always produces same ciphertext
const encrypted1 = await deterministicEncryptor.encrypt('user@example.com')
const encrypted2 = await deterministicEncryptor.encrypt('user@example.com')
// encrypted1 === encrypted2 (enables equality search)

// Store encrypted value and search by it
const user = await db.users.findOne({ encryptedEmail: encrypted1 })
```

**Security Note:** Deterministic encryption leaks equality patterns. Use for search indexes only.

### Blind Index

For more secure searchable encryption:

```typescript
import { BlindIndexGenerator } from '@foundry/encryption'

const indexGenerator = new BlindIndexGenerator({
  keyId: 'blind-index-key',
  strategy: 'hmac',  // or 'prefix' for partial matching
  hashLength: 32
})

// Generate blind index
const blindIndex = await indexGenerator.generate('user@example.com')

// Store blind index alongside encrypted value
await db.users.insert({
  email: await encryptionService.encrypt('user@example.com'),  // Random IV
  emailIndex: blindIndex  // Searchable
})

// Search by blind index
const searchIndex = await indexGenerator.generate('user@example.com')
const user = await db.users.findOne({ emailIndex: searchIndex })
```

## Compression

```typescript
import { CompressionService, EncryptionService } from '@foundry/encryption'

const compressionService = new CompressionService({
  algorithm: 'gzip',  // or 'brotli'
  level: 6            // Compression level
})

const encryptionService = new EncryptionService({
  keyProvider,
  compression: true,
  compressionService
})

// Data is compressed before encryption, decompressed after decryption
const encrypted = await encryptionService.encrypt(largeDocument)
```

## Compliance & Audit

### Audit Collector

```typescript
import { ComplianceAuditCollector } from '@foundry/encryption'

const auditCollector = new ComplianceAuditCollector({
  bufferSize: 100,
  flushInterval: 5000,
  samplingRate: 1.0,  // 100% of events
  regulations: ['GDPR', 'LGPD', 'CCPA'],
  handlers: [
    async (events) => {
      await auditLogger.bulkInsert(events)
    }
  ]
})

// Attach to encryption service
const encryptionService = new EncryptionService({
  keyProvider,
  auditCollector
})
```

### Audit Event Types

```typescript
// Encryption operations
'encryption.encrypt'
'encryption.decrypt'
'encryption.failed'

// Key operations
'key.accessed'
'key.rotated'
'key.expired'

// Access control
'access.denied'
'access.granted'

// Data subject requests (GDPR)
'dsr.access'        // Data access request
'dsr.delete'        // Deletion request
'dsr.export'        // Data export
'dsr.rectify'       // Data correction
```

### Retention Policy

```typescript
import { RetentionPolicyManager } from '@foundry/encryption'

const retentionManager = new RetentionPolicyManager({
  policies: {
    'pii': { retentionDays: 365, regulation: 'GDPR' },
    'confidential': { retentionDays: 2555, regulation: 'SOX' },  // 7 years
    'internal': { retentionDays: 90 }
  }
})

// Check if data should be purged
const shouldPurge = retentionManager.shouldPurge(record, 'pii')

// Schedule purge
await retentionManager.schedulePurge(record.id, 'pii')
```

## Metrics & Monitoring

```typescript
import { MetricsCollector, EncryptionService } from '@foundry/encryption'

const metricsCollector = new MetricsCollector({
  enabled: true,
  collectLatency: true,
  collectThroughput: true
})

const encryptionService = new EncryptionService({
  keyProvider,
  metricsCollector
})

// Get metrics
const metrics = metricsCollector.getMetrics()
// {
//   operations: { encrypt: 1000, decrypt: 800 },
//   latency: { p50: 2, p95: 5, p99: 10 },
//   throughput: { ops_per_sec: 500 },
//   errors: { total: 2, rate: 0.002 },
//   keyOperations: { rotations: 1, accesses: 1800 }
// }
```

## Bulk Processing

```typescript
import { BulkProcessor } from '@foundry/encryption'

const bulkProcessor = new BulkProcessor(encryptionService, {
  batchSize: 100,
  concurrency: 4,
  onProgress: (processed, total) => {
    console.log(`${processed}/${total}`)
  }
})

// Encrypt many records
const encryptedRecords = await bulkProcessor.encryptMany(records, {
  fieldPath: 'sensitiveData',
  keyId: 'bulk-key'
})

// Re-encrypt with new key (key rotation)
await bulkProcessor.reencrypt(records, {
  fromKeyId: 'old-key',
  toKeyId: 'new-key',
  fieldPath: 'sensitiveData'
})
```

## Error Handling

```typescript
import {
  EncryptionError,
  KeyError,
  AlgorithmError,
  ComplianceError
} from '@foundry/encryption'

try {
  await encryptionService.encrypt(data)
} catch (error) {
  if (error instanceof KeyError) {
    console.log('Key issue:', error.keyId, error.message)
  } else if (error instanceof AlgorithmError) {
    console.log('Algorithm issue:', error.algorithm, error.message)
  } else if (error instanceof ComplianceError) {
    console.log('Compliance violation:', error.regulation, error.message)
  } else if (error instanceof EncryptionError) {
    console.log('Encryption failed:', error.message)
  }
}
```

## Integration Example

```typescript
import {
  EncryptionService,
  KeyManager,
  InMemoryKeyProvider,
  FieldEncryptor,
  ComplianceAuditCollector
} from '@foundry/encryption'

// Setup
const keyProvider = new InMemoryKeyProvider()
await keyProvider.generateKey('user-data', 'aes-256-gcm')
await keyProvider.generateKey('search-index', 'aes-256-gcm')

const keyManager = new KeyManager(keyProvider)

const auditCollector = new ComplianceAuditCollector({
  regulations: ['GDPR'],
  handlers: [async (events) => auditLog.insert(events)]
})

const encryptionService = new EncryptionService({
  keyProvider,
  auditCollector,
  compression: true
})

const fieldEncryptor = new FieldEncryptor(encryptionService)

// Usage in repository
class UserRepository {
  async create(user: User): Promise<string> {
    // Encrypt PII fields before storage
    const encryptedUser = await fieldEncryptor.encryptFields(user, {
      context: { operation: 'create', userId: user.id }
    })

    return this.db.users.insert(encryptedUser)
  }

  async findById(id: string): Promise<User> {
    const encryptedUser = await this.db.users.findById(id)

    // Decrypt after retrieval
    return fieldEncryptor.decryptFields(encryptedUser, {
      context: { operation: 'read', userId: id }
    })
  }
}
```
