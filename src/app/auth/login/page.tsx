'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Mail,
  Lock,
  AlertCircle,
  Globe,
  Shield,
  Activity,
  Brain,
  Network,
  Cpu,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Play,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

// Demo credentials
const DEMO_EMAIL = 'demo@sormas.ai';
const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsDemoLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (authError) {
        // If demo account doesn't exist in Supabase, redirect anyway for demo mode
        // The app will handle demo mode based on the email
        console.log('Demo login via Supabase failed, using demo mode');
        // Store demo mode in localStorage
        localStorage.setItem('sormas_demo_mode', 'true');
        router.push('/dashboard');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      // Fallback to demo mode
      localStorage.setItem('sormas_demo_mode', 'true');
      router.push('/dashboard');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const stats = [
    { label: 'Diseases Tracked', value: '50+', icon: Activity },
    { label: 'AI Models', value: '12', icon: Brain },
  ];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#030014]">
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

        {/* Floating Particles */}
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-indigo-400/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Neural Network Lines */}
        <svg className="absolute inset-0 h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {mounted && [...Array(8)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SORMAS AI</h1>
              <p className="text-sm text-indigo-300">Powered by Machine Learning</p>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
              <Sparkles className="h-4 w-4" />
              AI-Powered Surveillance
            </div>
            <h2 className="text-5xl font-bold leading-tight text-white">
              Global Disease
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h2>
            <p className="max-w-md text-lg text-slate-400">
              Harness the power of artificial intelligence for real-time outbreak prediction,
              contact tracing, and epidemiological analysis across 195+ countries.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                      <Icon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {['Real-time Analytics', 'Predictive Models', 'Contact Tracing', 'Outbreak Detection'].map((feature) => (
              <div
                key={feature}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-indigo-400" />
            <span>WHO Integrated</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>Edge Computing</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        {/* Glass Card */}
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">SORMAS AI</h1>
            <p className="text-slate-400">Global Disease Surveillance</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-slate-400">Sign in to access your dashboard</p>
            </div>

            {/* Demo Button */}
            <button
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-50"
            >
              {isDemoLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              <span className="font-medium">Try Demo - No signup required</span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#0a0a1a] px-4 text-slate-500">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20"
                  />
                  <span className="text-slate-400">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Access Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Start free trial
                </Link>
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Users className="h-4 w-4" />
                View pricing plans
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-600">
            <span>256-bit encryption</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>HIPAA compliant</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>ISO 27001</span>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
