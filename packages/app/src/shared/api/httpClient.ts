import { type Credentials, CredentialsSchema } from "@gata/shared";
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { ZodError } from "zod";
import { router } from "@/app";
import { ROUTES } from "@/app/routes/routes";
import { appInstanceStore } from "@/app/store";

const DEFAULT_TIMEOUT = 15000;
const BASE = import.meta.env.VITE_API_BASE_URL || "";

export const generateSafePath = (appInstancePayload: Credentials) => {
	return appInstancePayload;
};

export const createHttpClient = (
	config?: AxiosRequestConfig,
): AxiosInstance => {
	const instance = axios.create({
		baseURL: BASE,
		timeout: DEFAULT_TIMEOUT,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		...config,
	});

	// Request interceptor
	instance.interceptors.request.use(
		(reqConfig) => {
			const candidatePersistCredentials = localStorage.getItem("credentials");
			const parsedPersistCredentials =
				typeof candidatePersistCredentials === "string"
					? JSON.parse(candidatePersistCredentials)
					: "{}";
			const safePersistCredentials = CredentialsSchema.safeParse(
				parsedPersistCredentials,
			);

			if (safePersistCredentials.error) {
				const controller = new AbortController();
				controller.abort(new ZodError(safePersistCredentials.error.issues));
				reqConfig.signal = controller.signal;

				router.navigate(ROUTES.LOGIN);
				return reqConfig;
			}

			const { apiTokenInstance, idInstance } = safePersistCredentials.data;
			appInstanceStore.setState({ apiTokenInstance, idInstance });

			const cluster = idInstance.slice(0, 4);
			const host = new URL(BASE);

			reqConfig.baseURL = `${host.protocol}//${cluster}.${host.host}`;
			reqConfig.url = `/waInstance${idInstance}${reqConfig?.url?.startsWith("/") ? reqConfig.url : `/${reqConfig.url}`}/${apiTokenInstance}`;

			return reqConfig;
		},
		() => {},
	);

	// Response interceptor
	instance.interceptors.response.use(
		(response) => response,
		(error) => {
			return Promise.reject(error);
		},
	);

	return instance;
};

export const httpClient = createHttpClient();
