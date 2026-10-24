import { z } from "zod";
import {
	ChatId,
	ChatTypeUnion,
	MessageId,
	MessageKind,
} from "./сommon.contracts";

const BaseMessageFields = {
	idMessage: MessageId,
	timestamp: z.number().int().nonnegative(),
	chatId: ChatId,
	chatType: ChatTypeUnion,
	isForwarded: z.boolean(),
	forwardingScore: z.number().int().nonnegative(),
};

const MediaFields = {
	downloadUrl: z.string().url(),
	caption: z.string().optional(),
	fileName: z.string(),
	jpegThumbnail: z.string().optional(), // base64
	mimeType: z.string(),
	isAnimated: z.boolean().optional(),
};

/* ---------- incoming: textMessage ---------- */

const IncomingTextMessageSchema = z.object({
	...BaseMessageFields,
	type: z.literal("incoming"),
	typeMessage: z.literal("textMessage"),
	textMessage: z.string(),
	senderName: z.string(),
	senderType: ChatTypeUnion,
	senderContactName: z.string().optional(),
});

/* ---------- incoming: медиа-сообщения ---------- */

const IncomingMediaBase = z.object({
	...BaseMessageFields,
	...MediaFields,
	type: z.literal("incoming"),
	senderName: z.string(),
	senderType: ChatTypeUnion,
	senderContactName: z.string().optional(),
});

const IncomingImageMessageSchema = IncomingMediaBase.extend({
	typeMessage: z.literal("imageMessage"),
});
const IncomingVideoMessageSchema = IncomingMediaBase.extend({
	typeMessage: z.literal("videoMessage"),
});
const IncomingDocumentMessageSchema = IncomingMediaBase.extend({
	typeMessage: z.literal("documentMessage"),
});
const IncomingAudioMessageSchema = IncomingMediaBase.extend({
	typeMessage: z.literal("audioMessage"),
});

const IncomingOpaqueMessageSchema = z.object({
	...BaseMessageFields,
	type: z.literal("incoming"),
	typeMessage: z.enum(["pollMessage", "locationMessage"]),
	senderName: z.string(),
	senderType: ChatTypeUnion,
	senderContactName: z.string().optional(),
});

const IncomingMessageSchema = z.discriminatedUnion("typeMessage", [
	IncomingTextMessageSchema,
	IncomingImageMessageSchema,
	IncomingVideoMessageSchema,
	IncomingDocumentMessageSchema,
	IncomingAudioMessageSchema,
	IncomingOpaqueMessageSchema,
]);

/* ---------- outgoing ---------- */
const OutgoingMessageSchema = z.object({
	...BaseMessageFields,
	...MediaFields,
	type: z.literal("outgoing"),
	typeMessage: MessageKind,
	statusMessage: z.enum(["delivered", "read"]),
	sendByApi: z.boolean(),
	textMessage: z.string().optional(),
	downloadUrl: z.string().url().optional(),
	fileName: z.string().optional(),
});

/* ---------- Корневая схема ---------- */
export const MessageSchema = z.union([
	IncomingMessageSchema,
	OutgoingMessageSchema,
]);

export type IncomingMessage = z.infer<typeof IncomingMessageSchema>;
export type OutgoingMessage = z.infer<typeof OutgoingMessageSchema>;
export type IncomingTextMessage = z.infer<typeof IncomingTextMessageSchema>;
export type IncomingImageMessage = z.infer<typeof IncomingImageMessageSchema>;
export type IncomingMediaMessage = z.infer<typeof IncomingMediaBase>;
