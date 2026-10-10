import type { Metadata } from "next";
import Breadcrumbs from "@/src/components/site/Breadcrumbs";
import Link from "next/link";
import { Orbit, Scale } from "lucide-react";

// oxlint-disable-next-line react/only-export-components -- App Router metadata
export const metadata: Metadata = {
  title: "Terms of Service & Spiritual Disclaimer | Graha Remedy",
  description: "Terms of use and spiritual disclaimer for Graha Remedy astrology calculator and remedial guides.",
};

export default function TermsPage() {
  return (
    <div className="seo-page-wrapper">

      <main className="seo-page-main">
        <div className="crumbs-bar"><Breadcrumbs items={[{ name: "Terms of Service", path: "/terms" }]} /></div>
        <article className="seo-article">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--turquoise-dark)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>
            <Scale size={16} /> Legal &amp; Spiritual Terms
          </div>
          <h1 className="seo-article-title">Terms of Service &amp; Disclaimer</h1>
          <p style={{ color: "var(--grey-mid)", fontSize: "0.9rem", marginBottom: 32 }}>Last Updated: September 2026</p>

          <div className="seo-content">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Graha Remedy (&ldquo;the website&rdquo;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Spiritual &amp; Astrological Disclaimer</h2>
            <p>
              Vedic astrology (<em>Jyotish</em>), mantras, vrat (fasting), daan (charity), and temple rituals presented on this platform are traditional spiritual and contemplative practices rooted in classical Indian heritage.
            </p>
            <blockquote>
              <strong>Important Notice:</strong> Astrological remedies are sacred cultural disciplines intended for spiritual introspection, mindfulness, and personal cultivation. They do not constitute scientific, medical, psychiatric, financial, or legal advice.
            </blockquote>
            <p>
              Never disregard professional medical diagnosis, delay seeking psychiatric care, or make critical financial/legal decisions based solely on astrological interpretations.
            </p>

            <h2>3. Deterministic Philosophy (Zero AI Output)</h2>
            <p>
              Our birth chart calculations use deterministic astronomical ephemeris algorithms to calculate planetary degrees, lagna, and dasha periods. Remedy mappings follow rule-based classical texts rather than generative AI black boxes. However, astrology is inherently interpretive, and no outcome or prediction is ever guaranteed.
            </p>

            <h2>4. Free Forever Commitment</h2>
            <p>
              Graha Remedy provides its core calculator and remedy recommendations free of charge. We do not charge fees, demand hidden subscriptions, or sell paid consultation packages.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              Under no circumstances shall Graha Remedy, its founders, or contributors be held liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to or use of this website.
            </p>

            <h2>6. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, without giving effect to any principles of conflicts of law.
            </p>

            <h2>7. Contact</h2>
            <p>
              Questions regarding these terms may be submitted through our <Link href="/contact">Contact Page</Link>.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
