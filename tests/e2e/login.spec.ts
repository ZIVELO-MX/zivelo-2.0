import { expect, test } from "@playwright/test";

test.describe("localized Zoho login", () => {
  for (const [locale, title, provider, back] of [
    ["es", "Iniciar sesión", "Iniciar sesión con Zoho", "Volver al sitio"],
    ["en", "Sign in", "Sign in with Zoho", "Back to the site"],
  ] as const) {
    test(`${locale} renders the accessible provider card`, async ({ page }) => {
      await page.goto(`/${locale}/login`);

      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      const providerNote = page.locator("#login-provider-note");
      await expect(providerNote).toBeVisible();
      const signIn = page.getByRole("button", { name: provider });
      await expect(signIn).toHaveAttribute("aria-describedby", "login-provider-note");
      await expect(page.getByRole("link", { name: back })).toHaveAttribute(
        "href",
        `/${locale}`,
      );

      await signIn.focus();
      await expect(signIn).toBeFocused();
    });
  }

  for (const [error, message] of [
    ["no_code", "No se recibió el código de autorización."],
    ["auth_failed", "Autenticación fallida. Intenta de nuevo."],
    ["AccessDenied", "Acceso denegado. Tu correo no está registrado como administrador."],
    ["unexpected", "Autenticación fallida. Intenta de nuevo."],
  ] as const) {
    test(`announces a safe Spanish error for ${error}`, async ({ page }) => {
      await page.goto(`/es/login?error=${error}`);
      const alert = page.locator("p.login-error[role='alert']");
      await expect(alert).toHaveText(message);
      await expect(alert).not.toContainText(error);
    });
  }

  test("disables the CTA while the OAuth boundary is pending", async ({ page }) => {
    await page.route("**/api/auth/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/es/login");
    const signIn = page.getByRole("button", { name: "Iniciar sesión con Zoho" });
    await signIn.click();
    await expect(signIn).toBeDisabled();
    await expect(signIn).toContainText("Redirigiendo");
  });
});
