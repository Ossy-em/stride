import type { Metadata } from "next";
import PaymentCallback from "@/components/app/premium/callback";

export const metadata: Metadata = { title: "Premium", robots: { index: false, follow: false } };

export default function PaymentCallbackPage() {
  return <PaymentCallback />;
}
