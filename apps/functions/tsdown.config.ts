import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: 'src/index.ts',
	outDir: 'dist',
	format: ['esm'],
	dts: {
		resolve: true,
	},
	clean: true,
	minify: false,
	hash: false,
	external: ['firebase-admin', 'firebase-functions'],
})
