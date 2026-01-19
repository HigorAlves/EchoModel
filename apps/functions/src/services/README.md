# Image Generation Services

This directory contains image generation service implementations for the EchoModel platform.

## Available Services

### 1. BytePlusService (Seedream 4.0-4.5)

**Recommended for production use.**

BytePlus ModelArk provides state-of-the-art image generation with Seedream 4.0 and 4.5 models.

**Features:**
- ✅ Production-ready with automatic retry logic
- ✅ OpenAI-compatible API format
- ✅ Up to 4K resolution support
- ✅ Text-to-image and image-to-image
- ✅ Batch generation with error handling
- ✅ Built-in rate limit handling
- ✅ Comprehensive error handling

**Pricing:**
- Seedream 4.0: $0.035 per image
- Seedream 4.5: $0.045 per image

**Usage:**
```typescript
import { BytePlusService, SeedreamModel, ImageSize } from './byteplus.service'

const service = new BytePlusService({
  apiKey: process.env.BYTEPLUS_API_KEY!,
})

const response = await service.generateImage({
  prompt: 'A beautiful landscape',
  model: SeedreamModel.SEEDREAM_4_5,
  size: ImageSize.HD,
})
```

**Documentation:** See `/docs/byteplus-integration.md` for complete guide.

---

### 2. SeedreamService (Legacy/Mock)

**For testing and development only.**

Original Seedream service implementation with mock mode support.

**Features:**
- ⚠️ Mock mode for testing
- ⚠️ Limited error handling
- ⚠️ No automatic retries
- ⚠️ Basic functionality only

**Usage:**
```typescript
import { SeedreamService } from './seedream.service'

const service = new SeedreamService()

const result = await service.generateImages({
  prompt: 'A model wearing fashion',
  referenceImageUrls: [imageUrl],
  count: 4,
})
```

---

## Service Comparison

| Feature | BytePlusService | SeedreamService |
|---------|----------------|-----------------|
| Production Ready | ✅ Yes | ⚠️ Mock/Testing |
| Automatic Retries | ✅ Yes | ❌ No |
| Rate Limit Handling | ✅ Yes | ❌ No |
| Error Handling | ✅ Comprehensive | ⚠️ Basic |
| Max Resolution | 4K | Unknown |
| Batch Support | ✅ Yes | ❌ No |
| Reference Images | ✅ Single image | ✅ Multiple |
| Cost Estimation | ✅ Yes | ❌ No |
| OpenAI Compatible | ✅ Yes | ❌ No |
| Documentation | ✅ Complete | ⚠️ Limited |

## Migration Guide

### From SeedreamService to BytePlusService

```typescript
// Before (SeedreamService)
const result = await seedreamService.generateImages({
  prompt: 'fashion model',
  referenceImageUrls: [imageUrl1, imageUrl2],
  count: 4,
  gender: 'female',
  ageRange: '25-35',
})

// After (BytePlusService)
const response = await bytePlusService.generateImage({
  prompt: 'fashion model, female, age 25-35',
  image: imageUrl1,  // Use primary reference image
  numImages: 4,
  model: SeedreamModel.SEEDREAM_4_5,
  size: ImageSize.HD,
})

// Access results
const images = response.data.map(img => ({
  url: img.url,
  prompt: img.revisedPrompt,
}))
```

### Key Differences

1. **Reference Images**: BytePlus uses single `image` parameter
2. **Demographics**: Include in prompt text instead of separate parameters
3. **Response Format**: Returns OpenAI-compatible structure
4. **Error Handling**: Wrap in try-catch for proper error handling

## Environment Variables

### BytePlusService

```bash
BYTEPLUS_API_KEY=your_api_key_here
BYTEPLUS_BASE_URL=https://ark.cn-beijing.volces.com/api/v3  # Optional
```

Get your API key from [BytePlus Console](https://console.byteplus.com).

### SeedreamService

```bash
SEEDREAM_API_KEY=your_api_key_here  # If using real mode
SEEDREAM_API_URL=https://api.seedream.com  # Optional
```

## Best Practices

### 1. Choose the Right Service

- **Production**: Use `BytePlusService`
- **Development/Testing**: Use `SeedreamService` in mock mode
- **Prototyping**: Use `BytePlusService` with Seedream 4.0 (lower cost)

### 2. Handle Errors Properly

```typescript
try {
  const response = await bytePlusService.generateImage(request)
  // Handle success
} catch (error) {
  logger.error('Generation failed', { error })
  // Handle error
}
```

### 3. Use Appropriate Resolution

```typescript
// For thumbnails
size: ImageSize.SD  // 1K - faster, cheaper

// For main content
size: ImageSize.HD  // 2K - good balance

// For high-quality
size: ImageSize.UHD  // 4K - best quality
```

### 4. Batch Processing

```typescript
const { results, errors } = await bytePlusService.generateBatch(requests)

// Process successful generations
for (const result of results) {
  await saveImage(result.data[0].url)
}

// Handle failures
for (const error of errors) {
  await logError(error)
}
```

### 5. Cost Management

```typescript
// Estimate cost before generation
const cost = BytePlusService.estimateCost(
  SeedreamModel.SEEDREAM_4_5,
  numImages
)

if (cost > budget) {
  // Use cheaper model or fewer images
  model = SeedreamModel.SEEDREAM_4_0
}
```

## Rate Limits

### BytePlusService

- Basic Tier: 10 requests/minute
- Maximum: 50 images per batch
- Automatic retry on rate limit (429)

### SeedreamService

- Depends on provider
- No built-in rate limit handling

## Error Handling

### BytePlusService

```typescript
try {
  const response = await bytePlusService.generateImage(request)
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Rate limited')) {
      // Handle rate limit
    } else if (error.message.includes('timeout')) {
      // Handle timeout
    } else if (error.message.includes('API error')) {
      // Handle API error
    }
  }
}
```

### SeedreamService

```typescript
const result = await seedreamService.generateImages(request)

if (!result.success) {
  logger.error('Generation failed', { error: result.error })
  // Handle error
}
```

## Testing

### Unit Tests

```typescript
import { BytePlusService, SeedreamModel } from '../services'

describe('BytePlusService', () => {
  it('should generate image', async () => {
    const service = new BytePlusService({
      apiKey: 'test-key',
    })

    const response = await service.generateImage({
      prompt: 'test',
      model: SeedreamModel.SEEDREAM_4_5,
    })

    expect(response.data).toBeDefined()
    expect(response.data.length).toBeGreaterThan(0)
  })
})
```

### Integration Tests

Use `SeedreamService` in mock mode for integration tests:

```typescript
const mockService = new SeedreamService()

const result = await mockService.generateImages({
  prompt: 'test',
  count: 1,
})

expect(result.success).toBe(true)
expect(result.images).toHaveLength(1)
```

## Support

- **BytePlus**: https://docs.byteplus.com/en/docs/ModelArk/1541523
- **Issues**: Report in GitHub repository
- **Documentation**: See `/docs/byteplus-integration.md`

## License

See repository LICENSE file.
