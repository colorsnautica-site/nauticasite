import { expect, test } from "@playwright/test";
import postgres from "postgres";

const password = process.env.ADMIN_PASSWORD ?? "";
const sql = postgres(process.env.TEST_DATABASE_URL!, { prepare: false });

async function login(page: import("@playwright/test").Page, value = password) {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Senha").fill(value);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.beforeEach(async () => {
  await sql`DELETE FROM admin_login_attempts`;
});

test.afterAll(async () => { await sql.end(); });

test("login válido, senha errada e bloqueio por tentativas", async ({ page }) => {
  await login(page, "senha-definitivamente-incorreta");
  await expect(page).toHaveURL(/erro=1/);
  await sql`DELETE FROM admin_login_attempts`;

  for (let attempt = 0; attempt < 5; attempt++) await login(page, "senha-definitivamente-incorreta");
  await login(page, password);
  await expect(page).toHaveURL(/erro=1/);

  await sql`DELETE FROM admin_login_attempts`;
  await login(page);
  await expect(page).toHaveURL(/\/admin$/);
});

test("acesso anônimo e submissão sem sessão são recusados", async ({ page, context }) => {
  await page.goto("/admin/produtos");
  await expect(page).toHaveURL(/\/admin\/login/);

  await login(page);
  await page.goto("/admin/produtos");
  const actionName = await page.locator('form input[name^="$ACTION_ID_"]').first().getAttribute("name");
  expect(actionName).toBeTruthy();
  await context.clearCookies();
  const response = await page.request.post("/admin/produtos", {
    maxRedirects: 0,
    form: { [actionName!]: "", id: "1", name: "Ataque", sku: "E2E-BASE", brandName: "Marca E2E", categorySlug: "linha-nautica", stockStatus: "available", unit: "UN", precoReais: "10,00" }
  });
  expect([303, 307, 308]).toContain(response.status());
  expect((await sql<{ name: string }[]>`SELECT name FROM products WHERE id=1`)[0].name).toBe("Produto base E2E");
});

test("os dois WhatsApps editados controlam texto e href públicos", async ({ page }) => {
  await login(page);
  await page.goto("/admin/conteudo");
  await page.locator('input[name="whatsapp_1"]').fill("(21) 99999-1234");
  await page.locator('input[name="whatsapp_2"]').fill("(24) 98888-5678");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Conteúdo salvo.")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: "+5521999991234" })).toHaveAttribute("href", /wa\.me\/5521999991234/);
  await expect(page.getByRole("link", { name: "+5524988885678" })).toHaveAttribute("href", /wa\.me\/5524988885678/);
});

test("valida campos e exibe mensagens operacionais", async ({ page }) => {
  await login(page);
  await page.goto("/admin/produtos");
  await page.getByText("+ Adicionar produto").click();
  const createForm = page.locator("details form");
  await createForm.locator('input[name="name"]').fill("Produto inválido");
  await createForm.locator('input[name="precoReais"]').fill("12.50");
  await createForm.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Informe um preço no formato brasileiro.")).toBeVisible();
});

test("upload válido, arquivo disfarçado e arquivo acima de 5 MB", async ({ page }) => {
  await login(page);
  await page.goto("/admin/produtos");
  await page.getByText("+ Adicionar produto").click();
  const form = page.locator("details form");
  await form.locator('input[name="name"]').fill("Produto com foto E2E");
  await form.locator('input[name="sku"]').fill("E2E-FOTO");
  await form.locator('input[type="file"]').setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]) });
  await form.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Produto adicionado.")).toBeVisible();

  await form.locator('input[name="name"]').fill("Arquivo falso");
  await form.locator('input[name="sku"]').fill("E2E-FALSO");
  await form.locator('input[type="file"]').setInputFiles({ name: "falso.png", mimeType: "image/png", buffer: Buffer.from("isto não é png") });
  await form.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText(/conteúdo do arquivo não corresponde/i)).toBeVisible();

  await form.locator('input[type="file"]').setInputFiles({ name: "grande.png", mimeType: "image/png", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await form.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText(/muito grande/i)).toBeVisible();
});

test("fluxo produto, site, histórico e desfazer", async ({ page }) => {
  await login(page);
  await page.goto("/admin/produtos");
  await page.getByText("+ Adicionar produto").click();
  const form = page.locator("details form");
  await form.locator('input[name="name"]').fill("Produto para desfazer E2E");
  await form.locator('input[name="sku"]').fill("E2E-UNDO");
  await form.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Produto adicionado.")).toBeVisible();

  await page.goto("/produtos/linha-nautica");
  await expect(page.getByText("Produto para desfazer E2E")).toBeVisible();
  await page.goto("/admin/historico");
  await page.locator("div", { hasText: "Produto para desfazer E2E" }).getByRole("button", { name: "Desfazer" }).first().click();
  await expect(page.getByText(/alteração desfeita/i)).toBeVisible();
  await page.goto("/produtos/linha-nautica");
  await expect(page.getByText("Produto para desfazer E2E")).toHaveCount(0);
});
