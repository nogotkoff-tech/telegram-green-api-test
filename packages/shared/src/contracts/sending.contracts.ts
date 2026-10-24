import { z } from "zod";
import { ChatId } from "./сommon.contracts";

/** Тело запрос для отправки сообщения */
export const SendMessageRequestBodySchema = z.object({
	chatId: ChatId,
	message: z.string().min(1, "Message cannot be empty"),
});
export type SendMessageRequestBody = z.infer<
	typeof SendMessageRequestBodySchema
>;
