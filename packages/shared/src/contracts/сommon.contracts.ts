import { z } from "zod";

export const ChatId = z.string().min(1, "chatId is required");
export type TChatId = z.infer<typeof ChatId>;

export const ChatTypeUnion = z.enum([
	"supergroup",
	"group",
	"channel",
	"bot",
	"user",
]);
export type TChatTypeUnion = z.infer<typeof ChatTypeUnion>;

export const MessageId = z.string().min(1, "message id is required");
export type TMessageId = z.infer<typeof MessageId>;

export const MessageKind = z.enum(["incoming", "outgoing"]);
export type TMessageKind = z.infer<typeof MessageId>;
