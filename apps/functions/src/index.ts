/**
 * @fileoverview Firebase Cloud Functions for EchoModel
 *
 * This module exports all Cloud Functions for the EchoModel platform.
 * Functions are organized by bounded context:
 * - Auth: User authentication events
 * - Models: AI influencer creation and calibration
 * - Stores: Multi-tenant store management
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

// ==================== Model Functions ====================
// Handle AI influencer creation and calibration workflow
export { approveCalibration, createModel, rejectCalibration, startCalibration } from './handlers/models'

// ==================== Store Functions ====================
// Handle multi-tenant store management
export { createStore, getMyStores, getStore, updateStoreSettings } from './handlers/stores'
