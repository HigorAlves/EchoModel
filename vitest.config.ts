import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		reporters: ['json', 'html'],
		environment: 'jsdom',
		projects: ['apps/*', 'config/*', 'infra/*', 'kernel/*', 'libs/*', 'packages/*'],
	},
})
