/// <reference types="vitest/config" />

import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			plugins: [
				[
					"@swc/plugin-styled-components",
					{
						displayName: true,
						ssr: false,
					},
				],
			],
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@gata/ui-kit": path.resolve(__dirname, "../ui-kit/src"),
		},
	},
	server: {
		port: 5173,
		host: true,
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
	},
});
