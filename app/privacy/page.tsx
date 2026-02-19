export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Last updated: February 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          
          <section>
            <p>
              Welcome to Stride. This Privacy Policy explains what information we
              collect, how we use it, and how we protect it when you use our
              productivity tools and AI powered focus features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Information We Collect
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Account Information</h3>
                <p>
                  When you sign up using your Google account, we receive basic profile information such as your name and email address.
We do not store your Google password.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Usage Information</h3>
                <p>
                  Focus session activity, feature usage, and general interaction data
                  to improve your experience.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Payment Information</h3>
                <p>
                  Premium payments are processed securely by our payment provider.
                  We do not store your full card details. We only receive subscription
                  status information.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              2. How We Use Your Information
            </h2>
            <p className="mt-4">
              We use your data to provide Stride features, manage subscriptions,
              improve performance, and respond to support requests.
              We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Data Security
            </h2>
            <p className="mt-4">
              We use modern security practices to protect your information.
              While no system is perfectly secure, we take reasonable steps
              to safeguard your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              4. Your Rights
            </h2>
            <p className="mt-4">
              You may request access, correction, or deletion of your data.
              Contact us at hello@trystrideai.com for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              5. Updates
            </h2>
            <p className="mt-4">
              We may update this policy as Stride evolves. Changes will be reflected
              by updating the date above.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
