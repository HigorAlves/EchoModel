import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: 'src/index.ts',
	outDir: 'dist',
	format: ['cjs'],
	dts: false, // Cloud Functions don't need declaration files
	clean: true,
	minify: false,
	hash: false,
	external: ['firebase-admin', 'firebase-functions'],
})
