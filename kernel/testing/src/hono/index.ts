/**
 * @fileoverview Hono Test Helpers
 *
 * Utility functions for testing Hono applications.
 */

import type { Env, Hono, Schema } from 'hono'

/**
 * Makes a test request to a Hono app
 */
export async function makeRequest<E extends Env, S extends Schema, B extends string>(
	app: Hono<E, S, B>,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	path: string,
	options?: {
		body?: unknown
		headers?: Record<string, string>
	},
) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...options?.headers,
	}

	const requestInit: RequestInit = {
		method,
		headers,
	}

	if (options?.body) {
		requestInit.body = JSON.stringify(options.body)
	}

	return app.request(path, requestInit)
}

/**
 * Parses JSON response body
 */
export async function parseResponse<T>(response: Response): Promise<T> {
	return response.json() as Promise<T>
}

/**
 * Creates a test request helper bound to an app
 */
export function createTestClient<E extends Env, S extends Schema, B extends string>(app: Hono<E, S, B>) {
	return {
		get: (path: string, options?: { headers?: Record<string, string> }) => makeRequest(app, 'GET', path, options),

		post: (path: string, body?: unknown, options?: { headers?: Record<string, string> }) =>
			makeRequest(app, 'POST', path, { body, ...options }),

		put: (path: string, body?: unknown, options?: { headers?: Record<string, string> }) =>
			makeRequest(app, 'PUT', path, { body, ...options }),

		patch: (path: string, body?: unknown, options?: { headers?: Record<string, string> }) =>
			makeRequest(app, 'PATCH', path, { body, ...options }),

		delete: (path: string, options?: { headers?: Record<string, string> }) => makeRequest(app, 'DELETE', path, options),
	}
}
