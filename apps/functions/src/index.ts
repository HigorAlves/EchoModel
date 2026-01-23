/**
 * @fileoverview Firebase Cloud Functions for EchoModel
 *
 * This module exports all Cloud Functions for the EchoModel platform.
 * Functions are organized by bounded context:
 * - Auth: User authentication events
 *
 * @see https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions'

// Set global options for all functions
// maxInstances helps control costs by limiting concurrent function executions
setGlobalOptions({ maxInstances: 10 })

// ==================== Auth Functions ====================
// Handle Firebase Authentication events
export { onUserCreated } from './handlers/auth'
