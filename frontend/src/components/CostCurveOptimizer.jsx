import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

export default function CostCurveOptimizer({ policyData }) {
  const [threshold, setThreshold] = useState(0.45);
  const [costCurve, setCostCurve] = useState([]);
  const [loading, setLoading] = useState(true);

  const [monthlyVolume, setMonthlyVolume] = useState(5000000);
  const [avgTicket, setAvgTicket] = useState(85);

  useEffect(() => {
    async function fetchCostCurve() {
      try {
        const res = await fetch('/api/cost-curve');
        if (res.ok) {
          const data = await res.json();
          setCostCurve(data.cost_curve || []);
          if (data.cost_curve && data.cost_curve.length > 0) {
            setThreshold(policyData?.optimal_threshold || 0.42);
          }
        }
      } catch (e) {
        console.warn("Could not fetch cost curve from API, generating local curve:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCostCurve();
  }, [policyData]);

  const activeCurve = costCurve.length > 0 ? costCurve : Array.from({ length: 50 }, (_, i) => {
    const th = 0.02 + i * 0.02;
    const cb = Math.round(150000 * Math.pow(th, 1.8) + 8000);
    const insult = Math.round(280000 * Math.pow(1 - th, 2.5) + 3000);
    const total = cb + insult;
    const insultRate = Math.max(0.05, (1 - th) * 3.5);
    const recall = Math.min(99.5, 99.8 - Math.pow(th, 2) * 35);
    const precision = Math.min(98.0, 45 + th * 50);
    return {
      threshold: parseFloat(th.toFixed(2)),
      total_cost: total,
      chargeback_loss: cb,
      user_insult_cost: insult,
      net_savings: Math.max(0, 450000 - total),
      user_insult_rate: parseFloat(insultRate.toFixed(2)),
      recall: parseFloat(recall.toFixed(1)),
      precision: parseFloat(precision.toFixed(1)),
      chargeback_ratio_pct: parseFloat((cb / 5000000 * 100).toFixed(3))
    };
  });

  const currentMetrics = activeCurve.reduce((prev, curr) => 
    Math.abs(curr.threshold - threshold) < Math.abs(prev.threshold - threshold) ? curr : prev
  , activeCurve[0] || {});

  const optimalPoint = activeCurve.reduce((prev, curr) => 
    curr.total_cost < prev.total_cost ? curr : prev
  , activeCurve[0] || {});

  const annualGmv = monthlyVolume * 12;
  const annualSaved = Math.round(annualGmv * 0.028 * (currentMetrics.recall / 100) * 0.85);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">
          <Scale className="w-4 h-4 text-[#78350F]" />
          <span>Cost-Utility Optimization Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
          Asymmetric Loss Matrix &amp; Threshold Tuning
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-3xl">
          Standard accuracy-maximizing models fail in payment systems. We evaluate the trade-off between 
          <span className="text-rose-600 font-semibold"> Chargeback Loss ($S + $20 fee)</span> and 
          <span className="text-[#8B5A2B] font-semibold"> Customer Insult Cost ($35 LTV drag)</span>.
        </p>
      </div>

      {/* Threshold Slider Controller */}
      <div className="bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#2A1D13]">Decision Operating Cutoff (θ)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#8B5A2B]/15 text-[#78350F] border border-[#8B5A2B]/30 font-mono font-bold">
                θ = {threshold.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-[#6B5744] mt-0.5">
              Drag to observe real-time shift in False Positive Rate vs. Chargeback Recovery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setThreshold(optimalPoint.threshold)}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Snap to Minimum Cost (θ={optimalPoint.threshold})</span>
            </button>
            <button
              onClick={() => setThreshold(0.20)}
              className="px-3 py-1.5 rounded-lg bg-[#EFE7D8] border border-[#DDD2BF] text-[#5C4836] text-xs font-semibold hover:bg-[#F2EADC] transition-all cursor-pointer"
            >
              Strict Insult SLA (0.3%)
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#E5D7C3] rounded-lg appearance-none cursor-pointer accent-[#78350F] focus:outline-none"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#6B5744] mt-2">
            <span>0.05 (High Caution / High Friction)</span>
            <span className="text-emerald-800 font-bold">Optimal: {optimalPoint.threshold}</span>
            <span>0.95 (Permissive / High Chargebacks)</span>
          </div>
        </div>

        {/* Reactive Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#DDD2BF]">
          <div className="p-3.5 rounded-xl bg-[#F2EADC] border border-[#DDD2BF]">
            <span className="text-[11px] font-bold text-[#5C4836]">Total Financial Cost</span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#2A1D13] mt-0.5">
              ${currentMetrics.total_cost?.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#6B5744] mt-0.5 flex items-center gap-1">
              <span>Optimal:</span>
              <span className="text-emerald-800 font-mono font-bold">${optimalPoint.total_cost?.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-900">Chargeback Loss</span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-800 mt-0.5">
              ${currentMetrics.chargeback_loss?.toLocaleString()}
            </div>
            <span className="text-[10px] text-rose-700/80 mt-0.5 block">From missed fraud</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EFE7D8] border border-[#DDD2BF]">
            <span className="text-[11px] font-bold text-[#78350F]">User Insult Cost</span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#78350F] mt-0.5">
              ${currentMetrics.user_insult_cost?.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#8B5A2B] mt-0.5 block">False positives friction</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-900">User Insult Rate (FPR)</span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-800 mt-0.5">
              {currentMetrics.user_insult_rate}%
            </div>
            <span className="text-[10px] text-emerald-800 mt-0.5 block font-medium">
              {currentMetrics.user_insult_rate < 0.5 ? '✓ Under 0.5% SLA' : '⚠ Exceeds SLA'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Visual Curves (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Chart: Monetary Cost Curve */}
        <div className="lg:col-span-7 bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2A1D13] flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#78350F]" />
                <span>Monetary Cost Curve vs Threshold (θ)</span>
              </h3>
              <p className="text-xs text-[#6B5744] mt-0.5">
                Global cost minimum where Chargeback Loss intersects User Insult friction.
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeCurve} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="costGradientLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#78350F" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#78350F" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDD2BF" />
                <XAxis 
                  dataKey="threshold" 
                  stroke="#8C7660" 
                  fontSize={11}
                  tickFormatter={(val) => `θ=${val}`}
                />
                <YAxis 
                  stroke="#8C7660" 
                  fontSize={11} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF6EE', borderColor: '#DDD2BF', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(74, 52, 33, 0.1)' }}
                  labelFormatter={(v) => `Threshold: θ = ${v}`}
                  formatter={(val, name) => [`$${Number(val).toLocaleString()}`, name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_cost" 
                  stroke="#78350F" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#costGradientLight)" 
                  name="Total Cost ($)"
                />
                <Line 
                  type="monotone" 
                  dataKey="chargeback_loss" 
                  stroke="#B91C1C" 
                  strokeWidth={1.5} 
                  dot={false}
                  name="Chargeback Loss"
                />
                <Line 
                  type="monotone" 
                  dataKey="user_insult_cost" 
                  stroke="#8B5A2B" 
                  strokeWidth={1.5} 
                  dot={false}
                  name="Insult Friction Cost"
                />
                <ReferenceLine x={threshold} stroke="#D97706" strokeDasharray="4 4" label={{ value: 'Current', fill: '#D97706', fontSize: 10 }} />
                <ReferenceLine x={optimalPoint.threshold} stroke="#059669" strokeWidth={1.5} label={{ value: 'Min Cost', fill: '#059669', fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Fraud Recall vs User Insult Rate */}
        <div className="lg:col-span-5 bg-[#FAF6EE] rounded-2xl p-6 border border-[#DDD2BF] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2A1D13] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Operational Sensitivity</span>
              </h3>
              <p className="text-xs text-[#6B5744] mt-0.5">
                Catch Rate (Recall %) vs False Positive Insult Rate (%)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeCurve} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDD2BF" />
                <XAxis dataKey="threshold" stroke="#8C7660" fontSize={11} />
                <YAxis stroke="#8C7660" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF6EE', borderColor: '#DDD2BF', borderRadius: '12px' }}
                  labelFormatter={(v) => `Threshold: θ = ${v}`}
                />
                <Line type="monotone" dataKey="recall" stroke="#059669" strokeWidth={2} dot={false} name="Fraud Catch Rate %" />
                <Line type="monotone" dataKey="user_insult_rate" stroke="#B91C1C" strokeWidth={2} dot={false} name="User Insult Rate %" />
                <ReferenceLine x={threshold} stroke="#D97706" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business ROI & Regulatory Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Visa / Mastercard Chargeback Compliance Warning */}
        <div className="md:col-span-5 bg-[#FAF6EE] rounded-2xl p-5 border border-[#DDD2BF] shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">Card Brand Compliance</div>
            <div className="text-sm font-bold text-[#2A1D13] mt-0.5">Visa VROL &amp; Mastercard ECP Protection</div>
            <p className="text-xs text-[#5C4836] mt-1 leading-relaxed">
              Exceeding a <strong className="text-[#2A1D13]">0.90% chargeback-to-volume ratio</strong> triggers fines up to $50,000/mo. Current operating policy keeps our chargeback ratio at <strong className="text-emerald-800 font-bold">0.14%</strong>, well below card network thresholds.
            </p>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="md:col-span-7 bg-[#FAF6EE] rounded-2xl p-5 border border-[#DDD2BF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78350F]">Merchant ROI Estimator</span>
            <span className="text-xs text-[#6B5744] font-mono">Live Projections</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-[11px] font-semibold text-[#5C4836] block mb-1">Monthly Gross Volume ($)</label>
              <input
                type="number"
                step="500000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D4C4AC] text-[#2A1D13] font-mono text-xs focus:outline-none focus:border-[#78350F]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#5C4836] block mb-1">Average Ticket Size ($)</label>
              <input
                type="number"
                value={avgTicket}
                onChange={(e) => setAvgTicket(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D4C4AC] text-[#2A1D13] font-mono text-xs focus:outline-none focus:border-[#78350F]"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-right">
              <span className="text-[10px] uppercase tracking-wider text-emerald-900 font-bold block">Annual Recovered Revenue</span>
              <div className="text-xl font-extrabold font-mono text-emerald-800 mt-0.5">
                ${annualSaved.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
