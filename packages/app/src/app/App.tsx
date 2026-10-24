import { StrictMode } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export const App = () => {
	return (
		<div data-testid="app-root">
			<StrictMode>
				<RouterProvider router={router} />
			</StrictMode>
		</div>
	);
};
