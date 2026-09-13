import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "../src/index.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://graharemedy.com";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs in the layout.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Graha Remedy | Free Vedic Astrology Remedies",
    template: "%s | Graha Remedy",
  },
  description: "Free, rule-based Vedic astrology platform providing classical mantras, fasting schedules, and spiritual remedies with zero AI hallucination.",
  openGraph: {
    title: "Graha Remedy | Free Vedic Astrology Remedies",
    description: "Classical Jyotish remedies based on birth chart planetary positions and life problems.",
    url: SITE_URL,
    siteName: "Graha Remedy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Graha Remedy | Free Vedic Astrology Remedies",
    description: "Classical Jyotish remedies based on birth chart planetary positions and life problems.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {GA4_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`}
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA4_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
