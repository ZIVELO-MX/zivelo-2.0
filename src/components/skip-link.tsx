import { getTranslations } from "next-intl/server";

export async function SkipLink() {
  const t = await getTranslations("Nav");

  return (
    <a href="#main-content" className="skip-link">
      {t("skipToContent")}
    </a>
  );
}
