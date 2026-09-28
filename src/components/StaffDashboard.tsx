import React, { useState } from 'react';
import { 
  Users, 
  FileCheck2, 
  BellRing, 
  GraduationCap, 
  MessageSquare, 
  AlertCircle, 
  CheckSquare2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Heart
} from 'lucide-react';
import { StudentLead, DocumentVerification, FollowUpDraft, StaffEscalation, UniversityProgram, AppUser } from '../types/admissions';
import { LeadsCRM } from './LeadsCRM';
import { ApprovalQueue } from './ApprovalQueue';
import { DocumentAuditCenter } from './DocumentAuditCenter';
import { UniversityCatalog } from './UniversityCatalog';
import { EscalationQueue } from './EscalationQueue';
import { ChatAuditViewer } from './ChatAuditViewer';
import { AutomatedTestRunner } from './AutomatedTestRunner';

interface StaffDashboardProps {
  leads: StudentLead[];
  documents: DocumentVerification[];
  drafts: FollowUpDraft[];
  escalations: StaffEscalation[];
  programs: UniversityProgram[];
  onRefreshData: () => void;
  initialTab?: string;
  currentUser?: AppUser | null;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  leads,
  documents,
  drafts,
  escalations,
  programs,
  onRefreshData,
  initialTab = 'leads',
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedLeadPhoneForChat, setSelectedLeadPhoneForChat] = useState<string | undefined>(undefined);

  const pendingApprovalsCount = drafts.filter(d => d.status === 'pending_approval').length;
  const problemDocsCount = documents.filter(d => d.status === 'PROBLEM').length;
  const pendingEscalationsCount = escalations.filter(e => e.status === 'pending').length;

  const handleOpenChat = (phone: string) => {
    setSelectedLeadPhoneForChat(phone);
    setActiveTab('chats');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Office Command Header */}
      <div className="arch-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
              <span>Counselor Command</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Nowshera Advisory Operations</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-600 font-medium">24/7 Multi-Agent Intake</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Admissions Command & Pipeline
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Supervise AI intake agents, inspect document audit verdicts, authorize human follow-up dispatches, and answer non-partner university escalations.
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">{leads.length}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Total Leads</div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <div className="text-xl font-bold font-mono tabular-nums text-amber-700">{pendingApprovalsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Approvals Due</div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <div className="text-xl font-bold font-mono tabular-nums text-rose-600">{problemDocsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Flagged Docs</div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <div className="text-xl font-bold font-mono tabular-nums text-blue-700">{pendingEscalationsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Escalations</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-6 pt-5 border-t border-slate-200 text-xs font-medium overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'leads'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Leads CRM ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approval')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'approval'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Approval Queue</span>
            {pendingApprovalsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                activeTab === 'approval' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'documents'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Document Audit ({documents.length})</span>
            {problemDocsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                activeTab === 'documents' ? 'bg-rose-400 text-slate-950 font-bold' : 'bg-rose-100 text-rose-800'
              }`}>
                {problemDocsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'chats'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Auditor</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Catalog ({programs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('escalations')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'escalations'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Escalations ({pendingEscalationsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 whitespace-nowrap ml-auto transition-colors ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white'
                : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <CheckSquare2 className="w-3.5 h-3.5" />
            <span>7-Test Verification Suite</span>
          </button>
        </div>
      </div>

      {/* Main Tab View Content */}
      <div className="transition-all">
        {activeTab === 'leads' && (
          <LeadsCRM leads={leads} onRefreshData={onRefreshData} onOpenChatWithLead={handleOpenChat} />
        )}

        {activeTab === 'approval' && (
          <ApprovalQueue
            drafts={drafts}
            onRefreshData={onRefreshData}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentAuditCenter
            documents={documents}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'chats' && (
          <ChatAuditViewer
            leads={leads}
            initialPhone={selectedLeadPhoneForChat}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'catalog' && (
          <UniversityCatalog programs={programs} />
        )}

        {activeTab === 'escalations' && (
          <EscalationQueue
            escalations={escalations}
            onRefreshData={onRefreshData}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'tests' && (
          <AutomatedTestRunner
            leads={leads}
            documents={documents}
            drafts={drafts}
            escalations={escalations}
            onRefreshData={onRefreshData}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </div>
    </div>
  );
};
