import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-orange-500 hover:underline text-sm font-medium mb-6 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: April 10, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">

          <p>Welcome to Remindrr. By accessing or using our service you agree to be bound by these Terms of Service. If you do not agree, please do not use Remindrr.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">1. About Remindrr</h2>
          <p>Remindrr is an invoice reminder service that automates payment reminders via SMS and email. We help contractors, tradespeople, and small businesses collect overdue invoices more efficiently.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">2. Acceptable Use</h2>
          <p>You agree to use Remindrr only for lawful business purposes. You must not use Remindrr to send:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Unsolicited marketing or spam messages</li>
            <li>Harassment, threats, or defamatory content</li>
            <li>Messages that violate any applicable law or regulation</li>
            <li>Content that infringes on third-party rights</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8">3. Your Responsibilities</h2>
          <p>You are responsible for maintaining the accuracy of your client contact information and ensuring you have the right to contact your clients. You must comply with all applicable anti-spam and telecommunications laws, including obtaining any necessary consent before sending SMS or email messages to your clients.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">4. Subscriptions & Billing</h2>
          <p>Remindrr subscription plans are billed monthly. You may upgrade, downgrade, or cancel your plan at any time. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial months.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">5. SMS and Email Delivery</h2>
          <p>Remindrr uses Twilio for SMS delivery and SendGrid for email delivery. While we use commercially reasonable efforts to deliver messages promptly, we do not guarantee that messages will be received. Delivery depends on third-party carriers and recipient devices. Remindrr is not responsible for messages not received due to carrier issues, incorrect contact information, or recipient blocking.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">6. Data Storage</h2>
          <p>Your data, including invoices, client information, and reminder history, is stored locally in your browser (localStorage). Remindrr does not maintain a server-side database. You are responsible for backing up your own data.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">7. Limitation of Liability</h2>
          <p>Remindrr is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to missed payments, failed message delivery, or business losses.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">8. Intellectual Property</h2>
          <p>The Remindrr name, logo, design, and all related content are the property of Remindrr and may not be used without permission.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">9. Account Termination</h2>
          <p>We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent, abusive, or illegal activity.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">10. Changes to These Terms</h2>
          <p>We may update these Terms of Service from time to time. Continued use of Remindrr after any changes constitutes acceptance of the new terms.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8">11. Contact</h2>
          <p>For questions about these Terms, contact us at:<br />
          <span className="text-orange-500 font-medium">support@remindrr.app</span></p>
        </div>
      </div>
    </div>
  );
}
