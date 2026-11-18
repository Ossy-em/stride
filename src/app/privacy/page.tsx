import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "Welcome to Stride. This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use our productivity tools and AI powered focus features.", alternates: { canonical: "/privacy" } };

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    body: (
      <>
        <h3 className="t-heading">Account Information</h3>
        <p className="t-body">
          When you sign up using your Google account, we receive basic profile
          information such as your name and email address. We do not store your
          Google password.
        </p>
        <h3 className="t-heading">Usage Information</h3>
        <p className="t-body">
          Focus session activity, feature usage, and general interaction data to
          improve your experience.
        </p>
        <h3 className="t-heading">Payment Information</h3>
        <p className="t-body">
          Premium payments are processed securely by our payment provider. We do
          not store your full card details. We only receive subscription status
          information.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-your-information",
    title: "2. How We Use Your Information",
    body: (
      <p className="t-body">
        We use your data to provide Stride features, manage subscriptions,
        improve performance, and respond to support requests. We do not sell
        your personal data.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "3. Data Security",
    body: (
      <p className="t-body">
        We use modern security practices to protect your information. While no
        system is perfectly secure, we take reasonable steps to safeguard your
        data.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "4. Your Rights",
    body: (
      <p className="t-body">
        You may request access, correction, or deletion of your data. Contact us
        at <a href="mailto:hello@trystrideai.com">hello@trystrideai.com</a> for
        assistance.
      </p>
    ),
  },
  {
    id: "updates",
    title: "5. Updates",
    body: (
      <p className="t-body">
        We may update this policy as Stride evolves. Changes will be reflected by
        updating the date above.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="February 2026"
      intro={
        <p className="t-lead">
          Welcome to Stride. This Privacy Policy explains what information we
          collect, how we use it, and how we protect it when you use our
          productivity tools and AI powered focus features.
        </p>
      }
      sections={sections}
    />
  );
}
