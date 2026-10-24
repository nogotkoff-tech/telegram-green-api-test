import {
	type ReceiveNotificationAPIResponse,
	ReceiveNotificationAPIResponseSchema,
} from "@gata/shared";
import express, { type Express, type Request, type Response } from "express";
import { ZodError } from "zod";
import { SSEManager } from "./sse.js";

export interface AppOptions {
	sseManager?: SSEManager;
}

export function createApp(options: AppOptions = {}): {
	app: Express;
	sseManager: SSEManager;
} {
	const app = express();
	const sseManager = options.sseManager ?? new SSEManager();

	// Enable CORS for frontend clients
	app.use((req, res, next) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization",
		);
		if (req.method === "OPTIONS") {
			res.sendStatus(204);
			return;
		}
		next();
	});

	// Parse JSON request bodies
	app.use(express.json({ limit: "10mb" }));

	// Health check endpoint
	app.get(["/health", "/green-api/health"], (_req: Request, res: Response) => {
		res.status(200).json({
			status: "ok",
			uptime: process.uptime(),
			connectedClients: sseManager.getClientCount(),
			timestamp: new Date().toISOString(),
		});
	});

	// Service info root endpoint
	app.get("/", (_req: Request, res: Response) => {
		res.status(200).json({
			service: "Green API Webhook Proxy & SSE Server",
			status: "running",
			endpoints: {
				webhook: "POST /green-api/webhook",
				sse: "GET /green-api/events or GET /events",
				health: "GET /health",
			},
			connectedClients: sseManager.getClientCount(),
		});
	});

	// SSE connection endpoints
	const sseEndpoints = [
		"/green-api/events",
		"/green-api/sse",
		"/events",
		"/sse",
	];
	app.get(sseEndpoints, (req: Request, res: Response) => {
		sseManager.handleConnection(req, res);
	});

	// Webhook endpoint
	const webhookEndpoints = [
		"/green-api/webhook",
		"/green-api/webhook/",
		"/webhook",
		"/webhook/",
	];

	app.get(webhookEndpoints, (_req: Request, res: Response) => {
		res.status(200).send("Green API Webhook endpoint is active");
	});

	app.post(
		webhookEndpoints,
		(
			request: Request<
				unknown,
				unknown,
				ReceiveNotificationAPIResponse | unknown
			>,
			response: Response,
		) => {
			try {
				const rawBody = request.body;
				if (!rawBody || typeof rawBody !== "object") {
					response.status(400).send("Invalid body: JSON object expected");
					return;
				}

				const candidateReceiveNotification = rawBody;
				const receiveNotificationParsed =
					ReceiveNotificationAPIResponseSchema.safeParse(
						candidateReceiveNotification,
					);

				console.log(
					"candidateReceiveNotification = ",
					candidateReceiveNotification,
					"rawBody = ",
					rawBody,
				);

				if (receiveNotificationParsed.success) {
					const idInstance =
						receiveNotificationParsed.data.body.instanceData.idInstance;

					console.log(
						"receiveNotificationParsed = ",
						receiveNotificationParsed,
					);
					// Broadcast through SSE to connected clients
					sseManager.broadcast(
						receiveNotificationParsed,
						idInstance,
						"message",
					);

					response.status(200).send(receiveNotificationParsed);
					return;
				}

				// If it is another valid Green API webhook notification (e.g. status, image, etc.)
				if (
					"typeWebhook" in candidateReceiveNotification &&
					typeof candidateReceiveNotification.typeWebhook === "string"
				) {
					const anyNotification = candidateReceiveNotification as {
						typeWebhook: string;
						instanceData?: { idInstance?: number };
					};
					const idInstance = anyNotification.instanceData?.idInstance;

					sseManager.broadcast(
						candidateReceiveNotification,
						idInstance,
						"message",
					);

					response.status(200).send(candidateReceiveNotification);
					return;
				}

				// If it doesn't match schema or webhook structure, throw Zod error
				throw receiveNotificationParsed.error;
			} catch (error: unknown) {
				if (error instanceof ZodError) {
					response.status(400).send(error.message);
				} else {
					response.sendStatus(500);
				}
			}
		},
	);

	return { app, sseManager };
}
