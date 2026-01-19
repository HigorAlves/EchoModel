# BytePlus ModelArk Integration Guide

This guide explains how to use the BytePlus ModelArk Image Generation service (Seedream 4.0-4.5) in the EchoModel platform.

## Overview

BytePlus ModelArk provides state-of-the-art image generation capabilities powered by Seedream 4.0 and 4.5 models. The service supports:

- **Text-to-Image**: Generate images from text descriptions
- **Image-to-Image**: Transform existing images based on prompts
- **Batch Generation**: Process multiple requests efficiently
- **High Resolution**: Up to 4K image generation
- **OpenAI Compatible**: Uses familiar API format

## Setup

### 1. Get API Key

1. Visit [console.byteplus.com](https://console.byteplus.com)
2. Sign up with your email
3. Navigate to "API Keys" section
4. Create a new key and securely store the access key ID and secret

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
BYTEPLUS_API_KEY=your_api_key_here
BYTEPLUS_BASE_URL=https://ark.cn-beijing.volces.com/api/v3  # Optional, uses default if not set
```

### 3. Initialize Service

```typescript
import { BytePlusService } from '../services/byteplus.service'

const bytePlusService = new BytePlusService({
  apiKey: process.env.BYTEPLUS_API_KEY!,
  timeout: 60000,      // Optional: 60 seconds
  maxRetries: 3,       // Optional: 3 retries
})
```

## Usage Examples

### Basic Text-to-Image Generation

```typescript
import { SeedreamModel, ImageSize } from '../services/byteplus.service'

const response = await bytePlusService.generateImage({
  prompt: 'A beautiful sunset over mountains, photorealistic',
  model: SeedreamModel.SEEDREAM_4_5,
  size: ImageSize.HD,
  watermark: false,
})

// Access generated image
const imageUrl = response.data[0].url
console.log('Generated image:', imageUrl)
```

### Image-to-Image Transformation

```typescript
const response = await bytePlusService.generateImage({
  prompt: 'Transform this landscape into a winter scene with snow',
  image: 'https://example.com/original-image.jpg',
  model: SeedreamModel.SEEDREAM_4_5,
  size: ImageSize.HD,
})
```

### Generate Multiple Images

```typescript
const response = await bytePlusService.generateImage({
  prompt: 'Modern fashion model wearing casual streetwear',
  model: SeedreamModel.SEEDREAM_4_5,
  size: ImageSize.HD,
  numImages: 4,  // Generate 4 variations
})

// Access all generated images
response.data.forEach((image, index) => {
  console.log(`Image ${index + 1}:`, image.url)
})
```

### Custom Resolution

```typescript
const response = await bytePlusService.generateImage({
  prompt: 'Portrait of a person in professional attire',
  model: SeedreamModel.SEEDREAM_4_5,
  width: 1024,
  height: 1536,  // Portrait orientation
})
```

### Batch Generation

```typescript
const requests = [
  { prompt: 'Summer outfit', model: SeedreamModel.SEEDREAM_4_5 },
  { prompt: 'Winter jacket', model: SeedreamModel.SEEDREAM_4_5 },
  { prompt: 'Casual dress', model: SeedreamModel.SEEDREAM_4_5 },
]

const { results, errors } = await bytePlusService.generateBatch(requests)

console.log(`Generated ${results.length} images`)
console.log(`Failed ${errors.length} requests`)
```

### With Guidance Scale

```typescript
const response = await bytePlusService.generateImage({
  prompt: 'Highly detailed fantasy character',
  model: SeedreamModel.SEEDREAM_4_5,
  size: ImageSize.HD,
  guidanceScale: 12,  // Higher value = more prompt adherence (1-20)
})
```

### Base64 Response

```typescript
import { ResponseFormat } from '../services/byteplus.service'

const response = await bytePlusService.generateImage({
  prompt: 'Product photo on white background',
  model: SeedreamModel.SEEDREAM_4_5,
  responseFormat: ResponseFormat.BASE64,
})

const base64Data = response.data[0].b64Json
// Use base64 data directly without downloading
```

## Integration with Cloud Functions

### Example: Generate Images Handler

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { BytePlusService, SeedreamModel, ImageSize } from '../services/byteplus.service'

const bytePlusService = new BytePlusService({
  apiKey: process.env.BYTEPLUS_API_KEY!,
})

export const generateWithByteplus = onCall(
  { maxInstances: 5, timeoutSeconds: 120 },
  async (request) => {
    const userId = request.auth?.uid
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Authentication required')
    }

    const { prompt, modelId, garmentImageUrl } = request.data

    try {
      const response = await bytePlusService.generateImage({
        prompt: prompt,
        image: garmentImageUrl,  // Optional reference image
        model: SeedreamModel.SEEDREAM_4_5,
        size: ImageSize.HD,
        numImages: 4,
      })

      return {
        success: true,
        images: response.data.map(img => ({
          url: img.url,
          revisedPrompt: img.revisedPrompt,
        })),
      }
    } catch (error) {
      logger.error('Image generation failed', { error, userId })
      throw new HttpsError('internal', 'Failed to generate images')
    }
  },
)
```

### With Model Calibration

```typescript
export const calibrateModel = onCall(
  { maxInstances: 10, timeoutSeconds: 120 },
  async (request) => {
    const { modelId, referenceImages, prompt } = request.data

    try {
      // Generate calibration images using reference images
      const response = await bytePlusService.generateImage({
        prompt: prompt,
        image: referenceImages[0],  // Use first reference image
        model: SeedreamModel.SEEDREAM_4_5,
        size: ImageSize.HD,
        numImages: 4,
      })

      // Store calibration results
      const calibrationImages = response.data.map(img => img.url!)

      return {
        success: true,
        calibrationImages,
      }
    } catch (error) {
      logger.error('Model calibration failed', { error, modelId })
      throw new HttpsError('internal', 'Failed to calibrate model')
    }
  },
)
```

## API Reference

### BytePlusConfig

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `apiKey` | `string` | ✓ | - | BytePlus API key |
| `baseUrl` | `string` | ✗ | `https://ark.cn-beijing.volces.com/api/v3` | API base URL |
| `timeout` | `number` | ✗ | `60000` | Request timeout in ms |
| `maxRetries` | `number` | ✗ | `3` | Max retry attempts |

### GenerateImageRequest

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `prompt` | `string` | ✓ | - | Image description |
| `model` | `SeedreamModel` | ✗ | `SEEDREAM_4_5` | Model version |
| `image` | `string` | ✗ | - | Reference image URL |
| `size` | `ImageSize` | ✗ | `HD` | Image resolution |
| `responseFormat` | `ResponseFormat` | ✗ | `URL` | Response format |
| `watermark` | `boolean` | ✗ | `false` | Add watermark |
| `stream` | `boolean` | ✗ | `false` | Enable streaming |
| `numImages` | `number` | ✗ | `1` | Number of images (1-4) |
| `guidanceScale` | `number` | ✗ | - | Prompt adherence (1-20) |
| `width` | `number` | ✗ | - | Custom width in pixels |
| `height` | `number` | ✗ | - | Custom height in pixels |

### Models

| Model | Enum | Price | Description |
|-------|------|-------|-------------|
| Seedream 4.0 | `SeedreamModel.SEEDREAM_4_0` | $0.035/image | Stable version |
| Seedream 4.5 | `SeedreamModel.SEEDREAM_4_5` | $0.045/image | Latest, higher quality |

### Image Sizes

| Size | Enum | Resolution | Description |
|------|------|------------|-------------|
| 1K | `ImageSize.SD` | ~1024x1024 | Standard definition |
| 2K | `ImageSize.HD` | ~2048x2048 | High definition |
| 4K | `ImageSize.UHD` | ~4096x4096 | Ultra high definition |

## Error Handling

The service implements automatic retry logic with exponential backoff for:

- Rate limiting (429 errors)
- Network timeouts
- Temporary API failures

```typescript
try {
  const response = await bytePlusService.generateImage({
    prompt: 'Your prompt here',
  })
} catch (error) {
  if (error instanceof Error) {
    // Check error message for specific handling
    if (error.message.includes('Rate limited')) {
      // Handle rate limit
    } else if (error.message.includes('timeout')) {
      // Handle timeout
    }
  }
}
```

## Rate Limits

BytePlus ModelArk has the following rate limits:

- **Basic Tier**: 10 requests/minute
- **Maximum Batch Size**: 50 images per request
- **Timeout**: Requests timeout after 60 seconds (configurable)

When rate limited, the service automatically retries with exponential backoff.

## Cost Estimation

Calculate estimated costs before making requests:

```typescript
import { BytePlusService, SeedreamModel } from '../services/byteplus.service'

const cost = BytePlusService.estimateCost(
  SeedreamModel.SEEDREAM_4_5,
  4  // number of images
)

console.log(`Estimated cost: $${cost.toFixed(3)}`)
// Output: Estimated cost: $0.180
```

## Best Practices

### 1. Use Appropriate Model Version

- **Seedream 4.0**: Lower cost, good for testing and development
- **Seedream 4.5**: Higher quality, use for production

### 2. Optimize Image Size

```typescript
// For thumbnails or previews
size: ImageSize.SD  // 1K - faster and cheaper

// For main content
size: ImageSize.HD  // 2K - good balance

// For high-quality prints
size: ImageSize.UHD  // 4K - highest quality
```

### 3. Batch Processing

Use `generateBatch()` for multiple images to handle errors gracefully:

```typescript
const { results, errors } = await bytePlusService.generateBatch(requests)

// Process successful generations
for (const result of results) {
  await saveToStorage(result.data[0].url)
}

// Log or retry failed requests
for (const error of errors) {
  logger.error('Generation failed', { error })
}
```

### 4. Reference Images

For better results with image-to-image:

- Use high-quality reference images
- Ensure images are accessible via public URL
- Consider aspect ratio compatibility

### 5. Prompt Engineering

Write effective prompts:

```typescript
// Good: Specific and descriptive
prompt: "Professional headshot of a person wearing a navy blue blazer, white shirt, neutral background, soft lighting, 4K quality"

// Better: Include style and mood
prompt: "Cinematic portrait of a fashion model wearing elegant evening wear, dramatic lighting, bokeh background, magazine quality"
```

## Troubleshooting

### API Key Issues

```typescript
// Validate API key
const isValid = await bytePlusService.validateApiKey()
if (!isValid) {
  console.error('Invalid API key')
}
```

### Timeout Errors

Increase timeout for high-resolution images:

```typescript
const bytePlusService = new BytePlusService({
  apiKey: process.env.BYTEPLUS_API_KEY!,
  timeout: 120000,  // 120 seconds for 4K images
})
```

### Rate Limiting

The service handles rate limiting automatically, but you can add additional logic:

```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Add delay between requests
for (const request of requests) {
  await bytePlusService.generateImage(request)
  await delay(6000)  // 6 seconds = 10 requests/minute
}
```

## Resources

- **Official Documentation**: https://docs.byteplus.com/en/docs/ModelArk/1541523
- **API Reference**: https://docs.byteplus.com/api/docs/ModelArk/1541523
- **Console**: https://console.byteplus.com
- **Support**: Contact BytePlus support for API issues

## Migration from Seedream Service

If you're migrating from the existing `SeedreamService`:

```typescript
// Old (SeedreamService)
const result = await seedreamService.generateImages({
  prompt: 'fashion model',
  referenceImageUrls: [imageUrl],
  count: 4,
})

// New (BytePlusService)
const response = await bytePlusService.generateImage({
  prompt: 'fashion model',
  image: imageUrl,  // Single reference image
  numImages: 4,
})

// Access results
const images = response.data.map(img => ({
  url: img.url,
  prompt: img.revisedPrompt,
}))
```

### Key Differences

1. **Reference Images**: BytePlus uses single `image` parameter instead of array
2. **Count**: Use `numImages` instead of `count`
3. **Response Format**: Returns OpenAI-compatible format
4. **Built-in Retry**: Automatic retry logic with exponential backoff
5. **Better Error Handling**: More detailed error messages
