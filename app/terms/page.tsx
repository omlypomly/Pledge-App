export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#303D31] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/50 mb-10">Last updated: January 1, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
            <p className="text-white/70">
              Pledge. is a skill-based accountability platform, not a gambling service.
              Participants stake money at the start of a challenge and can recover their
              stake—plus a proportionate share of eliminated participants&apos; stakes—by
              completing all verified milestones. No house edge is applied; the platform
              collects a 10% administrative fee from the prize pool to cover operations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
            <ul className="text-white/70 space-y-2 list-disc list-inside">
              <li>You must be at least 18 years of age.</li>
              <li>You must reside in a jurisdiction where skill-based accountability platforms are permitted.</li>
              <li>You must provide accurate identity and payment information.</li>
              <li>You may not create multiple accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Challenges & Stakes</h2>
            <p className="text-white/70">
              Stakes are held in escrow via Stripe Connect and are only released upon
              challenge completion or verified elimination. Eliminated participants
              forfeit their stake to the remaining pool. All outcomes are determined
              by participant performance against pre-defined, verifiable milestones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Verification & Disputes</h2>
            <p className="text-white/70">
              Proof submissions are reviewed by an AI system followed by community vote.
              Disputes escalate to our moderation team. We reserve the right to make
              final determinations in cases of fraud, edited photos, or collusion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Fraud Prevention</h2>
            <p className="text-white/70">
              We employ image hashing, metadata validation, and behavioral analysis to
              detect fraudulent submissions. Confirmed fraud results in immediate
              elimination and potential account ban without refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Canadian Users (PIPEDA)</h2>
            <p className="text-white/70">
              Users in Canada are protected under PIPEDA. Your personal information is
              collected for the purpose of account management and challenge operations
              only. You may request access to or deletion of your data at any time
              by contacting privacy@stakeup.app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Platform Fee</h2>
            <p className="text-white/70">
              Pledge. collects a 10% administrative fee from the total prize pool at
              challenge completion. This fee covers payment processing, AI verification,
              moderation, and platform operations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
