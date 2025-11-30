'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Check,
  X,
  ArrowRight,
  Shield,
  Users,
  Building2,
  Sparkles,
  Clock,
  Mail,
  Phone,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const features = {
  trial: [
    { name: 'Up to 100 cases', included: true },
    { name: 'Up to 500 contacts', included: true },
    { name: '10 ETL imports/month', included: true },
    { name: '50 AI predictions/month', included: true },
    { name: 'Basic analytics dashboard', included: true },
    { name: 'Email support', included: true },
    { name: 'Priority support', included: false },
    { name: 'Custom integrations', included: false },
    { name: 'Dedicated account manager', included: false },
  ],
  pro: [
    { name: 'Up to 100 cases per user', included: true },
    { name: 'Up to 500 contacts per user', included: true },
    { name: '10 ETL imports/user/month', included: true },
    { name: '50 AI predictions/user/month', included: true },
    { name: 'Advanced analytics dashboard', included: true },
    { name: 'Email support', included: true },
    { name: 'Priority support', included: true },
    { name: 'Custom integrations', included: false },
    { name: 'Dedicated account manager', included: false },
  ],
  enterprise: [
    { name: 'Unlimited cases', included: true },
    { name: 'Unlimited contacts', included: true },
    { name: 'Unlimited ETL imports', included: true },
    { name: 'Unlimited AI predictions', included: true },
    { name: 'Advanced analytics dashboard', included: true },
    { name: 'Email support', included: true },
    { name: 'Priority support', included: true },
    { name: 'Custom integrations', included: true },
    { name: 'Dedicated account manager', included: true },
  ],
};

export default function PricingPage() {
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [enterpriseForm, setEnterpriseForm] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/enterprise-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enterpriseForm),
      });

      if (!response.ok) {
        throw new Error('Failed to send inquiry');
      }

      setSubmitSuccess(true);
      setEnterpriseForm({ name: '', email: '', organization: '', message: '' });
    } catch (err) {
      setSubmitError('Failed to send inquiry. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030014]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SORMAS AI</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300 mb-6">
            <Sparkles className="h-4 w-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose the right plan for your team
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start with a 7-day free trial. No credit card required. Upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Trial */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/20">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Free Trial</h3>
                  <p className="text-slate-400 text-sm">7 days full access</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400">/7 days</span>
              </div>

              <p className="text-slate-400 mb-6">
                Perfect for evaluating SORMAS AI for your organization.
              </p>

              <Link href="/auth/register">
                <Button className="w-full h-12 mb-8 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <ul className="space-y-3">
                {features.trial.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <X className="h-5 w-5 text-slate-600" />
                    )}
                    <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 p-8 backdrop-blur-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Pro</h3>
                  <p className="text-slate-400 text-sm">For growing teams</p>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-4xl font-bold text-white">$50</span>
                <span className="text-slate-400">/user/month</span>
              </div>
              <p className="text-amber-400 text-sm mb-6">
                Minimum 5 users ($250/month)
              </p>

              <p className="text-slate-400 mb-6">
                Same limits as trial, per user. Scale your disease surveillance team.
              </p>

              <Link href="/auth/register?plan=pro">
                <Button className="w-full h-12 mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <ul className="space-y-3">
                {features.pro.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <X className="h-5 w-5 text-slate-600" />
                    )}
                    <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                  <Building2 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Enterprise</h3>
                  <p className="text-slate-400 text-sm">Custom solutions</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>

              <p className="text-slate-400 mb-6">
                For large organizations requiring unlimited access and custom features.
              </p>

              <Button
                onClick={() => setShowEnterpriseForm(true)}
                className="w-full h-12 mb-8 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Contact Sales
                <Mail className="ml-2 h-4 w-4" />
              </Button>

              <ul className="space-y-3">
                {features.enterprise.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <X className="h-5 w-5 text-slate-600" />
                    )}
                    <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enterprise Contact Form Modal */}
          {showEnterpriseForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a1a] p-8">
                <button
                  onClick={() => {
                    setShowEnterpriseForm(false);
                    setSubmitSuccess(false);
                    setSubmitError('');
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-400 mb-6">
                      Thank you for your interest. We'll be in touch within 24 hours.
                    </p>
                    <Button
                      onClick={() => {
                        setShowEnterpriseForm(false);
                        setSubmitSuccess(false);
                      }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white">Contact Enterprise Sales</h3>
                      <p className="text-slate-400 mt-2">
                        Tell us about your organization and we'll get back to you within 24 hours.
                      </p>
                    </div>

                    <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                      {submitError && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                          <AlertCircle className="h-5 w-5" />
                          {submitError}
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={enterpriseForm.name}
                          onChange={(e) => setEnterpriseForm({ ...enterpriseForm, name: e.target.value })}
                          placeholder="Dr. John Smith"
                          className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Work Email
                        </label>
                        <Input
                          type="email"
                          value={enterpriseForm.email}
                          onChange={(e) => setEnterpriseForm({ ...enterpriseForm, email: e.target.value })}
                          placeholder="john@ministry.gov"
                          className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Organization
                        </label>
                        <Input
                          type="text"
                          value={enterpriseForm.organization}
                          onChange={(e) => setEnterpriseForm({ ...enterpriseForm, organization: e.target.value })}
                          placeholder="Ministry of Health"
                          className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Tell us about your needs
                        </label>
                        <textarea
                          value={enterpriseForm.message}
                          onChange={(e) => setEnterpriseForm({ ...enterpriseForm, message: e.target.value })}
                          placeholder="Number of users, specific requirements, timeline..."
                          rows={4}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Inquiry
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Trust Section */}
          <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold text-white mb-8">
              Trusted by health organizations worldwide
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="h-5 w-5 text-indigo-400" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="h-5 w-5 text-purple-400" />
                <span>GDPR Ready</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What happens after my 7-day trial?
                </h3>
                <p className="text-slate-400">
                  After your trial ends, you'll need to upgrade to Pro to continue using SORMAS AI.
                  Your data will be preserved, and you can upgrade at any time.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Why is there a minimum of 5 users for Pro?
                </h3>
                <p className="text-slate-400">
                  Disease surveillance is a team effort. The 5-user minimum ensures your team
                  can effectively collaborate on outbreak response and contact tracing.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Can I try the demo without signing up?
                </h3>
                <p className="text-slate-400">
                  Yes! Click "Try Demo" on the login page to explore SORMAS AI with pre-populated
                  sample data. No account required.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-slate-400">
                  We accept all major credit cards through Stripe. Enterprise customers can also
                  pay via invoice with NET-30 terms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-white/5">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-semibold">SORMAS AI</span>
              </div>
              <p className="text-slate-500 text-sm">
                © 2024 SORMAS AI. Global Disease Surveillance Platform.
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
