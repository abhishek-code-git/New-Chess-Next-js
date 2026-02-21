"use client";

import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';

const Terms = () => {
  return (
    <>
      <SEO 
        title="Terms of Service - ChessMaster"
        description="Read ChessMaster's terms of service. Understand the rules, guidelines, and conditions for using our online chess platform and reward system."
        canonical="https://chessmasterss.vercel.app/terms"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <article className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">Last updated: December 12, 2025</p>
            </header>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-lg leading-relaxed">
                  By accessing and using ChessMaster, you agree to be bound by these Terms of Service and all 
                  applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
                  from using or accessing this site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. User Accounts</h2>
                <p className="text-lg leading-relaxed mb-4">When creating an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as needed</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Fair Play Policy</h2>
                <p className="text-lg leading-relaxed mb-4">
                  ChessMaster is committed to fair play. The following activities are strictly prohibited:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>Using chess engines, bots, or external assistance during games</li>
                  <li>Exploiting bugs or glitches for unfair advantage</li>
                  <li>Intentionally losing games to manipulate ratings or points</li>
                  <li>Creating multiple accounts to abuse the reward system</li>
                  <li>Colluding with other players to manipulate game outcomes</li>
                  <li>Using automated scripts or programs to play games</li>
                </ul>
                <p className="text-lg leading-relaxed mt-4">
                  Violations may result in account suspension, point forfeiture, and permanent ban.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Points and Rewards System</h2>
                <p className="text-lg leading-relaxed mb-4">Regarding our reward system:</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>Points are earned through legitimate gameplay victories</li>
                  <li>1000 points can be converted to ₹10 (subject to change)</li>
                  <li>Minimum withdrawal amount and processing times may apply</li>
                  <li>We reserve the right to verify gameplay before processing withdrawals</li>
                  <li>Points have no cash value until converted through official withdrawal</li>
                  <li>We may modify the reward structure with reasonable notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Intellectual Property</h2>
                <p className="text-lg leading-relaxed">
                  The ChessMaster name, logo, website design, and all content are owned by us and protected by 
                  intellectual property laws. You may not copy, modify, distribute, or reproduce any part of our 
                  service without prior written consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. User Conduct</h2>
                <p className="text-lg leading-relaxed mb-4">Users agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>Harass, abuse, or threaten other users</li>
                  <li>Post offensive, inappropriate, or illegal content</li>
                  <li>Attempt to hack, disrupt, or damage our systems</li>
                  <li>Use the service for any unlawful purpose</li>
                  <li>Impersonate others or misrepresent your identity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Disclaimer of Warranties</h2>
                <p className="text-lg leading-relaxed">
                  ChessMaster is provided "as is" without warranties of any kind, either express or implied. 
                  We do not guarantee that the service will be uninterrupted, error-free, or secure. Your use 
                  of the service is at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Limitation of Liability</h2>
                <p className="text-lg leading-relaxed">
                  To the fullest extent permitted by law, ChessMaster shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including loss of profits, data, 
                  or other intangible losses resulting from your use of our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Account Termination</h2>
                <p className="text-lg leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for violations of these 
                  terms, suspected fraud, or any other reason at our discretion. Upon termination, your right 
                  to use the service ceases immediately, and any accumulated points may be forfeited.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Governing Law</h2>
                <p className="text-lg leading-relaxed">
                  These terms shall be governed by and construed in accordance with the laws of India, 
                  without regard to its conflict of law provisions. Any disputes shall be resolved in the 
                  courts of India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Changes to Terms</h2>
                <p className="text-lg leading-relaxed">
                  We reserve the right to modify these terms at any time. Continued use of the service after 
                  changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Information</h2>
                <p className="text-lg leading-relaxed">
                  For questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:support@chessmaster.app" className="text-primary hover:underline">
                    support@chessmaster.app
                  </a>
                </p>
              </section>
            </div>
          </article>
        </main>

        <footer className="border-t border-border py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ChessMaster. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Terms;


