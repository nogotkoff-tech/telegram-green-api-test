import type { IncomingTextMessageNotificationsFormat } from "@gata/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { SSEManager } from "./sse.js";

const sampleMessageNotification: IncomingTextMessageNotificationsFormat = {
	typeWebhook: "incomingMessageReceived",
	instanceData: {
		idInstance: 1101820982,
		wid: "1101820982@c.us",
		typeInstance: "telegram",
	},
	timestamp: 1588079856,
	idMessage: "F65A844A54F00E0200E520A865B8AB27",
	senderData: {
		chatId: "79001234567@c.us",
		chatName: "Ivan",
		sender: "79001234567@c.us",
		senderName: "Ivan",
		senderContactName: "Ivan",
		senderPhoneNumber: 79001234567,
	},
	messageData: {
		typeMessage: "textMessage",
		textMessageData: {
			textMessage: "Hello from Green API!",
		},
	},
};

describe("Green API Proxy Webhooks & SSE Server", () => {
	let server: ReturnType<ReturnType<typeof createApp>["app"]["listen"]>;
	let sseManager: SSEManager;
	let baseUrl: string;

	beforeAll(async () => {
		sseManager = new SSEManager();
		const { app } = createApp({ sseManager });

		await new Promise<void>((resolve) => {
			server = app.listen(0, "127.0.0.1", () => {
				const address = server.address();
				if (address && typeof address === "object") {
					baseUrl = `http://127.0.0.1:${address.port}`;
				}
				resolve();
			});
		});
	});

	afterAll(async () => {
		sseManager.closeAll();
		await new Promise<void>((resolve, reject) => {
			server.close((err) => (err ? reject(err) : resolve()));
		});
	});

	it("returns 200 for healthcheck endpoint", async () => {
		const res = await fetch(`${baseUrl}/health`);
		expect(res.status).toBe(200);

		const data = (await res.json()) as { status: string; connectedClients: number };
		expect(data.status).toBe("ok");
		expect(typeof data.connectedClients).toBe("number");
	});

	it("handles CORS OPTIONS preflight", async () => {
		const res = await fetch(`${baseUrl}/green-api/webhook`, {
			method: "OPTIONS",
		});
		expect(res.status).toBe(204);
		expect(res.headers.get("access-control-allow-origin")).toBe("*");
	});

	it("establishes an SSE connection and receives initial handshake", async () => {
		const res = await fetch(`${baseUrl}/green-api/events`);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/event-stream");
		expect(res.headers.get("cache-control")).toContain("no-cache");
		expect(res.headers.get("x-accel-buffering")).toBe("no");

		const reader = res.body?.getReader();
		expect(reader).toBeDefined();

		const { value } = await reader!.read();
		const chunk = new TextDecoder().decode(value);

		expect(chunk).toContain("event: connected");
		expect(chunk).toContain('"status":"connected"');

		// Cleanup connection
		await reader!.cancel();
	});

	it("processes direct webhook POST and broadcasts notification to SSE client", async () => {
		const sseRes = await fetch(`${baseUrl}/green-api/events?idInstance=1101820982`);
		const reader = sseRes.body?.getReader();
		expect(reader).toBeDefined();

		// Read handshake
		await reader!.read();

		// Send webhook payload (direct push format)
		const webhookRes = await fetch(`${baseUrl}/green-api/webhook`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(sampleMessageNotification),
		});

		expect(webhookRes.status).toBe(200);
		const webhookData = await webhookRes.json();
		expect(webhookData.idMessage).toBe("F65A844A54F00E0200E520A865B8AB27");

		// Read broadcasted SSE event
		const { value } = await reader!.read();
		const sseChunk = new TextDecoder().decode(value);

		expect(sseChunk).toContain("event: message");
		expect(sseChunk).toContain("Hello from Green API!");
		expect(sseChunk).toContain("F65A844A54F00E0200E520A865B8AB27");

		await reader!.cancel();
	});

	it("processes wrapped webhook POST ({ receiptId, body }) and broadcasts", async () => {
		const sseRes = await fetch(`${baseUrl}/green-api/events`);
		const reader = sseRes.body?.getReader();
		expect(reader).toBeDefined();

		// Read handshake
		await reader!.read();

		// Send wrapped webhook payload
		const webhookRes = await fetch(`${baseUrl}/green-api/webhook/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				receiptId: 998877,
				body: sampleMessageNotification,
			}),
		});

		expect(webhookRes.status).toBe(200);

		// Read broadcasted SSE event
		const { value } = await reader!.read();
		const sseChunk = new TextDecoder().decode(value);

		expect(sseChunk).toContain("Hello from Green API!");

		await reader!.cancel();
	});

	it("filters SSE events by idInstance", async () => {
		// Client 1: filters for 1101820982
		const sseRes1 = await fetch(`${baseUrl}/green-api/events?idInstance=1101820982`);
		const reader1 = sseRes1.body?.getReader()!;
		await reader1.read(); // handshake

		// Client 2: filters for 9999999 (different instance)
		const sseRes2 = await fetch(`${baseUrl}/green-api/events?idInstance=9999999`);
		const reader2 = sseRes2.body?.getReader()!;
		await reader2.read(); // handshake

		// Post webhook for instance 1101820982
		await fetch(`${baseUrl}/green-api/webhook`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(sampleMessageNotification),
		});

		// Client 1 should receive message
		const { value: val1 } = await reader1.read();
		const chunk1 = new TextDecoder().decode(val1);
		expect(chunk1).toContain("Hello from Green API!");

		// Client 2 should NOT receive the message within a short timeout
		const readPromise = reader2.read();
		const timeoutPromise = new Promise<{ timeout: boolean }>((resolve) =>
			setTimeout(() => resolve({ timeout: true }), 150),
		);
		const result = await Promise.race([readPromise, timeoutPromise]);
		expect("timeout" in result && result.timeout).toBe(true);

		await reader1.cancel();
		await reader2.cancel();
	});

	it("returns 400 Bad Request for invalid webhook payload", async () => {
		const res = await fetch(`${baseUrl}/green-api/webhook`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ invalid: "data" }),
		});

		expect(res.status).toBe(400);
	});
});
