import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { queryClient as defaultClient } from "@/shared/api";

interface QueryProviderProps {
	children: ReactNode;
	client?: typeof defaultClient;
}

export const QueryProvider = ({
	children,
	client = defaultClient,
}: QueryProviderProps) => {
	return (
		<QueryClientProvider client={client}>
			{children}
			{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
};
