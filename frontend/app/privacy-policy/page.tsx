import type { Metadata } from "next";
import Link from "next/link";
import { Orbit, ShieldCheck } from "lucide-react";

// oxlint-disable-next-line react/only-export-components -- App Router metadata
export const metadata: Metadata = {
  title: "Privacy Policy | Graha Remedy",
  description: "Privacy policy for Graha Remedy detailing data collection, cookie usage, analytics, and third-party advertising policies.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="seo-page-wrapper">
      <header className="seo-header-bar">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            <Orbit size={24} strokeWidth={1.8} className="seo-brand-icon" />
            <span className="seo-brand-text">Graha Remedy</span>
          </Link>
          <nav className="seo-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Privacy Policy</span>
          </nav>
          <Link href="/" className="btn btn-secondary btn-sm seo-nav-cta">
            Calculator
          </Link>
        </div>
      </header>

      <main className="seo-page-main">
        <article className="seo-article">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--turquoise-dark)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>
            <ShieldCheck size={16} /> Data Transparency &amp; Protection
          </div>
          <h1 className="seo-article-title">Privacy Policy</h1>
          <p style={{ color: "var(--grey-mid)", fontSize: "0.9rem", marginBottom: 32 }}>Last Updated: September 2026</p>

          <div className="seo-content">
            <h2>1. Introduction</h2>
            <p>
              Graha Remedy (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the platform&rdquo;) is committed to protecting your privacy. This Privacy Policy explains what information we collect when you use our website, how that data is used, and how we protect your personal information.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              <strong>Birth Chart Inputs:</strong> When you use our astrological calculator, you enter your date of birth, time of birth, and place of birth (city/coordinates). This information is processed in real time by our deterministic astronomical engine to generate your planetary positions and remedies. We do not sell, rent, or monetize your personal birth information.
            </p>
            <p>
              <strong>Account Information (Optional):</strong> If you choose to create a free account to save your readings, we collect your email address and an encrypted hash of your password. We never store plaintext passwords.
            </p>

            <h2>3. Log Data and Web Analytics</h2>
            <p>
              Like most website operators, we collect non-personally-identifying information that web browsers and servers typically make available, such as browser type, language preference, referring site, and the date and time of each visitor request.
            </p>
            <p>
              We use <strong>Google Analytics (GA4)</strong> to analyze traffic patterns and improve user experience. Google Analytics uses cookies to collect anonymous usage data. You can opt out of Google Analytics tracking using Google&rsquo;s official browser add-on.
            </p>

            <h2>4. Cookies and Web Beacons</h2>
            <p>
              Cookies are small data files stored on your device. We use essential cookies to maintain your login session (if registered) and remember your preferences.
            </p>
            <p>
              <strong>Third-Party Advertisers:</strong> We may display advertisements through third-party advertising networks, such as Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on a user&rsquo;s prior visits to our website or other websites on the Internet. Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
            </p>

            <h2>5. Data Security</h2>
            <p>
              The security of your data is paramount to us. We employ standard Transport Layer Security (TLS/HTTPS) encryption across our entire application to protect data transmitted between your browser and our servers.
            </p>

            <h2>6. Children&rsquo;s Privacy</h2>
            <p>
              Our website is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please reach out to us via our <Link href="/contact">Contact Page</Link>.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
