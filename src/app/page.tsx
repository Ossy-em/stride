import type { Metadata } from "next";
import Landing from "@/components/landing";
import { faqs } from "@/lib/faqs";

const URL = "https://trystrideai.com";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Structured data: tells search engines what Stride is, who makes it, and the FAQ answers.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${URL}/#website`,
      url: URL,
      name: "Stride",
      publisher: { "@id": `${URL}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${URL}/#org`,
      name: "Stride",
      url: URL,
      logo: `${URL}/icons/icon-512.png`,
      email: "hello@trystrideai.com",
    },
    {
      "@type": "SoftwareApplication",
      name: "Stride",
      url: URL,
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Web, iOS, Android",
      description: "Your focus companion that learns when you drift. It steps in before it happens, and gets sharper over time.",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Premium", price: "6", priceCurrency: "USD" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing />
    </>
  );
}
