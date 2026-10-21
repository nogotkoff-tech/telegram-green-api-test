import { z } from "zod";
import { ChatId, ChatTypeUnion } from "./brands.data";

/** Проверить аккаунт на наличие контактов */
export const CheckAccountAPIResponseSchema = z.object({
	exists: z.boolean(),
	chatId: ChatId,
	username: z.string(),
	phoneNumber: z.number(),
	fromCache: z.boolean(),
});
export type TCheckAccountAPIResponse = z.infer<
	typeof CheckAccountAPIResponseSchema
>;

/** Информация о чате */
const ChatAPIResponseSchema = z.object({
	chatId: ChatId,
	name: z.string(),
	type: ChatTypeUnion,
	phoneNumber: z.string(),
	username: z.string(),
});
/** Получить список чатов */
export const GetChatsAPIResponseSchema = z.array(ChatAPIResponseSchema);
export type TGetChatsAPIResponse = z.infer<typeof GetChatsAPIResponseSchema>;

/** Получить полную информацию о существующем контакте */
export const GetContactInfoSchema = z.object({
	avatar: z.string(),
	name: z.string(),
	contactName: z.string(),
	chatId: ChatId,
	chatType: ChatTypeUnion,
	lastSeen: z.number(),
	phoneNumber: z.number(),
	phoneNumberTimestamp: z.number(),
	username: z.string(),
	isPremium: z.boolean(),
	isVerified: z.boolean(),
	isScam: z.boolean(),
	description: z.string(),
});
export type TGetContactInfo = z.infer<typeof GetContactInfoSchema>;
