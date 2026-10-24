import { z } from "zod";
import { ChatId, ChatTypeUnion } from "./сommon.contracts";

export const AddContactRequestBodySchema = z.object({
	chatId: ChatId,
	firstName: z.string(),
	lastName: z.string(),
});
export type TAddContactRequestBody = z.infer<
	typeof AddContactRequestBodySchema
>;

/** Получить полную информацию о существующем контакте */
export const GetContactInfoResponseSchema = z.object({
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
export type TGetContactResponseInfo = z.infer<
	typeof GetContactInfoResponseSchema
>;
export const GetContactInfoRequestBodySchema = z.object({
	chatId: ChatId,
});
export type TGetContactInfoRequestBody = z.infer<
	typeof GetContactInfoRequestBodySchema
>;
