import React from 'react';
import { 
  Layers, 
  Clock, 
  Smartphone, 
  Globe, 
  BarChart3, 
  Code
} from 'lucide-react';

export default function FeatureVelocityDeepDive({ topFeatures }) {
  const defaultTopFeatures = [
    { feature: "dist1_clean", importance: 62173.8, display_name: "Distance from Billing Address (Geo Discrepancy)" },
    { feature: "dist1_log", importance: 21302.9, display_name: "Log-Transformed Geo Proximity" },
    { feature: "dist1_extreme_flag", importance: 8033.1, display_name: "Cross-Border / Extreme Distance Flag (>500 mi)" },
    { feature: "tx_count_1h", importance: 7420.5, display_name: "1-Hour Cross-Session Velocity Count" },
    { feature: "device_switch_24h", importance: 6890.2, display_name: "Device Fingerprint Switch in 24 Hours" },
    { feature: "tx_amt_ratio_to_mean_24h", importance: 5410.8, display_name: "Ticket Deviation vs Cardholder Baseline" },
    { feature: "time_since_last_tx", importance: 4920.1, display_name: "Inter-Arrival Seconds (Rapid Re-swipe)" },
    { feature: "is_suspicious_device_agent", importance: 3880.4, display_name: "Bot / Tor / Emulator User-Agent Signature" }
  ];

  const featuresList = (topFeatures && topFeatures.length > 0) ? topFeatures.slice(0, 8) : defaultTopFeatures;
  const maxImportance = Math.max(...featuresList.map(f => f.importance || 1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">
          <Layers className="w-4 h-4 text-[#78350F]" />
          <span>Feature Store & Pipeline Engineering</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A1D13] mt-1">
          Cross-Session Velocity & Cost-Loss Mathematics
        </h2>
        <p className="text-sm text-[#6B5744] mt-1 max-w-3xl">
          Deep dive into the real-time stateful feature computation, device mutation entropy, and asymmetric loss formulation running under the hood.
        </p>
      </div>

      {/* Feature Pillar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Pillar 1: Velocity Engine */}
        <div className="bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFE7D8] border border-[#DDD2BF] flex items-center justify-center text-[#78350F] mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#2A1D13]">1. Sliding Window Velocity</h3>
          <p className="text-xs text-[#6B5744] mt-1.5 leading-relaxed">
            Maintains time-decayed sliding deques of historical authorizations per composite card entity (<code className="text-[#78350F] font-bold">card1_card2_card4</code>).
          </p>

          <div className="mt-4 space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">1-Hour Count &amp; Spend:</span>
              <span className="font-mono text-[#78350F] font-bold">tx_count_1h, tx_amt_sum_1h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">24-Hour &amp; 7-Day Window:</span>
              <span className="font-mono text-[#78350F] font-bold">tx_count_24h, tx_count_7d</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">Inter-Arrival Time:</span>
              <span className="font-mono text-[#78350F] font-bold">Δt (seconds since last tx)</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Device & Identity Mutation */}
        <div className="bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFE7D8] border border-[#DDD2BF] flex items-center justify-center text-[#78350F] mb-4">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#2A1D13]">2. Device &amp; Identity Mutation</h3>
          <p className="text-xs text-[#6B5744] mt-1.5 leading-relaxed">
            Detects account takeover (ATO) and credential stuffing by observing rapid switches across browser environments and IP domains.
          </p>

          <div className="mt-4 space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">Device Fingerprint Switch:</span>
              <span className="font-mono text-[#78350F] font-bold">device_switch_24h (0/1)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">Unique Devices (24h):</span>
              <span className="font-mono text-[#78350F] font-bold">unique_devices_24h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">Domain Disposable Check:</span>
              <span className="font-mono text-[#78350F] font-bold">is_high_risk_p_email</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Address & Geo Discrepancy */}
        <div className="bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFE7D8] border border-[#DDD2BF] flex items-center justify-center text-[#78350F] mb-4">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#2A1D13]">3. Billing vs. IP Distance</h3>
          <p className="text-xs text-[#6B5744] mt-1.5 leading-relaxed">
            Replicates AVS (Address Verification Service) geo-spatial delta between the cardholder billing ZIP and the transaction IP coordinates.
          </p>

          <div className="mt-4 space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">Distance from Billing:</span>
              <span className="font-mono text-[#78350F] font-bold">dist1 (miles)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">Extreme Geo Flag:</span>
              <span className="font-mono text-[#78350F] font-bold">&gt; 500 miles mismatch</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF] flex items-center justify-between">
              <span className="text-[#5C4836] font-medium">Log Proximity Transform:</span>
              <span className="font-mono text-[#78350F] font-bold">log1p(dist1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Feature Gain Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#2A1D13] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#78350F]" />
              <span>LightGBM Model Feature Gain Ranking</span>
            </h3>
            <span className="text-xs font-mono text-[#6B5744] font-medium">Total Information Gain</span>
          </div>

          <div className="space-y-3">
            {featuresList.map((item, idx) => {
              const pct = Math.round((item.importance / maxImportance) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#2A1D13] font-semibold">{item.display_name || item.feature}</span>
                    <span className="font-mono text-[#6B5744]">{Math.round(item.importance).toLocaleString()} gain</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5D7C3] overflow-hidden border border-[#DDD2BF]">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#78350F] to-[#B45309] transition-all duration-700" 
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Cost Loss Mathematical Formulation */}
        <div className="lg:col-span-5 bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5A2B] mb-2">
              <Code className="w-4 h-4 text-[#78350F]" />
              <span>Mathematical Formulation</span>
            </div>
            <h3 className="text-base font-bold text-[#2A1D13]">Custom Asymmetric Cost Loss</h3>
            <p className="text-xs text-[#6B5744] mt-1 leading-relaxed">
              Standard cross-entropy penalizes False Negatives and False Positives equally. Our custom loss computes the first and second order derivatives weighted by financial asymmetry:
            </p>

            {/* Math box */}
            <div className="my-4 p-4 rounded-xl bg-[#2A1D13] border border-[#5C3D1E] font-mono text-xs text-[#FAF6EE] space-y-2 shadow-inner">
              <div className="text-stone-400">// Gradient with Respect to Margin z:</div>
              <div className="text-amber-300 font-bold">
                g_i = w_i · (p_i - y_i)
              </div>
              <div className="text-stone-400 pt-2">// Hessian (Second Derivative):</div>
              <div className="text-amber-200 font-bold">
                h_i = w_i · p_i · (1 - p_i)
              </div>
              <div className="text-stone-400 pt-2">// Cost Weight Multiplier:</div>
              <div className="text-emerald-400">
                w_i = (y_i == 1) ? 4.5 : 1.0
              </div>
            </div>

            <p className="text-xs text-[#6B5744] leading-relaxed">
              Where <strong className="text-[#2A1D13]">w_i</strong> enforces a 4.5× penalty factor on missed fraud to reflect true chargeback processing fees and network dispute penalties.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[#DDD2BF] flex items-center justify-between text-xs text-[#6B5744]">
            <span>Framework Support:</span>
            <span className="font-mono font-bold text-[#2A1D13]">LightGBM 4.7 + XGBoost 3.2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
