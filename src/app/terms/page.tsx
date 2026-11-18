import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Service", description: "By using Stride, you agree to these Terms. If you do not agree, please do not use the service.", alternates: { canonical: "/terms" } };

const sections: LegalSection[] = [
  {
    id: "use-of-the-service",
    title: "1. Use of the Service",
    body: (
      <p className="t-body">
        Stride provides productivity tools and AI powered focus features. You
        agree to use the service responsibly and not attempt to disrupt or
        misuse the platform.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "2. Accounts",
    body: (
      <p className="t-body">
        You are responsible for maintaining the confidentiality of your login
        credentials. We may suspend accounts that violate these Terms.
      </p>
    ),
  },
  {
    id: "subscriptions-and-payments",
    title: "3. Subscriptions and Payments",
    body: (
      <p className="t-body">
        Premium features are billed through our payment provider. Subscriptions
        may renew automatically unless cancelled. Refunds follow the payment
        provider’s policies.
      </p>
    ),
  },
  {
    id: "ai-features",
    title: "4. AI Features",
    body: (
      <p className="t-body">
        AI generated insights and nudges are provided for productivity purposes
        only. They may not always be perfectly accurate or personalized.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "5. Limitation of Liability",
    body: (
      <p className="t-body">
        Stride is provided as is. We are not liable for indirect or
        consequential damages resulting from use of the service.
      </p>
    ),
  },
  {
    id: "updates",
    title: "6. Updates",
    body: (
      <p className="t-body">
        We may update these Terms as Stride evolves. Continued use of the
        service means you accept the updated version.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="February 2026"
      intro={
        <p className="t-lead">
          By using Stride, you agree to these Terms. If you do not agree, please
          do not use the service.
        </p>
      }
      sections={sections}
    />
  );
}
