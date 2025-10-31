'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-sm text-[#FF7A19] hover:underline mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Privacy Policy</h1>
            <p className="text-sm text-[#3A3A3A]">Last updated: October 28, 2025</p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-[#3A3A3A] leading-relaxed mb-4">
              At VENTECH, we respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you use our website and services.
            </p>
            <p className="text-[#3A3A3A] leading-relaxed">
              By using VENTECH, you consent to the practices described in this policy.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">1.1 Personal Information</h3>
            <p className="text-[#3A3A3A] leading-relaxed mb-3">
              When you create an account or make a purchase, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A] mb-4">
              <li>Full name (first and last name)</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely by our payment partners)</li>
              <li>Date of birth and gender (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">1.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A] mb-4">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website or source</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">1.3 Transaction Information</h3>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A]">
              <li>Order history and product preferences</li>
              <li>Shopping cart contents</li>
              <li>Wishlist items</li>
              <li>Product reviews and ratings</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">2. How We Use Your Information</h2>
            <p className="text-[#3A3A3A] leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A]">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send order confirmations, shipping updates, and receipts</li>
              <li>Process payments securely</li>
              <li>Personalize your shopping experience</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 3. Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">3. How We Share Your Information</h2>
            
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">3.1 Service Providers</h3>
            <p className="text-[#3A3A3A] leading-relaxed mb-4">
              We share information with trusted third-party service providers who assist us in:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A] mb-4">
              <li><strong>Payment Processing:</strong> Hubtel, Paystack (payment gateways)</li>
              <li><strong>Shipping & Delivery:</strong> Courier services</li>
              <li><strong>Email Services:</strong> For transactional and marketing emails</li>
              <li><strong>Cloud Storage:</strong> Supabase, Cloudflare R2</li>
              <li><strong>Analytics:</strong> To understand website usage</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">3.2 Legal Requirements</h3>
            <p className="text-[#3A3A3A] leading-relaxed mb-4">
              We may disclose your information if required by law, court order, or government request, 
              or to protect our rights, property, or safety.
            </p>

            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">3.3 Business Transfers</h3>
            <p className="text-[#3A3A3A] leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be 
              transferred to the acquiring entity.
            </p>
          </section>

          {/* 4. Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-[#3A3A3A] leading-relaxed mb-3">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A] mb-4">
              <li><strong>Essential Cookies:</strong> Required for site functionality (login, cart)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Track marketing campaign effectiveness</li>
            </ul>
            <p className="text-[#3A3A3A] leading-relaxed">
              You can control cookies through your browser settings, but disabling them may affect 
              site functionality.
            </p>
          </section>

          {/* 5. Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">5. Data Security</h2>
            <p className="text-[#3A3A3A] leading-relaxed mb-3">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A] mb-4">
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Secure password hashing and storage</li>
              <li>Regular security audits and monitoring</li>
              <li>Restricted access to personal information</li>
              <li>Secure payment processing (PCI-DSS compliant partners)</li>
            </ul>
            <p className="text-[#3A3A3A] leading-relaxed">
              While we strive to protect your information, no method of transmission over the internet 
              is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">6. Your Privacy Rights</h2>
            <p className="text-[#3A3A3A] leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A]">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time</li>
              <li><strong>Data Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Object:</strong> Object to processing of your personal information</li>
            </ul>
            <p className="text-[#3A3A3A] leading-relaxed mt-3">
              To exercise these rights, contact us at{' '}
              <a href="mailto:ventechgadgets@gmail.com" className="text-[#FF7A19] hover:underline">
                ventechgadgets@gmail.com
              </a>
            </p>
          </section>

          {/* 7. Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">7. Data Retention</h2>
            <p className="text-[#3A3A3A] leading-relaxed">
              We retain your personal information for as long as necessary to provide our services, 
              comply with legal obligations, resolve disputes, and enforce our agreements. When you 
              delete your account, we will delete or anonymize your personal information within 30 days, 
              except where required by law to retain it longer.
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">8. Children's Privacy</h2>
            <p className="text-[#3A3A3A] leading-relaxed">
              VENTECH is not intended for individuals under the age of 18. We do not knowingly collect 
              personal information from children. If you believe we have collected information from a 
              child, please contact us immediately.
            </p>
          </section>

          {/* 9. Third-Party Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">9. Third-Party Links</h2>
            <p className="text-[#3A3A3A] leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the 
              privacy practices of these external sites. We encourage you to review their privacy 
              policies before providing any personal information.
            </p>
          </section>

          {/* 10. International Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">10. International Data Transfers</h2>
            <p className="text-[#3A3A3A] leading-relaxed">
              Your information may be transferred to and processed in countries other than Ghana, 
              including countries that may not have the same data protection laws. We ensure appropriate 
              safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          {/* 11. Marketing Communications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">11. Marketing Communications</h2>
            <p className="text-[#3A3A3A] leading-relaxed mb-3">
              With your consent, we may send you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3A3A3A] mb-4">
              <li>Promotional emails about new products and special offers</li>
              <li>SMS notifications about exclusive deals</li>
              <li>Newsletter with tech tips and updates</li>
            </ul>
            <p className="text-[#3A3A3A] leading-relaxed">
              You can opt-out at any time by clicking the "Unsubscribe" link in our emails or 
              updating your preferences in your account settings.
            </p>
          </section>

          {/* 12. Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-[#3A3A3A] leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material 
              changes by posting the new policy on this page and updating the "Last updated" date. 
              Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Contact Us About Privacy</h2>
            <p className="text-[#3A3A3A] leading-relaxed mb-3">
              If you have questions or concerns about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <ul className="space-y-2 text-[#3A3A3A]">
              <li><strong>Email:</strong> ventechgadgets@gmail.com</li>
              <li><strong>Phone:</strong> +233 55 134 4310</li>
              <li><strong>Address:</strong> Ho Civic Center Shop #22, Ho, Ghana</li>
              <li><strong>Address:</strong> Accra, Ghana</li>
            </ul>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-[#3A3A3A] text-center">
              © 2025 VENTECH. All rights reserved. |{' '}
              <Link href="/terms" className="text-[#FF7A19] hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



