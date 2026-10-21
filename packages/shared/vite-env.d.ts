/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	// More env variables can be declared here...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
