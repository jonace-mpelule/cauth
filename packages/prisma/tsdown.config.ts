import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['./src/index.ts'],
	clean: true,
	dts: true,
	format: ['esm', 'cjs'],
	minify: true,
	target: 'es2022',
	outDir: 'dist',
	watch: false,
	external: ['./src/generated/**/*', '@prisma/client'],
	define: {},
});
