import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";

export const createTestQueryClient = () => {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: Infinity,
			},
			mutations: {
				retry: false,
			},
		},
	});
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	queryClient?: QueryClient;
}

export const renderWithProviders = (
	ui: ReactElement,
	options?: CustomRenderOptions,
) => {
	const queryClient = options?.queryClient ?? createTestQueryClient();

	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return {
		...render(ui, { wrapper: Wrapper, ...options }),
		queryClient,
	};
};

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
