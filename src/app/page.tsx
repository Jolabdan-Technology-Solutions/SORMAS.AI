import Link from 'next/link';
import {
  Activity,
  Globe,
  BarChart3,
  Shield,
  Zap,
  Database,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Globe,
    title: 'Multi-Tenant Architecture',
    description:
      'Each country operates in isolation while contributing to global surveillance insights.',
  },
  {
    icon: Database,
    title: 'Smart ETL Pipeline',
    description:
      'Connect to existing systems (SORMAS, DHIS2) or import CSV files with intelligent field mapping.',
  },
  {
    icon: BarChart3,
    title: 'Predictive Analytics',
    description:
      'AI-powered outbreak prediction using historical patterns and real-time data analysis.',
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    description:
      'Role-based access ensures raw data stays with countries; only aggregates flow globally.',
  },
  {
    icon: Zap,
    title: 'Real-time Alerts',
    description:
      'Automatic threshold monitoring and anomaly detection for early outbreak warning.',
  },
  {
    icon: Activity,
    title: 'One Health Approach',
    description:
      'Unified view across countries enabling coordinated response to cross-border health threats.',
  },
];

const stats = [
  { value: '20+', label: 'Diseases Tracked' },
  { value: '50+', label: 'Countries Ready' },
  { value: 'Real-time', label: 'Data Sync' },
  { value: 'AI', label: 'Predictions' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">SORMAS AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-white" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Zap className="mr-2 h-4 w-4" />
              Next-Generation Disease Surveillance
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Predict Outbreaks.
              <br />
              <span className="text-blue-600">Save Lives.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              SORMAS AI is a modern, multi-tenant disease surveillance platform that
              connects countries worldwide for coordinated outbreak prediction and
              response. Built for the One Health era.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="gap-2">
                  Start Surveillance
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need for Global Surveillance
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From data ingestion to predictive analytics, SORMAS AI provides a
              complete solution for modern disease surveillance.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 p-8 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get your country connected in three simple steps
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Configure Your Country',
                description:
                  'Set up your administrative hierarchy, enable relevant diseases, and configure custom fields.',
              },
              {
                step: '02',
                title: 'Connect Data Sources',
                description:
                  'Link your existing SORMAS, DHIS2, or other systems via API, or upload CSV files.',
              },
              {
                step: '03',
                title: 'Get Predictions',
                description:
                  'Our AI analyzes patterns and provides early warnings for potential outbreaks.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 text-5xl font-bold text-blue-100">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-blue-600 px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Surveillance?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Join countries worldwide using AI-powered disease surveillance to
              protect their populations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/login">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-blue-100">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Free for public health authorities
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Full support included
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold">SORMAS AI</span>
            </div>
            <p className="text-sm text-gray-500">
              Global Disease Surveillance & Prediction Platform
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="#" className="hover:text-gray-900">
                Privacy
              </Link>
              <Link href="#" className="hover:text-gray-900">
                Terms
              </Link>
              <Link href="#" className="hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
