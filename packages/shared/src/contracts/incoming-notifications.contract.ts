import { z } from "zod";
import { ChatId, ChatTypeUnion, MessageId } from "./brands.data";

export const ReceiptId = z.number();
export type TReceiptId = z.infer<typeof ReceiptId>;

export const IncomingTextMessageNotificationsFormatSchema = z.object({
	typeWebhook: z.literal("incomingMessageReceived"),
	instanceData: z.object({
		idInstance: z.number(),
		wid: z.string(),
		typeInstance: z.literal("telegram"),
	}),
	timestamp: z.number(),
	idMessage: MessageId,
	senderData: z.object({
		chatId: ChatId,
		chatType: ChatTypeUnion.optional(),
		sender: ChatId,
		chatName: z.string(),
		senderName: z.string(),
		senderType: ChatTypeUnion.optional(),
		senderContactName: z.string(),
		senderPhoneNumber: z.number(),
	}),
	messageData: z.object({
		typeMessage: z.literal("textMessage"),
		textMessageData: z.object({
			textMessage: z.string(),
			forwardingScore: z.number().optional(),
			isForwarded: z.boolean().optional(),
		}),
	}),
});
export type IncomingTextMessageNotificationsFormat = z.infer<
	typeof IncomingTextMessageNotificationsFormatSchema
>;

export const ReceiveNotificationAPIResponseSchema = z.object({
	receiptId: ReceiptId,
	body: z.union([IncomingTextMessageNotificationsFormatSchema, z.unknown()]),
});
export type ReceiveNotificationAPIResponse = z.infer<
	typeof ReceiveNotificationAPIResponseSchema
>;
