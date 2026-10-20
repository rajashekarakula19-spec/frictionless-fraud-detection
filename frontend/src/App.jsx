import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardConsole from './components/DashboardConsole';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [healthData, setHealthData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);

  useEffect(() => {
    async function loadSystemTelemetry() {
      try {
        const [hRes, mRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/metrics')
        ]);
        if (hRes.ok) setHealthData(await hRes.json());
        if (mRes.ok) setMetricsData(await mRes.json());
      } catch (err) {
        console.warn("Could not fetch remote telemetry, running in simulated mode:", err);
      }
    }
    loadSystemTelemetry();
  }, []);

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onLaunchDashboard={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE7D8] text-[#2A1D13] flex flex-col selection:bg-[#8B5A2B] selection:text-white">
      {/* Top Navigation Header for Dashboard */}
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        healthData={healthData} 
      />

      {/* Main Dashboard Console with Light Wood Theme */}
      <main className="flex-1 bg-[#EFE7D8]">
        <DashboardConsole 
          metricsData={metricsData}
          healthData={healthData}
          onBackToLanding={() => setCurrentView('landing')}
        />
      </main>

      {/* Footer in Light Wood Theme */}
      <footer className="border-t border-[#DDD2BF] bg-[#E8DECE] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#6B5744] shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#2A1D13]">FraudSentinel Enterprise</span>
            <span>•</span>
            <span>IEEE-CIS Fraud Detection Benchmark</span>
            <span>•</span>
            <span>Sub-20ms Real-Time Inference</span>
          </div>
          <div className="flex items-center gap-4 text-[#5C4836]">
            <span>LightGBM Cost-Weighted Objective</span>
            <span>•</span>
            <span>EMV 3DS 2.0 Liability Shift</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
