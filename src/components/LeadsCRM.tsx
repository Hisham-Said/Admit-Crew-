import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  GraduationCap, 
  FileCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Heart
} from 'lucide-react';
import { StudentLead } from '../types/admissions';

interface LeadsCRMProps {
  leads: StudentLead[];
  onRefreshData: () => void;
  onOpenChatWithLead?: (phone: string) => void;
}

export const LeadsCRM: React.FC<LeadsCRMProps> = ({ leads, onRefreshData, onOpenChatWithLead }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    country: 'UK',
    marks: '80%',
    ielts: '6.5',
    budget: '£30,000 / year',
    notes: ''
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const filteredLeads = leads.filter(l => {
    const matchesCountry = filterCountry === 'ALL' || l.country.toUpperCase() === filterCountry.toUpperCase();
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.marks.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadForm)
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackMessage(data.message);
        setIsAddModalOpen(false);
        setNewLeadForm({
          name: '',
          phone: '',
          country: 'UK',
          marks: '80%',
          ielts: '6.5',
          budget: '£30,000 / year',
          notes: ''
        });
        onRefreshData();
      }
    } catch (err) {
      console.error('Error saving lead:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Deduplication Guarantee */}
      <div className="arch-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <span>Deduplication Protocol</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Phone Primary Key</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Instant Profile Merge</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Student Intake & Leads CRM
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            All student leads captured through live chat are indexed by verified phone number. Returning students are merged into their existing file without duplicate pipeline entries.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start md:self-center btn-primary text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manual Lead Intake</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, or score..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 shadow-xs transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 px-2 shrink-0 font-medium">Country:</span>
          {['ALL', 'UK', 'CANADA', 'GERMANY', 'AUSTRALIA'].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCountry(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 whitespace-nowrap transition-colors ${
                filterCountry === c 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="arch-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name & Contact</th>
                <th className="py-3 px-4 font-semibold">Destination</th>
                <th className="py-3 px-4 font-semibold">Academic Marks</th>
                <th className="py-3 px-4 font-semibold">IELTS Score</th>
                <th className="py-3 px-4 font-semibold">Last Contact</th>
                <th className="py-3 px-4 font-semibold">Pipeline State</th>
                <th className="py-3 px-4 font-semibold">Counselor Notes</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const isQuiet = lead.lastReplyDaysAgo >= 2 || lead.status === 'quiet';

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5 tabular-nums">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {lead.country}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 tabular-nums">{lead.marks}</td>
                    <td className="py-3.5 px-4 font-mono font-medium tabular-nums">
                      <span className={lead.ielts.includes('Not') ? 'text-amber-700' : 'text-slate-800'}>
                        {lead.ielts}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className={`w-3 h-3 ${isQuiet ? 'text-amber-600' : 'text-slate-400'}`} />
                        <span className={isQuiet ? 'font-medium text-amber-800' : ''}>{lead.lastReply}</span>
                      </div>
                      {isQuiet && (
                        <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                          Follow-up Due ({lead.lastReplyDaysAgo}d quiet)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-medium capitalize text-xs ${
                        lead.status === 'active'
                          ? 'text-emerald-700'
                          : lead.status === 'quiet'
                          ? 'text-amber-700'
                          : 'text-blue-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          lead.status === 'active' ? 'bg-emerald-500' : lead.status === 'quiet' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-xs">
                      {lead.notes || 'Registered through AdmitCrew intake.'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {onOpenChatWithLead && (
                        <button
                          onClick={() => onOpenChatWithLead(lead.phone)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                        >
                          View Thread
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Intake New Student Lead</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Enter lead attributes. If the phone number already exists, the record will update rather than create a duplicate.
            </p>

            <form onSubmit={handleSaveLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Student Full Name:</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Bilal Tariq"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number (Deduplication Key):</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="e.g. 0301 2345678 or 0300 1122334"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Destination:</label>
                  <select
                    value={newLeadForm.country}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Marks (%):</label>
                  <input
                    type="text"
                    value={newLeadForm.marks}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, marks: e.target.value })}
                    placeholder="e.g. 78%"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">IELTS Score:</label>
                  <input
                    type="text"
                    value={newLeadForm.ielts}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, ielts: e.target.value })}
                    placeholder="e.g. 6.5 or Not taken yet"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Annual Budget:</label>
                  <input
                    type="text"
                    value={newLeadForm.budget}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                    placeholder="e.g. £25,000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Counselor Notes:</label>
                <textarea
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="e.g. Inquired about CS and Engineering pathways."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-lg text-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
