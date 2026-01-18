import { setGlobalOptions } from 'firebase-functions'
import * as logger from 'firebase-functions/logger'

/**
 * Firebase Cloud Functions for Foundry Dashboard
 *
 * This module follows the monorepo patterns and can import shared packages
 * from @foundry/* when available.
 *
 * @see https://firebase.google.com/docs/functions
 */

// Set global options for all functions
// maxInstances helps control costs by limiting concurrent function executions
setGlobalOptions({ maxInstances: 10 })

// Export functions below
// Example:
// export const helloWorld = onRequest((request, response) => {
//   logger.info('Hello logs!', { structuredData: true })
//   response.send('Hello from Firebase!')
// })

// Placeholder export to ensure the module is valid
export { logger }
