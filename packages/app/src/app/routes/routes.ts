export const ROUTES = {
	LOGIN: "/login",
	CHATS: "/chats",
	CHAT: "/chats/:chatId",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
