import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  {
    id: "TX-904120",
    timestamp: "Just now",
    card: "Visa •••• 4291",
    amount: 74.50,
    email: "olivia.martinez@gmail.com",
    device: "iPhone 15 Pro (Safari)",
    geo: "Austin, TX (8 mi)",
    score: 4.2,
    decision: "APPROVE",
    latency: "14ms",
    reason: "Consistent device token + local billing match"
  },
  {
    id: "TX-904121",
    timestamp: "12s ago",
    card: "Mastercard •••• 1092",
    amount: 1450.00,
    email: "steve_buyer@protonmail.com",
    device: "Linux / TorBrowser Exit Node",
    geo: "Lagos, NG (6,420 mi)",
    score: 93.8,
    decision: "DECLINE",
    latency: "19ms",
    reason: "Extreme Geo Mismatch + Disposable Email + Tor Node"
  },
  {
    id: "TX-904122",
    timestamp: "28s ago",
    card: "Visa •••• 8841",
    amount: 340.00,
    email: "kevin.williams@yahoo.com",
    device: "Windows 11 (Edge)",
    geo: "Chicago, IL (410 mi)",
    score: 41.5,
    decision: "STEP_UP_CHALLENGE",
    latency: "16ms",
    reason: "New Device Fingerprint + Elevated Ticket Size"
  },
  {
    id: "TX-904123",
    timestamp: "45s ago",
    card: "Amex •••• 3042",
    amount: 1.50,
    email: "test_bot99@mailinator.com",
    device: "Dalvik / Android Emulator",
    geo: "Bucharest, RO (4,800 mi)",
    score: 97.4,
    decision: "DECLINE",
    latency: "15ms",
    reason: "Micro-auth probing pattern + Card Testing Attack"
  },
  {
    id: "TX-904124",
    timestamp: "1m ago",
    card: "Visa •••• 7120",
    amount: 128.20,
    email: "sarah.jenkins@apple.com",
    device: "MacBook Pro (Chrome)",
    geo: "Seattle, WA (4 mi)",
    score: 2.1,
    decision: "APPROVE",
    latency: "12ms",
    reason: "Trusted consumer profile + 3DS verified"
  },
  {
    id: "TX-904125",
    timestamp: "1m 30s ago",
    card: "Discover •••• 6501",
    amount: 49.99,
    email: "brian.clark@outlook.com",
    device: "iPad Pro (Safari)",
    geo: "Denver, CO (12 mi)",
    score: 6.8,
    decision: "APPROVE",
    latency: "14ms",
    reason: "Verified domestic address + regular velocity"
  }
];

export default function LiveTransactionFeed() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const isFraudScenario = Math.random() < 0.18;
      const isChallengeScenario = !isFraudScenario && Math.random() < 0.12;

      let score, decision, amt, dev, geo, reason, email;

      if (isFraudScenario) {
        score = (85 + Math.random() * 14).toFixed(1);
        decision = "DECLINE";
        amt = (Math.random() < 0.4 ? (1.0 + Math.random() * 3.0) : (600 + Math.random() * 1800)).toFixed(2);
        dev = Math.random() < 0.5 ? "Linux / TorBrowser" : "Dalvik Emulator x86";
        geo = "St. Petersburg, RU (5,200 mi)";
        reason = amt < 5 ? "Micro-authorization bot pattern" : "Sudden ticket spike + high distance geo";
        email = "adversary" + Math.floor(Math.random() * 900) + "@trashmail.net";
      } else if (isChallengeScenario) {
        score = (35 + Math.random() * 25).toFixed(1);
        decision = "STEP_UP_CHALLENGE";
        amt = (280 + Math.random() * 450).toFixed(2);
        dev = "Mobile Safari (New Fingerprint)";
        geo = "Miami, FL (850 mi)";
        reason = "Unrecognized device switch on card token";
        email = "customer" + Math.floor(Math.random() * 500) + "@gmail.com";
      } else {
        score = (1 + Math.random() * 9).toFixed(1);
        decision = "APPROVE";
        amt = (15 + Math.random() * 160).toFixed(2);
        dev = "Chrome / macOS";
        geo = "San Jose, CA (6 mi)";
        reason = "Clean consumer baseline profile";
        email = "shopper" + Math.floor(Math.random() * 999) + "@gmail.com";
      }

      const newTx = {
        id: `TX-${Math.floor(904000 + Math.random() * 10000)}`,
        timestamp: "Just now",
        card: `Visa •••• ${Math.floor(1000 + Math.random() * 9000)}`,
        amount: parseFloat(amt),
        email,
        device: dev,
        geo,
        score: parseFloat(score),
        decision,
        latency: `${Math.floor(12 + Math.random() * 8)}ms`,
        reason
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 24)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter !== 'ALL' && tx.decision !== filter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.email.toLowerCase().includes(q) ||
        tx.card.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getDecisionPill = (decision) => {
    switch (decision) {
      case 'APPROVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>APPROVE</span>
          </span>
        );
      case 'STEP_UP_CHALLENGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            <span>3DS STEP-UP</span>
          </span>
        );
      case 'DECLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>DECLINE</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">
            <Activity className="w-4 h-4 text-[#78350F]" />
            <span>Real-Time Payment Feed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A1D13] mt-1">Live Transaction Stream</h2>
          <p className="text-sm text-[#6B5744] mt-1">
            Real-time inspection of checkout authorizations streaming through the sub-20ms scoring pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isStreaming
                ? 'bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200'
                : 'bg-emerald-100 border border-emerald-300 text-emerald-900 hover:bg-emerald-200'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Live Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Live Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF6EE] rounded-2xl p-4 border border-[#DDD2BF] shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C7660] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search TX ID, email, or card..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#D4C4AC] text-[#2A1D13] text-xs placeholder:text-[#8C7660] focus:outline-none focus:border-[#78350F]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#6B5744] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {['ALL', 'APPROVE', 'STEP_UP_CHALLENGE', 'DECLINE'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === mode
                  ? 'bg-[#78350F] text-white shadow-2xs'
                  : 'bg-[#EFE7D8] text-[#5C4836] border border-[#DDD2BF] hover:text-[#2A1D13]'
              }`}
            >
              {mode === 'STEP_UP_CHALLENGE' ? '3DS STEP-UP' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#FAF6EE] rounded-2xl border border-[#DDD2BF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDD2BF] text-[11px] font-bold uppercase tracking-wider text-[#5C4836] bg-[#EAE0D0]">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Cardholder / Device</th>
                <th className="py-3.5 px-4">Geo Proximity</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Decision Action</th>
                <th className="py-3.5 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD2BF] text-xs font-normal">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-[#F2EADC] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-[#2A1D13]">
                    <div className="flex items-center gap-2">
                      <span className="group-hover:text-[#78350F] font-bold transition-colors">{tx.id}</span>
                      <span className="text-[10px] text-[#8C7660] font-sans">{tx.timestamp}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2A1D13]">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[#2A1D13] font-semibold">{tx.email}</div>
                    <div className="text-[11px] text-[#6B5744] flex items-center gap-2 mt-0.5">
                      <span>{tx.card}</span>
                      <span>•</span>
                      <span>{tx.device}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#5C4836]">
                    {tx.geo}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className={tx.score > 70 ? 'text-rose-700' : (tx.score > 15 ? 'text-amber-700' : 'text-emerald-700')}>
                      {tx.score}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getDecisionPill(tx.decision)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6B5744] font-medium">
                    {tx.latency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Transaction Modal/Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-600 mb-1">
              <span>Authorization Detail</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{selectedTx.id}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedTx.reason}</p>

            <div className="mt-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-slate-900">${selectedTx.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Decision:</span>
                <span>{getDecisionPill(selectedTx.decision)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Risk Score:</span>
                <span className="font-mono font-bold text-indigo-600">{selectedTx.score} / 100</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Device Fingerprint:</span>
                <span className="font-mono text-slate-700">{selectedTx.device}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Geo Location:</span>
                <span className="text-slate-700">{selectedTx.geo}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Inference SLA:</span>
                <span className="font-mono text-emerald-600 font-bold">{selectedTx.latency}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 shadow-2xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
