import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  ShieldAlert, 
  User, 
  Calendar, 
  Upload, 
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Heart
} from 'lucide-react';
import { DocumentVerification } from '../types/admissions';
import { TEST_DOCUMENTS_SPEC } from '../data/initialData';

interface DocumentAuditCenterProps {
  documents: DocumentVerification[];
  onRefreshData: () => void;
}

export const DocumentAuditCenter: React.FC<DocumentAuditCenterProps> = ({ documents, onRefreshData }) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OK' | 'PROBLEM'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentVerification | null>(null);

  const filteredDocs = documents.filter(d => {
    const matchesFilter = filterStatus === 'ALL' || d.status === filterStatus;
    const matchesSearch = 
      d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleQuickUploadTestDoc = async (specCode: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/documents/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docCode: specCode })
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Error verifying document:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStaffOverride = async (docId: string, newStatus: 'OK' | 'PROBLEM') => {
    try {
      const res = await fetch(`/api/documents/${docId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          overrideReason: newStatus === 'OK' ? 'Manually approved by Senior Counselor after sponsor verification.' : 'Staff flagged for re-issue.'
        })
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Error overriding status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Audit Triggers */}
      <div className="arch-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <span>Automated Verification</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Name Discrepancy & Expiry Validation</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-600 font-medium">Embassy Compliant</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              Document Audit & Credential Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Every applicant document is cross-checked against passport validity thresholds, name spelling continuity across transcripts, and institutional accreditation before counselor submission.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1">Audit Tests:</span>
            {TEST_DOCUMENTS_SPEC.map(spec => (
              <button
                key={spec.id}
                onClick={() => handleQuickUploadTestDoc(spec.code)}
                disabled={isVerifying}
                className="btn-secondary px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                title={`Audit ${spec.title}`}
              >
                <Upload className="w-3 h-3 text-slate-500" />
                <span>{spec.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, reason, or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === 'ALL' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setFilterStatus('OK')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === 'OK' 
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified ({documents.filter(d => d.status === 'OK').length})
            </button>
            <button
              onClick={() => setFilterStatus('PROBLEM')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === 'PROBLEM' 
                  ? 'bg-white text-rose-700 shadow-xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flagged ({documents.filter(d => d.status === 'PROBLEM').length})
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDocs.map((doc) => {
          const isProblem = doc.status === 'PROBLEM';

          return (
            <div
              key={doc.id}
              className={`arch-card rounded-xl p-5 ${
                isProblem ? 'border-rose-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isProblem ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isProblem ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : <FileCheck2 className="w-4 h-4 text-slate-700" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{doc.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student: <strong className="text-slate-700 font-medium">{doc.studentName}</strong> · Type: {doc.documentType}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                    isProblem
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isProblem ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  {doc.status}
                </span>
              </div>

              {/* Status Reason Box */}
              <div
                className={`mt-3.5 p-3 rounded-lg border text-xs ${
                  isProblem ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="font-medium text-slate-500 mb-0.5">Audit Assessment:</div>
                <div className="text-xs font-mono">{doc.reason}</div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400">Name on File:</span>{' '}
                  <strong className={doc.nameOnDoc !== doc.studentName ? 'text-rose-600' : 'text-slate-800'}>
                    {doc.nameOnDoc}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Details:</span>{' '}
                  <strong className="text-slate-800">{doc.details}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Auditor:</span>{' '}
                  <span className="text-slate-700">{doc.verifiedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span>{' '}
                  <span className="text-slate-700 font-mono tabular-nums">{new Date(doc.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Document Text Snippet */}
              {doc.previewText && (
                <div className="mt-3">
                  <div className="text-[11px] font-medium text-slate-500 mb-1">
                    OCR Excerpt:
                  </div>
                  <pre className="bg-slate-50 text-slate-800 p-2.5 rounded-lg text-[11px] font-mono whitespace-pre-wrap border border-slate-200">
                    {doc.previewText}
                  </pre>
                </div>
              )}

              {/* Staff Action Footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-xs">Counselor Override:</span>
                <div className="flex items-center gap-2">
                  {isProblem ? (
                    <button
                      onClick={() => handleStaffOverride(doc.id, 'OK')}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium transition-colors"
                    >
                      Override to OK
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStaffOverride(doc.id, 'PROBLEM')}
                      className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium transition-colors"
                    >
                      Flag Problem
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
