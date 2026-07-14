import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT, PROJECT_LINKS } from "@/lib/site-constants";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link className="brand" href="/">
              <Logo footer />
            </Link>
            <p className="footer__tag">{t("tag")}</p>
            <SocialLinks />
          </div>

          <div className="footer__col">
            <h2>{t("company")}</h2>
            <ul>
              <li><Link href="/about">{t("aboutUs")}</Link></li>
              <li><Link href="/process">{t("process")}</Link></li>
              <li><Link href="/technologies">{t("technologies")}</Link></li>
              <li><Link href="/contact">{t("contact")}</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>{t("services")}</h2>
            <ul>
              <li><Link href="/services">{t("webDev")}</Link></li>
              <li><Link href="/services">{t("restaurants")}</Link></li>
              <li><Link href="/services">{t("pos")}</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>{t("projects")}</h2>
            <ul>
              <li><a href={PROJECT_LINKS.kodaFidelity} target="_blank" rel="noopener">Koda Fidelity</a></li>
              <li><a href={PROJECT_LINKS.stickio} target="_blank" rel="noopener">Stickio</a></li>
              <li><a href={PROJECT_LINKS.ziveloQuotes} target="_blank" rel="noopener">ZIVELO Quotes</a></li>
              <li><a href={PROJECT_LINKS.prompt2git} target="_blank" rel="noopener">Prompt2Git</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>{t("contact")}</h2>
            <ul>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><a href={`tel:${CONTACT.phoneTel}`}>🇲🇽 {CONTACT.phoneDisplay}</a></li>
              <li><Link href="/contact">{t("contactUs")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__copy">
            &copy; <span>{new Date().getFullYear()}</span> ZIVELO. {t("rightsReserved")}
          </span>
          <div className="footer__legal">
            <Link href="/privacy">{t("privacy")}</Link>
            <Link href="/terms">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
