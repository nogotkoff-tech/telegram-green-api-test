import { z } from "zod";

export const ChatId = z.string().min(1, "chatId is required");
export type TChatId = z.infer<typeof ChatId>;

export const ChatTypeUnion = z.union([
	z.literal("supergroup"),
	z.literal("channel"),
	z.literal("bot"),
	z.literal("user"),
]);
export type TChatTypeUnion = z.infer<typeof ChatTypeUnion>;

export const MessageId = z.string().min(1, "message id is required");
export type TMessageId = z.infer<typeof MessageId>;
