export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080810] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/50 mb-10">Last updated: January 1, 2025</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data We Collect</h2>
            <p className="text-white/70">
              We collect your name, email address, profile photo (via Clerk),
              payment information (via Stripe — we never store card details),
              proof uploads (images/videos stored via UploadThing), and
              in-app activity logs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Data</h2>
            <ul className="text-white/70 space-y-2 list-disc list-inside">
              <li>To authenticate and manage your account</li>
              <li>To process stakes and distribute payouts</li>
              <li>To verify milestone submissions using AI and community votes</li>
              <li>To detect fraud and enforce fair play</li>
              <li>To send challenge-related notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Sharing</h2>
            <p className="text-white/70">
              We share data with Clerk (authentication), Stripe (payments),
              UploadThing (file storage), OpenAI (AI verification), and
              Pusher (real-time messaging). We do not sell your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
            <p className="text-white/70">
              You have the right to access, correct, or delete your personal data.
              Canadian users have additional rights under PIPEDA. Contact
              privacy@stakeup.app to exercise your rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Security</h2>
            <p className="text-white/70">
              We use industry-standard encryption, signed URLs for file access,
              and row-level security on our database. Payment data is handled
              exclusively by Stripe and never touches our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p className="text-white/70">
              For privacy inquiries: privacy@stakeup.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
