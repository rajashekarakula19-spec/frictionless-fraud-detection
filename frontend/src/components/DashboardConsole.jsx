import React, { useState } from 'react';
import { 
  PlayCircle, 
  Sliders, 
  Activity, 
  Layers, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import TransactionSimulator from './TransactionSimulator';
import CostCurveOptimizer from './CostCurveOptimizer';
import LiveTransactionFeed from './LiveTransactionFeed';
import FeatureVelocityDeepDive from './FeatureVelocityDeepDive';

export default function DashboardConsole({ metricsData, healthData, onBackToLanding }) {
  const [activeSubTab, setActiveSubTab] = useState('simulator');

  const tabs = [
    { id: 'simulator', label: 'Risk Studio (Simulator)', icon: PlayCircle },
    { id: 'optimizer', label: 'Cost Curve & Loss Matrix', icon: Sliders },
    { id: 'live-feed', label: 'Live Payment Stream', icon: Activity },
    { id: 'features', label: 'Velocity Engine', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#EFE7D8]">
      {/* Top Console Command Header in Light Wood Theme */}
      <div className="bg-[#EAE0D0] border-b border-[#DDD2BF] px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb & Navigation Back to Full Screen Image */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EADC] text-[#78350F] text-xs font-bold transition-all border border-[#DDD2BF] shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cover Image</span>
            </button>
            <span className="text-[#C5B59C]">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2A1D13]">FraudSentinel Risk Operations Console</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#8B5A2B]/15 text-[#78350F] border border-[#8B5A2B]/25 font-bold">
                IEEE-CIS GATEWAY
              </span>
            </div>
          </div>

          {/* Quick Engine Telemetry */}
          <div className="flex items-center gap-4 text-xs font-medium text-[#5C4836]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-[#2A1D13] font-semibold">Model v1.4 (LightGBM)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-[#5C4836]">
              <Clock className="w-3.5 h-3.5 text-[#8B5A2B]" />
              <span>SLA: <strong className="text-[#2A1D13] font-mono">18ms p95</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-[#5C4836]">
              <span>Insult Rate: <strong className="text-emerald-800 font-mono font-bold">0.021%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Console Tab Bar in Warm Wood Style */}
      <div className="bg-[#EFE7D8]/95 backdrop-blur-md border-b border-[#DDD2BF] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#78350F] text-white shadow-md shadow-[#78350F]/25'
                      : 'bg-[#FAF6EE] text-[#5C4836] hover:text-[#2A1D13] hover:bg-[#F2EADC] border border-[#DDD2BF]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeSubTab === 'simulator' && <TransactionSimulator />}
        {activeSubTab === 'optimizer' && <CostCurveOptimizer policyData={metricsData?.policy} />}
        {activeSubTab === 'live-feed' && <LiveTransactionFeed />}
        {activeSubTab === 'features' && <FeatureVelocityDeepDive topFeatures={metricsData?.top_features} />}
      </div>
    </div>
  );
}
