import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Reveal } from "@/components/reveal";
import { Faq } from "@/components/faq";
import { SocialLinks } from "@/components/social-links";
import { ContactForm } from "@/components/contact-form";
import { ScrollToButton } from "@/components/scroll-to-button";
import { buildMetadata } from "@/lib/seo";
import { CONTACT } from "@/lib/site-constants";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Contact" });
  return buildMetadata({
    locale,
    path: "/contact",
    title: `${t("heroEyebrow")} | ZIVELO`,
    description: t("heroLead"),
  });
}

export default async function Contact({ params }: PageParams) {
  const { locale } = await resolveParams(params);
  const t = await getTranslations("Contact");

  const faqItems = [1, 2, 3, 4, 5].map((n) => ({
    q: t(`faq${n}Q`),
    a: t(`faq${n}A`),
  }));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 className="page-hero__title">{t("heroTitle")}</h1>
          <p className="lead page-hero__lead">{t("heroLead")}</p>
          <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a className="btn btn--primary" href={CONTACT.whatsappUrl} target="_blank" rel="noopener">
              {t("ctaWhatsapp")} <span className="arrow">→</span>
            </a>
            <ScrollToButton targetId="form" className="btn btn--ghost">{t("ctaFillForm")}</ScrollToButton>
          </div>
        </div>
      </section>

      <section className="section--tight bg-surface divider-top" id="form" style={{ paddingBlock: "clamp(56px,7vw,96px)" }}>
        <div className="container">
          <div className="contact__grid" style={{ alignItems: "stretch" }}>
            <Reveal>
              <h2 className="h3">{t("reachTitle")}</h2>
              <div className="contact__details" style={{ borderTopColor: "var(--line)", marginTop: 28 }}>
                <div>
                  <div className="cdetail__k">Email</div>
                  <div className="cdetail__v"><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
                </div>
                <div>
                  <div className="cdetail__k">{t("phoneLabel")}</div>
                  <div className="cdetail__v"><a href={`tel:${CONTACT.phoneTel}`}>🇲🇽 {CONTACT.phoneDisplay}</a></div>
                </div>
                <div>
                  <div className="cdetail__k">{t("locationLabel")}</div>
                  <div className="cdetail__v">{t("locationValue")}</div>
                </div>
                <div>
                  <div className="cdetail__k">{t("responseLabel")}</div>
                  <div className="cdetail__v">{t("responseValue")}</div>
                </div>
              </div>
              <div style={{ marginTop: 32 }}>
                <div className="cdetail__k" style={{ marginBottom: 4 }}>{t("followUs")}</div>
                <div style={{ marginTop: 12 }}>
                  <SocialLinks />
                </div>
              </div>
            </Reveal>

            <Reveal delay={1} className="cform" style={{ border: "1px solid var(--line)" }}>
              <ContactForm
                labels={{
                  formTitle: t("formTitle"),
                  formSub: t("formSub"),
                  nameLabel: t("nameLabel"),
                  nameErr: t("nameErr"),
                  companyLabel: t("companyLabel"),
                  emailLabel: t("emailLabel"),
                  emailErr: t("emailErr"),
                  topicLabel: t("topicLabel"),
                  topicOptions: [t("topic1"), t("topic2"), t("topic3"), t("topic4")],
                  messageLabel: t("messageLabel"),
                  messageErr: t("messageErr"),
                  submitLabel: t("submitLabel"),
                  formNote: t("formNote"),
                  successTitle: t("successTitle"),
                  successSub: t("successSub"),
                }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">{t("faqTitle")}</h2>
            </Reveal>
          </div>
          <Reveal>
            <Faq items={faqItems} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
