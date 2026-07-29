import { expect, test } from "@playwright/test";

test.describe("Carrinho de compras", () => {
  test("adicionar produto, revisar no carrinho e finalizar no WhatsApp", async ({ page, context }) => {
    await page.goto("/produtos");

    const firstCard = page.locator("article").first();
    const productName = await firstCard.locator("h3").innerText();

    await firstCard.getByRole("button", { name: /adicionar .* ao carrinho/i }).click();

    const cartButton = page.getByRole("button", { name: /abrir carrinho/i });
    await expect(cartButton).toContainText("1");

    await cartButton.click();
    const cartModal = page.getByRole("dialog", { name: "Seu carrinho" });
    await expect(cartModal).toBeVisible();
    await expect(cartModal).toContainText(productName);

    const [whatsappPage] = await Promise.all([
      context.waitForEvent("page"),
      cartModal.getByRole("link", { name: /finalizar no whatsapp/i }).click()
    ]);
    await whatsappPage.waitForLoadState("domcontentloaded");
    expect(whatsappPage.url()).toContain("wa.me");
    expect(decodeURIComponent(whatsappPage.url())).toContain(productName);
  });

  test("abrir detalhe do produto e ajustar quantidade antes de adicionar", async ({ page }) => {
    await page.goto("/produtos");

    const firstCard = page.locator("article").first();
    await firstCard.locator("h3").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/produtos\/[^/]+\/[^/]+$/);

    await dialog.getByRole("button", { name: "Aumentar quantidade" }).click();
    await expect(dialog.getByText("2", { exact: true })).toBeVisible();

    await dialog.getByRole("button", { name: /adicionar ao carrinho/i }).click();
    await expect(page.getByRole("button", { name: /abrir carrinho/i })).toContainText("2");
  });

  test("carrinho persiste depois de recarregar a página", async ({ page }) => {
    await page.goto("/produtos");
    await page.locator("article").first().getByRole("button", { name: /adicionar .* ao carrinho/i }).click();
    await expect(page.getByRole("button", { name: /abrir carrinho/i })).toContainText("1");

    await page.reload();
    await expect(page.getByRole("button", { name: /abrir carrinho/i })).toContainText("1");
  });
});
