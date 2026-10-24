import {
	GetContactInfoResponseSchema,
	type TGetContactInfoRequestBody,
} from "@gata/shared";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout/root.layout";
import { ChatPage } from "@/pages/chat";
import { ChatsPage } from "@/pages/chats";
import { LoginPage } from "@/pages/login";
import { httpClient } from "@/shared/api";
import { ROUTES } from "./routes";

export const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				index: true,
				path: "*",
				element: <Navigate to={ROUTES.CHATS} replace />,
			},
			{
				path: ROUTES.LOGIN,
				element: <LoginPage />,
			},
			{
				path: ROUTES.CHATS,
				element: <ChatsPage />,
				children: [
					{
						path: ROUTES.CHAT,
						loader: async ({ params }) => {
							try {
								const responseGetContactInfo =
									await httpClient.post<TGetContactInfoRequestBody>(
										"/getContactInfo",
										{ chatId: params.chatId },
									);
								const candidateGetContactInfo =
									GetContactInfoResponseSchema.safeParse(
										responseGetContactInfo.data,
									);

								if (
									candidateGetContactInfo.success &&
									candidateGetContactInfo.data
								) {
									return candidateGetContactInfo.data;
								} else {
									throw new Error(candidateGetContactInfo.error.message);
								}
							} catch (error) {
								console.error(error);
								router.navigate(ROUTES.CHATS, { replace: true });

								return {};
							}
						},
						Component: ChatPage,
					},
				],
			},
		],
	},
]);
