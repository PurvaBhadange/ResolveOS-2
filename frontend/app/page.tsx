'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, ShieldAlert } from 'lucide-react';
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
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(1); // Default to Case 1 (Sarah Jenkins Demo)
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('ORD-2026-8801');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  const userRole = (session?.user as any)?.role || (session ? 'operations' : 'customer');
  const isStaff = ['operations', 'admin', 'support_agent'].includes(userRole);

  return (
    <div className="min-h-screen flex flex-col bg-[#fffefb] text-[#201515]">
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
            <div className="p-12 bg-[#f8f4f0] rounded-[12px] text-center border border-[#c5c0b1] shadow-sm max-w-xl mx-auto space-y-4 my-12">
              <div className="w-12 h-12 rounded-[12px] bg-[#201515] text-[#fffefb] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#201515]">Staff Authentication Required</h2>
              <p className="text-[#605d52] text-sm leading-relaxed">
                The Operations Dashboard & Approval Console is restricted to internal Operations Leads and Admin Supervisors.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#ff4f00] hover:bg-[#e04500] text-[#fffefb] font-bold text-xs transition-all shadow-md"
              >
                Sign In as Operations Lead
              </button>
            </div>
          )
        )}

        {activeTab === 'trace' && (
          isStaff ? (
            <AgentTraceInspector selectedCaseId={selectedCaseId} />
          ) : (
            <div className="p-12 bg-[#f8f4f0] rounded-[12px] text-center border border-[#c5c0b1] shadow-sm max-w-xl mx-auto space-y-4 my-12">
              <div className="w-12 h-12 rounded-[12px] bg-[#201515] text-[#fffefb] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#201515]">Agent Inspector Restricted</h2>
              <p className="text-[#605d52] text-sm leading-relaxed">
                The Agent Trace Graph contains internal decision payloads and enterprise policy audit logs. Staff sign-in is required.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#ff4f00] hover:bg-[#e04500] text-[#fffefb] font-bold text-xs transition-all shadow-md"
              >
                Staff Sign In
              </button>
            </div>
          )
        )}
      </main>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />

      {/* Zapier-Inspired Dark Coffee Ink Footer */}
      <footer className="bg-[#201515] border-t border-[#36342e] py-8 mt-16 text-[#f8f4f0]">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[#c5c0b1] font-medium space-y-2">
          <p className="text-[#fffefb] font-bold">ResolveOS Autonomous Customer Resolution Engine</p>
          <p>Agentic AI Hackathon 2026 • Track 3: Smart Automation • IIT Bhubaneswar</p>
          <p className="text-[11px] text-[#939084] pt-2">Powered by LangGraph, Google Gemini, FastAPI, Next.js & Neon PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
