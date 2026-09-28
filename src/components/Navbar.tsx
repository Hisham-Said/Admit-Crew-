import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bot, 
  ShieldCheck, 
  FileCheck2, 
  RotateCcw, 
  Users, 
  MessageSquareText, 
  LogIn,
  UserCheck,
  LogOut,
  ChevronDown,
  Database,
  Sparkles,
  Heart
} from 'lucide-react';
import { AppUser } from '../types/admissions';
import { SqliteStatusModal } from './SqliteStatusModal';

interface NavbarProps {
  currentView: 'student' | 'staff';
  onViewChange: (view: 'student' | 'staff') => void;
  pendingApprovalsCount: number;
  openEscalationsCount: number;
  onResetData: () => void;
  isResetting: boolean;
  currentUser: AppUser | null;
  onOpenAuth: (mode?: 'login' | 'signup', role?: 'student' | 'staff') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  pendingApprovalsCount,
  openEscalationsCount,
  onResetData,
  isResetting,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [isSqliteModalOpen, setIsSqliteModalOpen] = useState<boolean>(false);
  const isStaff = currentUser?.role === 'staff';

  const handleStaffViewClick = () => {
    if (!currentUser) {
      onOpenAuth('login', 'staff');
      return;
    }
    if (currentUser.role === 'student') {
      onOpenAuth('login', 'staff');
      return;
    }
    onViewChange('staff');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Zone 1: Clean Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-slate-950">
                  AdmitCrew
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">/</span>
                <span className="hidden sm:inline text-xs font-medium text-slate-500">
                  Admissions Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: View Navigation & Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              onClick={() => onViewChange('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Student Advisory</span>
            </button>

            <button
              onClick={handleStaffViewClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'staff'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={!isStaff ? 'Requires Counselor Staff login' : 'Staff Command CRM'}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Counselor HQ</span>
              {(pendingApprovalsCount > 0 || openEscalationsCount > 0) && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums bg-amber-100 text-amber-900 font-semibold">
                  {pendingApprovalsCount + openEscalationsCount}
                </span>
              )}
            </button>
          </div>

          {/* Zone 3: Actions & Profile */}
          <div className="flex items-center gap-2">
            {/* Database inspector */}
            <button
              onClick={() => setIsSqliteModalOpen(true)}
              title="Database status"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums">SQLite3</span>
            </button>

            {/* Reset data */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              title="Reset test data"
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>

            {/* Auth button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 text-xs hover:bg-slate-50 transition-colors"
                  title="Switch user account"
                >
                  <span className={`w-2 h-2 rounded-full ${currentUser.role === 'staff' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="font-medium text-slate-800 hidden sm:inline max-w-[90px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500 capitalize">
                    ({currentUser.role})
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SQLite3 Status Modal */}
      <SqliteStatusModal
        isOpen={isSqliteModalOpen}
        onClose={() => setIsSqliteModalOpen(false)}
      />
    </header>
  );
};
