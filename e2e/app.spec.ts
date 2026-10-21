import { expect, test } from "@playwright/test";

test.describe("Application smoke test", () => {
	test("should load the page and redirect to login", async ({ page }) => {
		await page.goto("/");

		const appRoot = page.getByTestId("app-root");
		await expect(appRoot).toBeVisible();

		const loginPage = page.getByTestId("login-page");
		await expect(loginPage).toBeVisible();

		const title = page.getByRole("heading", { level: 1 });
		await expect(title).toHaveText("Login");
	});

	test("should navigate to chats page", async ({ page }) => {
		await page.goto("/chats");

		const chatsPage = page.getByTestId("chats-page");
		await expect(chatsPage).toBeVisible();

		const title = page.getByRole("heading", { level: 1 });
		await expect(title).toHaveText("Chats");
	});
});
