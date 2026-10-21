export const ROUTES = {
	LOGIN: "/login",
	CHATS: "/chats",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
