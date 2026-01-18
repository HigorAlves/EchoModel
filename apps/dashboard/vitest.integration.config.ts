import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tsconfigPaths() as never, react() as never],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.spec.{ts,tsx}'],
		setupFiles: ['./src/testing/setup.integration.ts'],
		passWithNoTests: true,
		testTimeout: 10000,
		hookTimeout: 30000,
		coverage: {
			enabled: true,
			reportOnFailure: true,
			provider: 'istanbul',
			reporter: ['html', ['json', { file: '../coverage.json' }], 'json-summary'],
		},
	},
})
