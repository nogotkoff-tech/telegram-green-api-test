import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

export interface SSEClient {
	id: string;
	idInstance?: number;
	req: Request;
	res: Response;
	connectedAt: Date;
	pingTimer: NodeJS.Timeout;
}

export class SSEManager {
	private clients: Map<string, SSEClient> = new Map();

	/**
	 * Registers a new SSE client, sends headers and initial handshake,
	 * and starts heartbeat keepalive.
	 */
	public handleConnection(req: Request, res: Response): SSEClient {
		const clientId = randomUUID();

		// Parse optional idInstance filter from query params
		let idInstance: number | undefined;
		if (req.query.idInstance) {
			const parsed = Number(req.query.idInstance);
			if (!Number.isNaN(parsed)) {
				idInstance = parsed;
			}
		}

		// Required SSE headers
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no", // Disable proxy buffering (e.g. Nginx)
			"Access-Control-Allow-Origin": "*",
		});

		// Send initial connected event
		res.write(
			`event: connected\ndata: ${JSON.stringify({
				status: "connected",
				clientId,
				idInstance: idInstance ?? null,
				timestamp: Date.now(),
			})}\n\n`,
		);

		// Keepalive ping every 25 seconds to prevent intermediate proxy timeout
		const pingTimer = setInterval(() => {
			try {
				res.write(": ping\n\n");
			} catch {
				this.removeClient(clientId);
			}
		}, 25000);

		const client: SSEClient = {
			id: clientId,
			idInstance,
			req,
			res,
			connectedAt: new Date(),
			pingTimer,
		};

		this.clients.set(clientId, client);

		const cleanup = () => {
			this.removeClient(clientId);
		};

		req.on("close", cleanup);
		req.on("error", cleanup);
		res.on("close", cleanup);
		res.on("error", cleanup);

		return client;
	}

	/**
	 * Removes an SSE client and clears keepalive timer.
	 */
	public removeClient(clientId: string): void {
		const client = this.clients.get(clientId);
		if (client) {
			clearInterval(client.pingTimer);
			this.clients.delete(clientId);
			try {
				if (!client.res.writableEnded) {
					client.res.end();
				}
			} catch {
				// Ignore if already ended
			}
		}
	}

	/**
	 * Broadcasts an event payload to connected clients.
	 * If idInstance is provided, clients with a different idInstance filter will be skipped.
	 * Clients without an idInstance filter receive all broadcasts.
	 */
	public broadcast(
		data: unknown,
		idInstance?: number | null,
		eventName = "message",
	): number {
		let deliveredCount = 0;
		const payload = typeof data === "string" ? data : JSON.stringify(data);
		const message = `event: ${eventName}\ndata: ${payload}\n\n`;

		for (const [clientId, client] of this.clients.entries()) {
			// If client requested a specific instance, only send if it matches
			if (
				client.idInstance !== undefined &&
				idInstance !== undefined &&
				idInstance !== null &&
				client.idInstance !== idInstance
			) {
				continue;
			}

			try {
				client.res.write(message);
				deliveredCount++;
			} catch {
				this.removeClient(clientId);
			}
		}

		return deliveredCount;
	}

	/**
	 * Returns current number of active SSE connections.
	 */
	public getClientCount(): number {
		return this.clients.size;
	}

	/**
	 * Returns client metadata for health and monitoring.
	 */
	public getClientsInfo(): Array<{
		id: string;
		idInstance?: number;
		connectedAt: string;
	}> {
		return Array.from(this.clients.values()).map((c) => ({
			id: c.id,
			idInstance: c.idInstance,
			connectedAt: c.connectedAt.toISOString(),
		}));
	}

	/**
	 * Closes all active connections (useful for server shutdown and tests).
	 */
	public closeAll(): void {
		for (const clientId of Array.from(this.clients.keys())) {
			this.removeClient(clientId);
		}
	}
}
