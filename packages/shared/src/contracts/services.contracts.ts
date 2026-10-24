import { z } from "zod";
import { ChatId, ChatTypeUnion } from "./сommon.contracts";

/** Проверить аккаунт на наличие контактов */
export const CheckAccountResponseSchema = z.object({
	exist: z.boolean(),
	chatId: ChatId,
	username: z.string(),
	phoneNumber: z.number(),
	fromCache: z.boolean(),
});
export type TCheckAccountResponse = z.infer<typeof CheckAccountResponseSchema>;
export const CheckAccountRequestBodySchema = z.object({
	phoneNumber: z.string().or(z.number()),
});
export type TCheckAccountRequestBody = z.infer<
	typeof CheckAccountRequestBodySchema
>;

/** Информация о чате */
const ChatResponseSchema = z.object({
	chatId: ChatId,
	name: z.string(),
	type: ChatTypeUnion,
	phoneNumber: z.number(),
	username: z.string(),
});
/** Получить список чатов */
export const GetChatsResponseSchema = z.array(ChatResponseSchema).default([]);
export type TGetChatsResponse = z.infer<typeof GetChatsResponseSchema>;
