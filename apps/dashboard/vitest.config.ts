import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tsconfigPaths() as never, react() as never],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.test.{ts,tsx}'],
		setupFiles: ['./src/testing/setup.ts'],
		passWithNoTests: true,
		coverage: {
			enabled: true,
			reportOnFailure: true,
			provider: 'istanbul',
			reporter: ['html', ['json', { file: '../coverage.json' }], 'json-summary'],
		},
	},
})
