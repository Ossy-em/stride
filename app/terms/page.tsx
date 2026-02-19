export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          Terms of Service
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Last updated: February 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <p>
              By using Stride, you agree to these Terms. If you do not agree,
              please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Use of the Service
            </h2>
            <p className="mt-4">
              Stride provides productivity tools and AI powered focus features.
              You agree to use the service responsibly and not attempt to disrupt
              or misuse the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              2. Accounts
            </h2>
            <p className="mt-4">
              You are responsible for maintaining the confidentiality of your
              login credentials. We may suspend accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Subscriptions and Payments
            </h2>
            <p className="mt-4">
              Premium features are billed through our payment provider.
              Subscriptions may renew automatically unless cancelled.
              Refunds follow the payment provider’s policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              4. AI Features
            </h2>
            <p className="mt-4">
              AI generated insights and nudges are provided for productivity
              purposes only. They may not always be perfectly accurate or personalized.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              5. Limitation of Liability
            </h2>
            <p className="mt-4">
              Stride is provided as is. We are not liable for indirect or
              consequential damages resulting from use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              6. Updates
            </h2>
            <p className="mt-4">
              We may update these Terms as Stride evolves.
              Continued use of the service means you accept the updated version.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
