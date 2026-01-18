import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: 'src/index.ts',
	outDir: 'dist',
	format: ['cjs', 'esm'],
	dts: {
		resolve: true,
	},
	clean: true,
	minify: true,
	hash: false,
})
