"use client";

import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - ChessMaster"
        description="Read ChessMaster's privacy policy to understand how we collect, use, and protect your personal information when you use our chess platform."
        canonical="https://chessmasterss.vercel.app/privacy-policy"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <article className="max-w-4xl mx-auto prose prose-invert">
            <header className="text-center mb-12 not-prose">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">Last updated: December 12, 2025</p>
            </header>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-lg leading-relaxed">
                  Welcome to ChessMaster. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, disclose, and safeguard your information when you 
                  visit our website and use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <p className="text-lg leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li><strong className="text-foreground">Account Information:</strong> Email address, username, and password when you register.</li>
                  <li><strong className="text-foreground">Profile Data:</strong> Avatar, game statistics, and preferences.</li>
                  <li><strong className="text-foreground">Payment Information:</strong> Wallet balance and withdrawal details (processed securely).</li>
                  <li><strong className="text-foreground">Game Data:</strong> Move history, game results, and performance statistics.</li>
                  <li><strong className="text-foreground">Communications:</strong> Messages you send to us through our contact form.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-lg leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                  <li>Personalize and improve your experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Information Sharing</h2>
                <p className="text-lg leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your 
                  information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>With your consent or at your direction</li>
                  <li>With service providers who assist in our operations</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Security</h2>
                <p className="text-lg leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  data against unauthorized access, alteration, disclosure, or destruction. However, no method of 
                  transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies and Tracking</h2>
                <p className="text-lg leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our website and hold 
                  certain information. You can instruct your browser to refuse all cookies or to indicate when 
                  a cookie is being sent. However, some parts of our service may not function properly without cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Third-Party Services</h2>
                <p className="text-lg leading-relaxed">
                  Our website may contain links to third-party websites or services. We are not responsible for 
                  the privacy practices of these third parties. We encourage you to read the privacy policies of 
                  any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Children's Privacy</h2>
                <p className="text-lg leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If we become aware that we have collected personal 
                  data from a child under 13, we will take steps to delete that information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Your Rights</h2>
                <p className="text-lg leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to This Policy</h2>
                <p className="text-lg leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by 
                  posting the new privacy policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact Us</h2>
                <p className="text-lg leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
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

export default PrivacyPolicy;


