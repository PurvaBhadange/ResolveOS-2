'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, ShieldAlert, Zap } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { CustomerHelpCenter } from '../components/CustomerHelpCenter';
import { OrdersView } from '../components/OrdersView';
import { CaseDetailsView } from '../components/CaseDetailsView';
import { OperationsDashboard } from '../components/OperationsDashboard';
import { AgentTraceInspector } from '../components/AgentTraceInspector';
import { SignInModal } from '../components/SignInModal';

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>('help');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(1); // Sarah Jenkins Demo
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('ORD-2026-8801');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  const userRole = (session?.user as any)?.role || (session ? 'operations' : 'customer');
  const isStaff = ['operations', 'admin', 'support_agent'].includes(userRole);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'help' && (
          <CustomerHelpCenter
            onCaseCreated={(caseId) => setSelectedCaseId(caseId)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            onSelectOrder={(orderNum) => setSelectedOrderNumber(orderNum)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'cases' && (
          <CaseDetailsView
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => setSelectedCaseId(id)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'ops' && (
          isStaff ? (
            <OperationsDashboard />
          ) : (
            <div className="p-8 sm:p-12 bg-canvas-soft rounded-md text-center border border-[#e8e2d8] shadow-soft-card max-w-xl mx-auto space-y-5 my-12">
              <div className="w-12 h-12 rounded-md bg-[#efe8df] text-primary flex items-center justify-center mx-auto border border-mute/60">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="eyebrow-uppercase text-body-mid">Restricted Console</span>
                <h2 className="text-2xl font-bold text-ink tracking-tight">Staff Authentication Required</h2>
                <p className="text-body text-sm leading-relaxed max-w-md mx-auto">
                  The Operations Dashboard & Judge Console is restricted to internal Operations Leads and Admin Supervisors.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm"
                >
                  <Zap className="w-4 h-4" />
                  Sign In as Operations Lead
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'trace' && (
          isStaff ? (
            <AgentTraceInspector selectedCaseId={selectedCaseId} />
          ) : (
            <div className="p-8 sm:p-12 bg-canvas-soft rounded-md text-center border border-[#e8e2d8] shadow-soft-card max-w-xl mx-auto space-y-5 my-12">
              <div className="w-12 h-12 rounded-md bg-[#efe8df] text-primary flex items-center justify-center mx-auto border border-mute/60">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="eyebrow-uppercase text-body-mid">Agent Audit</span>
                <h2 className="text-2xl font-bold text-ink tracking-tight">Agent Trace Inspector Restricted</h2>
                <p className="text-body text-sm leading-relaxed max-w-md mx-auto">
                  The Agent Trace Graph contains internal decision payloads and enterprise policy audit logs. Staff credentials required.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm"
                >
                  Staff Sign In
                </button>
              </div>
            </div>
          )
        )}
      </main>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />

      {/* Footer matching DESIGN.md footer specification */}
      <footer className="bg-ink text-canvas-soft border-t border-ink-soft py-10 sm:py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center text-canvas">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-canvas">
              Resolve<span className="text-primary">OS</span>
            </span>
          </div>
          <p className="text-xs text-body-mid max-w-lg mx-auto leading-relaxed">
            Autonomous Customer Resolution Platform • Powered by LangGraph, Mistral AI, FastAPI & Neon PostgreSQL.
          </p>
          <div className="text-[11px] text-mute pt-2 border-t border-ink-mid/40 max-w-md mx-auto">
            Engineered with verifiable idempotency, deterministic policy guards, and autonomous adaptation.
          </div>
        </div>
      </footer>
    </div>
  );
}
