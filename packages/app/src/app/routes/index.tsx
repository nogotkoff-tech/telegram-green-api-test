import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout/root.layout";
import { ChatsPage, LoginPage } from "@/pages";
import { ROUTES } from "./routes";

export const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				index: true,
				path: "*",
				element: <Navigate to={ROUTES.LOGIN} replace />,
			},
			{
				path: ROUTES.LOGIN,
				element: <LoginPage />,
			},
			{
				path: ROUTES.CHATS,
				element: <ChatsPage />,
			},
		],
	},
]);
