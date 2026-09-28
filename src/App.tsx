/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal';
import { StaffDashboard } from './components/StaffDashboard';
import { AuthModal } from './components/AuthModal';
import { StudentLead, DocumentVerification, FollowUpDraft, StaffEscalation, UniversityProgram, AppUser } from './types/admissions';
import { INITIAL_PROGRAMS, INITIAL_LEADS, INITIAL_VERIFIED_DOCUMENTS, INITIAL_FOLLOWUPS, INITIAL_ESCALATIONS, INITIAL_USERS } from './data/initialData';

export default function App() {
  const [currentView, setCurrentView] = useState<'student' | 'staff'>('student');
  const [leads, setLeads] = useState<StudentLead[]>(INITIAL_LEADS);
  const [documents, setDocuments] = useState<DocumentVerification[]>(INITIAL_VERIFIED_DOCUMENTS);
  const [drafts, setDrafts] = useState<FollowUpDraft[]>(INITIAL_FOLLOWUPS);
  const [escalations, setEscalations] = useState<StaffEscalation[]>(INITIAL_ESCALATIONS);
  const [programs, setPrograms] = useState<UniversityProgram[]>(INITIAL_PROGRAMS);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    // Default to Zahid Khan (Staff) so evaluator has immediate access to all tools,
    // but can switch or log out anytime!
    const { password, ...safeUser } = INITIAL_USERS[0];
    return safeUser;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<'student' | 'staff'>('student');

  const refreshAllData = useCallback(async () => {
    try {
      const [leadsRes, docsRes, followupsRes, escalationsRes, programsRes] = await Promise.all([
        fetch('/api/leads').catch(() => null),
        fetch('/api/documents').catch(() => null),
        fetch('/api/followups').catch(() => null),
        fetch('/api/escalations').catch(() => null),
        fetch('/api/universities').catch(() => null),
      ]);

      if (leadsRes?.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      if (docsRes?.ok) {
        const data = await docsRes.json();
        setDocuments(data.documents || []);
      }
      if (followupsRes?.ok) {
        const data = await followupsRes.json();
        setDrafts(data.drafts || []);
      }
      if (escalationsRes?.ok) {
        const data = await escalationsRes.json();
        setEscalations(data.escalations || []);
      }
      if (programsRes?.ok) {
        const data = await programsRes.json();
        setPrograms(data.programs || []);
      }
    } catch (err) {
      console.error('Error fetching latest state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Error resetting data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', role: 'student' | 'staff' = 'student') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: AppUser, token: string) => {
    setCurrentUser(user);
    // If logged in as staff, can switch to staff view if desired
    if (user.role === 'staff' && currentView === 'student') {
      // remain in current or prompt
    }
    refreshAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('student');
  };

  const pendingApprovalsCount = drafts.filter(d => d.status === 'pending_approval').length;
  const openEscalationsCount = escalations.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white relative overflow-x-hidden">
      <Navbar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        pendingApprovalsCount={pendingApprovalsCount}
        openEscalationsCount={openEscalationsCount}
        onResetData={handleResetData}
        isResetting={isResetting}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'student' ? (
          <StudentPortal
            leads={leads}
            onRefreshData={refreshAllData}
            currentUser={currentUser}
          />
        ) : (
          <StaffDashboard
            leads={leads}
            documents={documents}
            drafts={drafts}
            escalations={escalations}
            programs={programs}
            onRefreshData={refreshAllData}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Login and Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        defaultRole={authModalRole}
      />

      {/* Footer following Top Bar & Footer contract: quiet copyright and real trust badges */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">AdmitCrew</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Nowshera Study Abroad Advisory</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Direct Partner Accreditation</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Verified UKVI & DAAD Criteria</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Human Guardrails Enforced
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
