import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./providers";
import { router } from "./routes";

export const App = () => {
	return (
		<div data-testid="app-root">
			<QueryProvider>
				<RouterProvider router={router} />
			</QueryProvider>
		</div>
	);
};
