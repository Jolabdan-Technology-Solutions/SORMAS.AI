'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  Shield,
  Network,
  Cpu,
  Sparkles,
  Building2,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    // Simulate registration request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess(true);
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030014] py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Gradient Orbs */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">SORMAS AI</h1>
          <p className="text-slate-400">Global Disease Surveillance</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Request Submitted</h2>
              <p className="text-slate-400 mb-6">
                Your registration request has been submitted. An administrator will review your request and contact you at <span className="text-indigo-400">{formData.email}</span>
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300 mb-4">
                  <Sparkles className="h-4 w-4" />
                  Request Access
                </div>
                <h2 className="text-2xl font-bold text-white">Create an account</h2>
                <p className="mt-2 text-slate-400">
                  Request access to the SORMAS AI platform
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Dr. John Smith"
                      className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@organization.com"
                      className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Ministry of Health"
                      className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="h-12 border-white/10 bg-white/5 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </div>
                  ) : (
                    'Request Access'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                <p>
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Secure</span>
          </div>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-indigo-400" />
            <span>Encrypted</span>
          </div>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
