import { z } from "zod";

export const CredentialsSchema = z.object({
	idInstance: z
		.string()
		.min(1, "idInstance is required")
		.regex(/^\d+$/, "idInstance must contain only digits"),
	apiTokenInstance: z
		.string()
		.min(1, "apiTokenInstance is required")
		.length(50, "apiTokenInstance should be 50 characters long"),
});

export type Credentials = z.infer<typeof CredentialsSchema>;
