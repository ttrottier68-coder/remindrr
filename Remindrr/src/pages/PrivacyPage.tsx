import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-orange-500 hover:underline text-sm font-medium mb-6 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: April 10, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">

          <p>Remindrr ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains what data we collect, how we use it, and your rights.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">1. Information We Collect</h2>
          <p><strong>Account Information:</strong> When you sign up, we collect your name, email address, business name, and phone number.</p>
          <p><strong>Client Information:</strong> Any client contact details you add to Remindrr (names, phone numbers, email addresses) are stored locally in your browser's localStorage. We do not store this on our servers.</p>
          <p><strong>Invoice Data:</strong> Invoice details you create (descriptions, amounts, due dates) are stored locally on your device.</p>
          <p><strong>Usage Information:</strong> We may collect basic usage data such as which features you use to help improve our service.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Deliver SMS and email reminders to your clients on your behalf</li>
            <li>Process your subscription payments through Stripe</li>
            <li>Provide customer support</li>
            <li>Improve and maintain the Remindrr service</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8">3. Third-Party Services</h2>
          <p>We use trusted third-party services to power Remindrr:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stripe:</strong> Handles all subscription payments. Stripe's privacy policy applies to payment processing.</li>
            <li><strong>Twilio:</strong> Powers SMS message delivery. Twilio's privacy policy applies to SMS sending.</li>
            <li><strong>SendGrid:</strong> Powers email delivery. SendGrid's privacy policy applies to email sending.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8">4. Data Storage and Security</h2>
          <p>Your invoice and client data is stored in your browser's localStorage. This data remains on your device and is not accessible to us. You are responsible for exporting or backing up your data if needed. We implement reasonable security measures to protect your account information.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">5. Cookies</h2>
          <p>We use minimal browser cookies to manage your session and authentication. No tracking or advertising cookies are used.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">6. Data Retention</h2>
          <p>We retain your account information for as long as your account is active. You may request deletion of your account data at any time by contacting us at <span className="text-orange-500 font-medium">support@remindrr.app</span>. Invoice and client data stored locally on your device can be deleted by clearing your browser's localStorage.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal information</li>
            <li>Object to or restrict certain processing</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>To exercise any of these rights, contact us at <span className="text-orange-500 font-medium">support@remindrr.app</span>.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">8. Children's Privacy</h2>
          <p>Remindrr is not intended for use by individuals under the age of 18. We do not knowingly collect information from minors.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised "Last updated" date.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">10. Contact</h2>
          <p>If you have questions about this Privacy Policy, contact us at:<br />
          <span className="text-orange-500 font-medium">support@remindrr.app</span></p>
        </div>
      </div>
    </div>
  );
}
