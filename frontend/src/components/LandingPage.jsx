import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Clock, 
  Scale, 
  ChevronDown,
  ChevronRight,
  Activity,
  Layers,
  Lock,
  Cpu
} from 'lucide-react';

export default function LandingPage({ onLaunchDashboard }) {
  const scrollToExplore = () => {
    const el = document.getElementById('what-it-does');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE7D8] text-[#2A1D13] flex flex-col scroll-smooth selection:bg-[#8B5A2B] selection:text-white">
      {/* 1. Full-Screen Hero Viewport: Image occupies the full screen */}
      <section className="relative w-full h-screen min-h-[700px] overflow-hidden flex flex-col justify-between">
        {/* Full-Screen Storytelling Image (Edge-to-Edge, Crisp, Sharp, Unaltered) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-story.jpg" 
            alt="Customer seamless payment in modern bank with real-time invisible fraud defense" 
            className="w-full h-full object-cover object-[center_35%] select-none brightness-[1.0] contrast-[1.02]" 
          />
          
          {/* Gentle bottom transition gradient blending smoothly into the light wood section below */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#EFE7D8] via-[#EFE7D8]/50 to-transparent pointer-events-none" />
        </div>

        {/* Hero Top Content: Floating Glassmorphism Card on Left Side Top */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-10 sm:pt-14 flex-1 flex flex-col justify-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl backdrop-blur-md bg-[#FAF6EE]/85 border border-[#DDD2BF]/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#2A1D13]/10"
          >
            {/* Top Project Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8] border border-[#DDD2BF] text-[#78350F] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#78350F]" />
              <span>FraudSentinel Enterprise</span>
              <span className="text-[#C5B59C]">•</span>
              <span className="text-[#6B5744] font-medium lowercase">IEEE-CIS Benchmark</span>
            </div>

            {/* Project Title (Prominent on Left Side Top) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2A1D13] leading-tight">
              FraudSentinel
            </h1>
            
            <p className="text-base sm:text-lg font-bold text-[#78350F] mt-1.5 tracking-tight">
              Frictionless Real-Time Transaction Fraud Defense
            </p>

            {/* Little Description (Clean & Concise Two-Liner) */}
            <p className="mt-3 text-sm text-[#443324] font-medium leading-relaxed">
              A real-time payment risk engine leveraging cross-session velocity features and cost-sensitive LightGBM to neutralize unauthorized card transactions. 
              Balances chargeback loss against customer insult friction, delivering sub-20ms defense with a 98.4% frictionless approval rate.
            </p>

            {/* 'Go to Dashboard' Button */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onLaunchDashboard}
                className="group flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-[#78350F] hover:bg-[#8B5A2B] active:bg-[#5C2B09] text-white font-bold text-sm shadow-xl shadow-[#78350F]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
              </button>
            </div>

            {/* Key Trust Metrics */}
            <div className="mt-5 pt-4 border-t border-[#DDD2BF]/80 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5C4836]">
              <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#DDD2BF] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>0.021% Insult Rate</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#DDD2BF] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#8B5A2B]"></span>
                <span>Sub-20ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#DDD2BF] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-stone-700"></span>
                <span>EMV 3DS Shift</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Prominent Scrolling Animation Indicator at the Bottom Center */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-10 w-full pb-8 flex flex-col items-center justify-center pointer-events-auto"
        >
          <button 
            onClick={scrollToExplore}
            className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
            aria-label="Scroll down to explore"
          >
            {/* Animated pill badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF6EE]/90 backdrop-blur-md border border-[#DDD2BF] shadow-lg group-hover:bg-[#FAF6EE] group-hover:border-[#78350F]/50 transition-all text-xs font-bold text-[#78350F]">
              <span>Scroll down to explore what this project does</span>
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </div>

            {/* Animated Mouse Icon with Scrolling Wheel Indicator */}
            <div className="w-6 h-10 rounded-full border-2 border-[#78350F]/80 bg-[#FAF6EE]/90 backdrop-blur-sm flex justify-center pt-2 shadow-md">
              <motion.div 
                animate={{ 
                  y: [0, 14, 0],
                  opacity: [1, 0.2, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.6, 
                  ease: "easeInOut" 
                }}
                className="w-1.5 h-2.5 rounded-full bg-[#78350F]"
              />
            </div>
          </button>
        </motion.div>
      </section>

      {/* 2. Scrolling Section: What This Project Does (Following the Light Wood Theme) */}
      <section id="what-it-does" className="bg-[#EFE7D8] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#DDD2BF] relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with Reveal Animation */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-14"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5A2B] mb-2">
              <Zap className="w-4 h-4 text-[#78350F]" />
              <span>Project Capabilities & Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2A1D13] tracking-tight">
              What This Project Does
            </h2>
            <p className="mt-3 text-sm text-[#5C4836] leading-relaxed">
              Engineered against the IEEE-CIS benchmark to resolve the core tension in modern payment systems: completely neutralizing unauthorized chargeback losses while maintaining effortless, zero-friction checkout for legitimate users.
            </p>
          </motion.div>

          {/* 3 Core Tasks Cards with Animated Reveal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-7 rounded-3xl bg-[#FAF6EE] border border-[#DDD2BF] shadow-sm flex flex-col justify-between hover:border-[#8B5A2B] hover:shadow-md transition-all group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EFE7D8] border border-[#DDD2BF] flex items-center justify-center text-[#78350F] mb-5 group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2A1D13]">1. Cross-Session Velocity Engine</h3>
                <p className="text-xs text-[#5C4836] mt-3 leading-relaxed">
                  Computes stateful in-memory sliding windows (1h, 6h, 24h, 7d counts &amp; spend), inter-arrival re-swipe intervals (&Delta;t), and device fingerprint switches to immediately spot rapid bot attacks and account takeovers before settlement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDD2BF] text-xs font-mono text-[#78350F] font-bold flex items-center justify-between">
                <span>1h / 24h lookbacks</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">&lt;2ms compute</span>
              </div>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-7 rounded-3xl bg-[#FAF6EE] border border-[#DDD2BF] shadow-sm flex flex-col justify-between hover:border-[#8B5A2B] hover:shadow-md transition-all group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EFE7D8] border border-[#DDD2BF] flex items-center justify-center text-[#78350F] mb-5 group-hover:scale-105 transition-transform">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2A1D13]">2. Cost-Sensitive Classification</h3>
                <p className="text-xs text-[#5C4836] mt-3 leading-relaxed">
                  Implements custom asymmetric loss in LightGBM and XGBoost, penalizing chargebacks ($S + $20 fee) 4.5&times; over false alarms. Maximizes net monetary savings rather than naive symmetric classification accuracy.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDD2BF] text-xs font-mono text-emerald-800 font-bold flex items-center justify-between">
                <span>$173,501 Net Saved</span>
                <span className="text-[#78350F] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">0.021% FPR</span>
              </div>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-7 rounded-3xl bg-[#FAF6EE] border border-[#DDD2BF] shadow-sm flex flex-col justify-between hover:border-[#8B5A2B] hover:shadow-md transition-all group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EFE7D8] border border-[#DDD2BF] flex items-center justify-center text-[#78350F] mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2A1D13]">3. Three-Tier Decision Policy</h3>
                <p className="text-xs text-[#5C4836] mt-3 leading-relaxed">
                  Automatically approves 98.4% of low-risk transactions with 0ms user friction, triggers 3D-Secure 2.0 biometric challenge in the ambiguous zone (shifting liability to issuers), and instantly declines high-probability fraud.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DDD2BF] text-xs font-mono text-[#8B5A2B] font-bold flex items-center justify-between">
                <span>EMV 3DS Shift</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">98.4% Auto-Approve</span>
              </div>
            </motion.div>
          </div>

          {/* Real-Time Processing Architecture Flow Diagram */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mt-12 p-8 rounded-3xl bg-[#FAF6EE] border border-[#DDD2BF] shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78350F] mb-2">
              <Cpu className="w-4 h-4 text-[#78350F]" />
              <span>Real-Time Processing Pipeline</span>
            </div>
            <h3 className="text-xl font-bold text-[#2A1D13] mb-6">
              How Live Authorizations Flow Through the Engine
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-[#EFE7D8]/70 border border-[#DDD2BF]">
                <div className="font-bold text-[#2A1D13] flex items-center gap-2 mb-1.5">
                  <Activity className="w-4 h-4 text-[#78350F]" />
                  <span>Phase 1: Feature Assembly</span>
                </div>
                <p className="text-[#5C4836] leading-relaxed">
                  Incoming checkout payload merges with Redis/in-memory session state to calculate velocity counters, inter-arrival gap (&Delta;t), and device hash switches in &lt;3ms.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE7D8]/70 border border-[#DDD2BF]">
                <div className="font-bold text-[#2A1D13] flex items-center gap-2 mb-1.5">
                  <Layers className="w-4 h-4 text-[#78350F]" />
                  <span>Phase 2: Cost-Sensitive Scoring</span>
                </div>
                <p className="text-[#5C4836] leading-relaxed">
                  LightGBM evaluates tree ensembles with adverse reason SHAP attribution. Operating threshold &theta;* = 0.446 dynamically minimizes total dollar loss.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE7D8]/70 border border-[#DDD2BF]">
                <div className="font-bold text-[#2A1D13] flex items-center gap-2 mb-1.5">
                  <Lock className="w-4 h-4 text-[#78350F]" />
                  <span>Phase 3: Policy Execution</span>
                </div>
                <p className="text-[#5C4836] leading-relaxed">
                  Approve (0ms friction), Step-Up (issuer 3DS OTP challenge liability shift), or Block. Full decision telemetry logged in &lt;16ms total roundtrip SLA.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Banner to Launch Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mt-12 p-8 rounded-3xl bg-[#FAF6EE] border border-[#DDD2BF] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
          >
            <div>
              <div className="text-base font-bold text-[#2A1D13]">Ready to explore live transactions and test risk scenarios?</div>
              <div className="text-xs text-[#6B5744] mt-1">
                Access the interactive Risk Studio simulator, threshold utility curves, real-time transaction stream, and velocity engine telemetry.
              </div>
            </div>
            <button
              onClick={onLaunchDashboard}
              className="group px-8 py-3.5 rounded-2xl bg-[#78350F] hover:bg-[#8B5A2B] active:bg-[#5C2B09] text-white font-bold text-xs shadow-xl shadow-[#78350F]/20 transition-all hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
            >
              <span>Launch Dashboard Console</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Clean Light Wood Footer */}
      <footer className="bg-[#E8DECE] border-t border-[#DDD2BF] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#6B5744]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-[#2A1D13]">FraudSentinel: Frictionless Real-Time Transaction Fraud Defense</div>
          <div>IEEE-CIS Benchmark &bull; Sub-20ms SLA &bull; LightGBM Cost-Sensitive Loss Objective</div>
        </div>
      </footer>
    </div>
  );
}
