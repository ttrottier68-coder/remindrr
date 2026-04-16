import { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = () => <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const StarIcon = () => <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ShieldIcon = () => <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

// ─── Urgency Badge ─────────────────────────────────────────────────────────────
function UrgencyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
      {children}
    </span>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-24 pb-32 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex justify-center gap-3 mb-6">
          <UrgencyBadge>🚀 Start getting paid faster today</UrgencyBadge>
          <UrgencyBadge>✅ Cancel anytime</UrgencyBadge>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Get Paid Faster<br />
          <span className="text-blue-400">Without Chasing Customers</span>
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-4">
          Remindrr automatically sends friendly SMS and email payment reminders so contractors and small business owners get paid on time — without awkward follow-ups.
        </p>
        <p className="text-blue-300/60 text-sm mb-10">Automatic SMS, Email, or Both · No credit card required</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
            Create Free Account →
          </Link>
          <Link to="/login" className="border border-blue-400/40 text-blue-200 hover:text-white hover:border-blue-300 px-8 py-4 rounded-xl text-lg font-medium transition-colors">
            Sign In
          </Link>
        </div>
        <p className="text-slate-400 text-sm mt-4">No credit card required · Set up in under 5 minutes</p>
      </div>
    </section>
  );
}

// ─── Pain Points ─────────────────────────────────────────────────────────────
function PainPoints() {
  const pains = [
    'You finish a job and wait weeks to get paid',
    'Customers forget or ignore invoices',
    'You spend hours sending follow-up texts',
    'Awkward phone calls asking for money',
  ];
  return (
    <section className="bg-red-50 py-20 px-6 border-y border-red-100">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-12">Still chasing customers for payment?</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {pains.map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-5 text-slate-600 flex gap-3 shadow-sm border border-red-100">
              <span className="text-red-400 text-lg mt-0.5">✗</span>
              <span className="font-medium">{p}</span>
            </div>
          ))}
        </div>
        <p className="text-lg text-slate-700 font-semibold">You did the work. Getting paid shouldn't be the hard part.</p>
      </div>
    </section>
  );
}

// ─── Solution ─────────────────────────────────────────────────────────────
function Solution() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-5xl mb-6">📲</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Remindrr follows up so you don't have to</h2>
        <p className="text-xl text-slate-500 leading-relaxed">
          Once you send an invoice, Remindrr automatically reminds your customer before and after the due date—so you get paid faster without lifting a finger.
        </p>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      emoji: '📝',
      title: 'Create your invoice in 30 seconds',
      desc: 'Add your client, amount, and due date. That\'s it—no complicated forms.',
    },
    {
      num: '02',
      emoji: '⚙️',
      title: 'Remindrr handles the follow-ups',
      desc: 'Automatic SMS and email reminders go out before and after the due date — so you never have to chase.',
    },
    {
      num: '03',
      emoji: '💰',
      title: 'Get paid without awkward calls',
      desc: 'Your customer pays via secure link in 2 taps. Money hits your account faster.',
    },
  ];
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">How It Works</h2>
        <p className="text-center text-slate-500 mb-16">This replaces all your follow-ups automatically.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{s.emoji}</div>
              <div className="text-3xl font-bold text-blue-600 mb-3">{s.num}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Benefits ────────────────────────────────────────────────────────────────
function Benefits() {
  const benefits = [
    { val: '3x', label: 'faster payments' },
    { val: '0', label: 'awkward calls' },
    { val: '5+', label: 'hrs saved/week' },
    { val: '100%', label: 'professional' },
  ];
  return (
    <section className="py-20 px-6 bg-blue-600 text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why Businesses Use Remindrr</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="text-center bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-yellow-300 mb-1">{b.val}</div>
              <div className="text-blue-100 text-sm font-medium">{b.label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {['Get paid up to 3x faster', 'No more awkward follow-ups', 'Save hours every week', 'Improve cash flow', 'Look more professional', 'Works on any phone'].map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-blue-100 text-sm">
              <CheckIcon /><span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who It's For ────────────────────────────────────────────────────────────
function WhoItFor() {
  const trades = ['HVAC Technicians', 'Electricians', 'Plumbers', 'General Contractors', 'Service-based Businesses', 'Any business sending invoices'];
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Built for Trades & Small Businesses</h2>
        <p className="text-slate-500 mb-10">If you send invoices, Remindrr helps you get paid.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {trades.map((t, i) => (
            <span key={i} className="bg-slate-100 text-slate-700 px-5 py-2 rounded-full font-medium text-sm">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SMS Preview ─────────────────────────────────────────────────────────────
function SmsPreview() {
  return (
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl font-bold mb-4">What Your Customer Sees</h2>
        <p className="text-slate-400 mb-10">Friendly, professional, and effective.</p>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20 text-left">
          <div className="text-slate-400 text-sm mb-3 font-mono">SMS · From Remindrr</div>
          <p className="text-lg text-white leading-relaxed">
            "Hey John, just a reminder your invoice for <strong>$420</strong> is due today. You can pay here: <span className="text-blue-300 underline">pay.remindrr.app/invite</span> — thanks!"
          </p>
          <div className="mt-6 bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2 inline-flex items-center gap-2 text-sm text-green-300">
            ✅ Paid in 2 taps — money in your account
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { emoji: '📱', title: 'Automated SMS & Email Reminders', desc: 'Never forget to follow up again. Choose SMS, email, or both — reminders sent before, on, and after due date.' },
    { emoji: '💳', title: 'Instant Payment Links', desc: 'Customers pay in 2 taps. No chasing, no awkwardness.' },
    { emoji: '📊', title: 'Invoice Tracking', desc: 'See paid, pending, and overdue invoices at a glance.' },
    { emoji: '⚡', title: 'Simple Setup', desc: 'Start sending invoices and getting paid in minutes.' },
  ];
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Everything You Need to Get Paid</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex gap-4">
              <div className="text-3xl">{f.emoji}</div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    { name: 'Mike R.', trade: 'HVAC Contractor · 3 years', quote: "I stopped chasing customers completely. Payments come in way faster now. This thing pays for itself." },
    { name: 'Sarah K.', trade: 'Licensed Electrician · 5 years', quote: "This saves me hours every week. Super simple and it actually works. No more awkward calls." },
    { name: 'Carlos B.', trade: 'Plumbing Business · 4 years', quote: "My cash flow has never been better. I set it and forget it—Remindrr handles everything." },
  ];
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">Businesses Are Getting Paid Faster</h2>
        <p className="text-center text-slate-500 mb-12">Real results from real contractors.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
              </div>
              <p className="text-slate-700 italic mb-4">"{t.quote}"</p>
              <div className="font-bold text-slate-800">{t.name}</div>
              <div className="text-xs text-slate-400 mt-1">{t.trade}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
function Pricing() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Simple Pricing. No Surprises.</h2>
        <p className="text-slate-500 mb-12">Start free. Upgrade when you're ready.</p>

        {/* STARTER — Featured */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white max-w-md mx-auto mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl">
            MOST POPULAR
          </div>
          <div className="text-blue-300 font-medium mb-2">Starter Plan</div>
          <div className="text-5xl font-bold mb-1">$29<span className="text-xl font-normal text-slate-400">/mo</span></div>
          <p className="text-slate-400 text-sm mb-8">Cancel anytime · No contracts · No hidden fees</p>
          <ul className="space-y-3 mb-8 text-left">
            {[
              'Unlimited invoices',
              'Automated reminders (before, on & after due)',
              'Unlimited clients',
              'SMS & email notifications',
              'Payment tracking',
              'Priority support',
              '📲 Replace all your follow-ups automatically',
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link to="/signup" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30">
            Get Started — Free →
          </Link>
          <p className="text-center text-xs text-slate-500 mt-4">No credit card required</p>
        </div>

        {/* Value props */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <ShieldIcon /> If it saves you one unpaid invoice, it pays for itself
          </div>
          <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm">
            ✅ Cancel anytime
          </div>
          <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm">
            ⚡ Set up in under 5 minutes
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="font-medium text-slate-600 mb-3">Also available:</p>
          <div className="inline-block bg-slate-100 rounded-xl px-6 py-4 text-left">
            <div className="font-bold text-slate-700">Free Plan</div>
            <div className="text-slate-500 text-sm">Up to 3 invoices/month · Basic reminders</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: 'How do reminders work?',
      a: "Remindrr automatically sends SMS and email reminders before and after the invoice due date. You choose the method when creating the invoice — it runs on autopilot.",
    },
    {
      q: 'Can customers pay online?',
      a: "Yes! Customers receive a secure payment link via SMS, email, or both. They can pay in 2 taps on their phone — no accounts or logins needed on their end.",
    },
    {
      q: 'Is this easy to set up?',
      a: "Yes. Create your account, add a client, create your first invoice—you're done in under 5 minutes. No technical skills needed.",
    },
    {
      q: 'What if a customer still doesn\'t pay?',
      a: "Remindrr sends multiple automated follow-ups so you don't have to. For stubborn cases, you can send additional custom reminders manually.",
    },
    {
      q: 'I already use invoicing software—why do I need this?',
      a: "Totally—this actually works alongside what you're already using. Remindrr is focused specifically on getting you paid faster, not just sending invoices. Most users say the automated reminders alone are worth it.",
    },
    {
      q: 'What if I don\'t need it?',
      a: "That makes sense—most people say that until they realize how much time they spend following up. This just automates that completely. If it helps you collect even one late payment, it pays for itself.",
    },
    {
      q: 'Is there a free trial?',
      a: "No free trial — cancel anytime. Plans start at $29/mo and pay for themselves the first time you collect an overdue invoice.",
    },
  ];
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">Frequently Asked Questions</h2>
        <p className="text-center text-slate-500 mb-12">Questions we hear from contractors every day.</p>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                {f.q}
                <ChevronIcon open={open === i} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-blue-900 text-white text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Stop chasing payments.<br />Start getting paid.</h2>
        <p className="text-xl text-blue-200 mb-4">Join contractors who never have to ask for money again.</p>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <span className="bg-white/10 text-blue-200 text-sm px-4 py-1.5 rounded-full">✅ Cancel anytime</span>
          <span className="bg-white/10 text-blue-200 text-sm px-4 py-1.5 rounded-full">⚡ Set up in 5 minutes</span>
          <span className="bg-white/10 text-blue-200 text-sm px-4 py-1.5 rounded-full">💰 If it saves you one unpaid invoice, it pays for itself</span>
        </div>
        <Link to="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/30 inline-block">
          Get Started Now — It's Free →
        </Link>
        <p className="mt-4 text-sm text-slate-400">No credit card required</p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-500 py-10 px-6 text-center text-sm">
      <div className="mb-4 font-bold text-slate-300 text-lg">Remindrr</div>
      <p>Payment Collection Automation for Contractors</p>
      <div className="flex justify-center gap-6 mt-4">
        <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
        <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
      </div>
      <p className="mt-6 text-slate-600">© 2026 Remindrr. All rights reserved.</p>
    </footer>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <PainPoints />
      <Solution />
      <HowItWorks />
      <Benefits />
      <WhoItFor />
      <SmsPreview />
      <FeaturesSection />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}