import React, { useState } from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Edit3, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  User,
  Phone,
  Sparkles,
  Heart
} from 'lucide-react';
import { FollowUpDraft } from '../types/admissions';

interface ApprovalQueueProps {
  drafts: FollowUpDraft[];
  onRefreshData: () => void;
  currentUser?: any;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ drafts, onRefreshData, currentUser }) => {
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const pendingDrafts = drafts.filter(d => d.status === 'pending_approval');
  const pastDrafts = drafts.filter(d => d.status !== 'pending_approval');

  const handleStartEdit = (draft: FollowUpDraft) => {
    setEditingDraftId(draft.id);
    setEditedText(draft.message);
  };

  const handleScanLeads = async () => {
    setIsScanning(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/followups/scan', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActionFeedback(data.message);
        onRefreshData();
      }
    } catch (err) {
      console.error('Error scanning leads:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async (draftId: string, customMessage?: string) => {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/followups/${draftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editedMessage: customMessage || (editingDraftId === draftId ? editedText : undefined),
          staffName: currentUser?.name ? `${currentUser.name} (Counselor)` : 'Zahid Khan (Senior Counselor)'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActionFeedback(data.message);
        setEditingDraftId(null);
        onRefreshData();
      }
    } catch (err) {
      console.error('Error approving draft:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (draftId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/followups/${draftId}/reject`, { method: 'POST' });
      if (res.ok) {
        setActionFeedback('Draft discarded.');
        setEditingDraftId(null);
        onRefreshData();
      }
    } catch (err) {
      console.error('Error rejecting draft:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Office Policy Notice Banner */}
      <div className="arch-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
                <span>Human Guardrail Mandate</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Zero Autonomous Dispatch</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Audit Trail Enforced</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Follow-Up Reminder Authorization
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                The Reminder Agent identifies quiet applicants (e.g. students inactive for 2+ days) and drafts personalized follow-up messages. <strong>No message is ever dispatched without counselor approval.</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleScanLeads}
            disabled={isScanning}
            className="self-start md:self-center btn-primary px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Inactive Applicants'}</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Pending Approval Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Pending Authorization</h3>
            <span className="font-mono text-xs tabular-nums text-slate-500 font-medium">
              ({pendingDrafts.length} queue items)
            </span>
          </div>
          <span className="text-xs text-slate-500">Edit or authorize before dispatch</span>
        </div>

        {pendingDrafts.length === 0 ? (
          <div className="arch-card rounded-xl p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-slate-900 font-semibold text-sm">Approval Queue Clear</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No follow-up messages are waiting for review. Use "Scan Inactive Applicants" to check for newly quiet leads.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDrafts.map((draft) => {
              const isEditing = editingDraftId === draft.id;

              return (
                <div
                  key={draft.id}
                  className="arch-card rounded-xl p-5 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <h4 className="font-semibold text-slate-900 text-sm">{draft.studentName}</h4>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs font-mono text-slate-500 tabular-nums">
                          {draft.studentPhone}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-600 font-medium">
                          Target: {draft.targetCountry}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Trigger: {draft.reason}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium border border-amber-200 self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Pending Review
                    </span>
                  </div>

                  {/* Message Body or Editor */}
                  {isEditing ? (
                    <div className="space-y-2 mt-3">
                      <label className="text-xs font-medium text-slate-700">Edit Proposed Dispatch Message:</label>
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingDraftId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleApprove(draft.id, editedText)}
                          disabled={isProcessing}
                          className="btn-primary px-3.5 py-1.5 rounded-lg text-xs"
                        >
                          Save & Dispatch
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mt-2">
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">{draft.message}</p>
                    </div>
                  )}

                  {/* Actions Footer */}
                  {!isEditing && (
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        Drafted: {new Date(draft.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Dispatch pending
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(draft)}
                          className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleReject(draft.id)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-medium transition-colors"
                        >
                          <XCircle className="w-3 h-3 inline mr-1" />
                          <span>Discard</span>
                        </button>

                        <button
                          onClick={() => handleApprove(draft.id)}
                          disabled={isProcessing}
                          className="btn-accent px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorize & Dispatch</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Follow-ups / Sent Log */}
      {pastDrafts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Recently Dispatched Follow-Ups</h4>
          <div className="space-y-2">
            {pastDrafts.map((draft) => (
              <div
                key={draft.id}
                className="arch-card rounded-lg p-3 text-xs text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{draft.studentName}</span>
                    <span className="text-slate-400 font-mono tabular-nums">({draft.studentPhone})</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Dispatched Once
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-1 italic">"{draft.message}"</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono tabular-nums">
                  <div>Counselor: <span className="text-slate-700 font-sans font-medium">{draft.approvedBy || 'Staff'}</span></div>
                  <div>Sent: {draft.sentAt ? new Date(draft.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
