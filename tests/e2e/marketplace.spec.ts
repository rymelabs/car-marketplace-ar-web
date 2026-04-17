import { expect, test } from "@playwright/test";

test("buyer can browse listings, open detail page, and submit inquiry", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /shop cars with true-scale ar/i })).toBeVisible();

  const detailLinks = page.getByRole("link", { name: /view details/i });
  await expect(detailLinks.first()).toBeVisible();
  await detailLinks.first().click();

  await expect(page.getByRole("heading", { name: /ar preview/i })).toBeVisible();

  await page.getByLabel("Full name").fill("Playwright Buyer");
  await page.getByLabel("Email").fill("playwright@example.com");
  await page
    .getByLabel("Message")
    .fill("I want to schedule a call about this car and available viewing slots.");

  await page.getByRole("button", { name: /submit inquiry/i }).click();
  await expect(page.getByText(/inquiry submitted/i)).toBeVisible();
});
