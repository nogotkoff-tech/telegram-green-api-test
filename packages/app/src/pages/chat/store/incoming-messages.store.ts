import type { IncomingTextMessageNotificationsFormat } from "@gata/shared";
import { createStore } from "zustand";

type IncomingMessage = Pick<
	IncomingTextMessageNotificationsFormat,
	"idMessage" | "senderData" | "messageData" | "timestamp"
>;

export const messagesStore = createStore<{
	messages: IncomingMessage[];
	addMessage: (message: IncomingMessage) => void;
	resetMessages: () => void;
}>((set) => ({
	messages: [],
	addMessage: (message) =>
		set((state) => ({ messages: [...state.messages, message] })),
	resetMessages: () => set(() => ({ messages: [] })),
}));
