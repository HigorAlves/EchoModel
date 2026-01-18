import tsconfigPath from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export const baseConfig = defineConfig({
	plugins: [tsconfigPath() as never],
	test: {
		passWithNoTests: true,
		coverage: {
			enabled: true,
			reportOnFailure: true,
			provider: 'istanbul',
			reporter: ['html', ['json', { file: `../coverage.json` }], 'json-summary'],
		},
	},
})
