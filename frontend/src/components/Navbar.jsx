import React from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, healthData }) {
  return (
    <header className="sticky top-0 z-50 bg-[#EAE0D0]/95 backdrop-blur-md border-b border-[#DDD2BF] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8B5A2B]/15 border border-[#8B5A2B]/30 flex items-center justify-center text-[#78350F] group-hover:bg-[#8B5A2B]/25 transition-colors shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-[#78350F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#2A1D13]">
                FraudSentinel
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5A2B]/10 text-[#78350F] border border-[#8B5A2B]/25">
                IEEE-CIS
              </span>
            </div>
            <p className="text-[11px] text-[#6B5744] font-medium">Real-Time Risk &amp; Frictionless Defense</p>
          </div>
        </div>

        {/* View Mode Switching Controls */}
        <div className="flex items-center gap-3">
          {currentView === 'landing' ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#78350F] hover:bg-[#8B5A2B] text-white text-xs font-bold shadow-sm shadow-[#78350F]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5D7C3] border border-[#DDD2BF] text-[#2A1D13] text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-mono text-[11px] font-bold">
                  {healthData?.p95_latency_target_ms ? `p95: ${healthData.p95_latency_target_ms}ms` : 'SLA: 18ms'}
                </span>
                <span className="text-[#B5A189]">|</span>
                <span className="text-[11px] text-[#5C4836] font-semibold">Console Active</span>
              </div>
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EADC] text-[#78350F] text-xs font-bold transition-all border border-[#DDD2BF] shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cover Image</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
