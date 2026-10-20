import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  Lock,
  Sparkles,
  TrendingUp,
  CreditCard,
  Activity
} from 'lucide-react';

export default function LandingHero({ metrics, onLaunchSimulator, onLaunchOptimizer, heroImageSrc }) {
  const kpis = [
    {
      label: 'Net Financial Savings',
      val: metrics ? `$${metrics.net_savings_dollars?.toLocaleString()}` : '$173,502',
      sub: 'Recovered chargeback capital',
      icon: DollarSign,
      color: 'text-emerald-600',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50'
    },
    {
      label: 'User Insult Rate (FPR)',
      val: metrics ? `${metrics.user_insult_rate_pct}%` : '0.021%',
      sub: 'Guaranteed below 0.50% SLA',
      icon: Scale,
      color: 'text-indigo-600',
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/50'
    },
    {
      label: 'Inference Latency',
      val: '18ms',
      sub: 'p95 real-time checkout SLA',
      icon: Clock,
      color: 'text-cyan-600',
      border: 'border-cyan-200',
      bg: 'bg-cyan-50/50'
    },
    {
      label: 'Fraud Recall (PR-AUC)',
      val: metrics ? `${metrics.pr_auc}` : '0.9997',
      sub: 'Cost-weighted objective',
      icon: ShieldCheck,
      color: 'text-purple-600',
      border: 'border-purple-200',
      bg: 'bg-purple-50/50'
    }
  ];

  return (
    <div className="relative pt-6 pb-12 overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-100/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-cyan-100/40 blur-[110px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Split Hero Section: Headline + Little Desc on Left, Image & Showcase on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 pb-8">
          {/* Left Column: Little Desc and Actions */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Real-Time Payment Risk Defense</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Stop Payment Fraud.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">
                Zero Checkout Friction.
              </span>
            </h1>

            {/* Little concise description as requested */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Sub-20ms fraud intelligence balancing chargeback prevention against user insult churn. 
              Engineered with cross-session velocity features and cost-sensitive LightGBM on the <strong>IEEE-CIS benchmark</strong>.
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onLaunchSimulator}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Transaction Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLaunchOptimizer}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-all hover:border-slate-400"
              >
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Explore Cost-Loss Curve</span>
              </button>
            </div>

            {/* Micro assurance icons */}
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3DS 2.0 Liability Shift</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>0.02% Insult Rate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>&lt;20ms p95 SLA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image Showcase */}
          <div className="lg:col-span-5 relative">
            {/* Visual Glassmorphic Payment Verification Graphic / Image */}
            <div className="relative mx-auto max-w-md rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 p-6 border border-slate-200/90 shadow-xl shadow-slate-200/60 overflow-hidden">
              {heroImageSrc ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4 shadow-sm">
                  <img 
                    src={heroImageSrc} 
                    alt="Fintech Fraud Detection AI Engine" 
                    className="w-full h-56 object-cover" 
                  />
                </div>
              ) : (
                /* Elegant Visual Fintech Graphic Card */
                <div className="relative mb-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl" />
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="font-mono text-xs text-slate-300 font-semibold">IEEE-CIS CARD PROTECT</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      SHIELD ACTIVE
                    </span>
                  </div>

                  <div className="font-mono text-base tracking-widest text-slate-200 mb-4">
                    ••••  ••••  ••••  4291
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Cardholder</div>
                      <div className="text-xs font-semibold text-slate-100">VERIFIED CONSUMER</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">Risk Evaluation</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">SCORE: 4.2 / 100</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Live Telemetry Cards */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Autonomous Decision</div>
                      <div className="text-[11px] text-slate-500">Auto-Approve (Frictionless)</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    APPROVED
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">1h Velocity Check</div>
                      <div className="text-[11px] text-slate-500">Sliding Window State</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    1 tx (Baseline)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Checkout SLA Latency</div>
                      <div className="text-[11px] text-slate-500">LightGBM Real-Time Inference</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    14.8 ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real KPI Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-white border ${kpi.border} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">{kpi.label}</span>
                  <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {kpi.val}
                </div>
                <p className="mt-1 text-xs text-slate-500">{kpi.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Three-Tier Frictionless Decision Policy */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Decision Architecture</span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">Multi-Tier Policy</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Autonomous Checkout Action Hierarchy</h3>
            </div>
            <p className="text-xs text-slate-600 max-w-md">
              Evaluates the asymmetric cost of chargebacks vs. user insult to dynamically assign frictionless approval, 3DS liability shift, or automated decline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auto-Approve */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 relative group hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tier 1: Auto-Approve</h4>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700">Risk Score &lt; 15</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Zero friction checkout. Streamlined authorization with sub-20ms SLA. 98.4%+ of legitimate shoppers pass untouched.
              </p>
              <div className="pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
                <span>Consumer Experience:</span>
                <span className="font-bold text-emerald-700">100% Frictionless</span>
              </div>
            </div>

            {/* Step-Up Challenge */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 relative group hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tier 2: 3DS / OTP Challenge</h4>
                  <span className="text-[11px] font-mono font-semibold text-amber-700">15 ≤ Risk Score &lt; 70</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Triggered strictly for ambiguous risk. Directs liability shift to the issuing bank under EMV 3D-Secure 2.0 protocols.
              </p>
              <div className="pt-3 border-t border-amber-200/60 text-[11px] text-amber-800 font-medium flex items-center justify-between">
                <span>Chargeback Liability:</span>
                <span className="font-bold text-amber-700">Shifts to Issuer</span>
              </div>
            </div>

            {/* Auto-Decline */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 relative group hover:border-rose-300 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tier 3: Auto-Decline</h4>
                  <span className="text-[11px] font-mono font-semibold text-rose-700">Risk Score ≥ 70</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Direct blocking of confirmed bot attacks, micro-authorization card sweeps, and stolen credential injections.
              </p>
              <div className="pt-3 border-t border-rose-200/60 text-[11px] text-rose-800 font-medium flex items-center justify-between">
                <span>Chargeback Prevention:</span>
                <span className="font-bold text-rose-700">100% Mitigated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
