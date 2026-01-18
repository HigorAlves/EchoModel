import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	clean: true,
	treeshake: true,
	sourcemap: true,
	// Disable hash in filenames for stable imports
	hash: false,
})
