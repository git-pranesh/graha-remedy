import type { Metadata } from "next";
import Breadcrumbs from "@/src/components/site/Breadcrumbs";
import Link from "next/link";
import { Mail, MessageSquare, Orbit, Sparkles } from "lucide-react";

// oxlint-disable-next-line react/only-export-components -- App Router metadata
export const metadata: Metadata = {
  title: "Contact Us & Feedback | Graha Remedy",
  description: "Contact the Graha Remedy editorial and development team for questions, feedback, or corrections on Vedic remedy guides.",
};

export default function ContactPage() {
  return (
    <div className="seo-page-wrapper">

      <main className="seo-page-main">
        <div className="crumbs-bar"><Breadcrumbs items={[{ name: "Contact &amp; Corrections", path: "/contact" }]} /></div>
        <article className="seo-article">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--turquoise-dark)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>
            <MessageSquare size={16} /> Inquiries &amp; Corrections
          </div>
          <h1 className="seo-article-title">Contact Us</h1>
          <p style={{ color: "var(--grey-mid)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 32 }}>
            We welcome questions, scholarly corrections on Sanskrit transliterations, technical bug reports, or feedback about the Graha Remedy platform.
          </p>

          <div className="seo-content">
            <h2>Get in Touch</h2>
            <p>
              Graha Remedy is an open, independent project. Whether you have noticed a typographical error in our mantra guides, wish to suggest a classical Jyotish reference, or have feedback on our birth chart calculator, we would love to hear from you.
            </p>

            <div style={{ background: "var(--fill)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px", margin: "24px 0", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--card-bg)", color: "var(--turquoise-dark)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(19,52,59,0.08)" }}>
                <Mail size={22} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--grey-mid)" }}>Direct Editorial Email</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>
                  contact@graharemedy.com
                </div>
              </div>
            </div>

            <h2>What to Include in Your Message</h2>
            <ul>
              <li><strong>Scriptural Corrections:</strong> If you are pointing out a variation in mantra transliteration or deity description, please cite the classical text (e.g., BPHS, Phaladeepika, Valmiki Ramayana) so our editorial team can verify it.</li>
              <li><strong>Calculation Bug Reports:</strong> If you notice an unexpected planetary position or timezone discrepancy, please include the birth date, exact time, city/country, and expected degree.</li>
              <li><strong>General Inquiries:</strong> We aim to reply to all genuine non-spam correspondence within 48 to 72 business hours.</li>
            </ul>

            <h2>Astrological Consultation Policy</h2>
            <p>
              Please note that <strong>we do not offer paid 1-on-1 personal astrology consultations</strong>, telephone psychic sessions, or manual horoscope readings. Graha Remedy is an automated, free research platform designed to empower individuals with self-guided classical remedies.
            </p>

            <div style={{ textAlign: "center", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
              <Link href="/" className="btn btn-primary">
                <Sparkles size={16} /> Try the Free Calculator
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
