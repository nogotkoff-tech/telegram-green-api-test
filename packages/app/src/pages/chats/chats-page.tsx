import { GetChatsResponseSchema, type TGetChatsResponse } from "@gata/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { generatePath, Link, Outlet } from "react-router-dom";
import { ROUTES } from "@/app/routes/routes";
import { BootstrapChat } from "@/features/bootstrap-chat";
import { httpClient } from "@/shared/api";
import { Box, ChatList, ChatListItem, Sidebar } from "./chats.page.styles";

export const ChatsPage = () => {
	const isMounted = useRef(false);
	const [chats, setChats] = useState<TGetChatsResponse>([]);

	const fetchChats = useCallback(async () => {
		if (isMounted.current) return;
		isMounted.current = true;

		const { data: chats } =
			await httpClient.get<TGetChatsResponse>("/getChats");
		const safeChats = GetChatsResponseSchema.safeParse(chats);

		if (safeChats.success) {
			setChats(safeChats.data.filter((chat) => chat.type === "user"));
		} else {
			console.error(safeChats.error.message);
		}
	}, []);

	useEffect(() => {
		fetchChats();
	}, [fetchChats]);

	return (
		<Box data-testid="chats-page">
			<Sidebar>
				<BootstrapChat />
				<ChatList>
					{chats.map((chat) => (
						<ChatListItem key={chat.chatId}>
							<Link to={generatePath(ROUTES.CHAT, { chatId: chat.chatId })}>
								{chat.name}
							</Link>
						</ChatListItem>
					))}
				</ChatList>
			</Sidebar>
			<Outlet />
		</Box>
	);
};
