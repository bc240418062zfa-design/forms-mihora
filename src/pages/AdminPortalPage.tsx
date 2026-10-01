import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getStoredToken } from '../services/api';
import { Candidate, AdminMetrics, AuditLog } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import {
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Shield,
  ArrowUpDown,
  RefreshCw,
  Eye,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Radio,
  FileSpreadsheet,
  FileCode,
  X,
} from 'lucide-react';

export const AdminPortalPage: React.FC = () => {
  const { user } = useAuth();

  // Metrics
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Candidates Table State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSeniority, setFilterSeniority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinCompletion, setFilterMinCompletion] = useState<string>('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Detail Modal
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Audit Logs Modal
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  // Real-Time Notification Banner
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initial load
  useEffect(() => {
    loadMetrics();
    loadCandidates();
    initRealtimeSse();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Reload candidates on filter/pagination changes
  useEffect(() => {
    loadCandidates();
  }, [page, pageSize, sortBy, sortOrder, filterRole, filterSeniority, filterStatus, filterMinCompletion]);

  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const data = await api.getAdminMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const loadCandidates = async () => {
    setIsTableLoading(true);
    try {
      const res = await api.getAdminCandidates({
        page,
        pageSize,
        search,
        role: filterRole || undefined,
        seniority: filterSeniority || undefined,
        status: filterStatus || undefined,
        minCompletion: filterMinCompletion ? parseInt(filterMinCompletion, 10) : undefined,
        sortBy,
        sortOrder,
      });

      setCandidates(res.candidates);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setIsTableLoading(false);
    }
  };

  const initRealtimeSse = () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const sseUrl = `/api/realtime/admin-stream?token=${encodeURIComponent(token)}`;
      const sse = new EventSource(sseUrl);
      eventSourceRef.current = sse;

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CANDIDATE_REGISTERED') {
            setRealtimeNotification(`Real-Time: New candidate registered (${data.referenceCode})`);
            loadMetrics();
            loadCandidates();
          } else if (data.type === 'PROFILE_UPDATED') {
            setRealtimeNotification(`Real-Time: Profile updated for ${data.name} (${data.referenceCode})`);
            loadMetrics();
            loadCandidates();
          }
        } catch {
          // ignore non-json pings
        }
      };

      sse.onerror = () => {
        // SSE auto-reconnects natively
      };
    } catch (err) {
      console.error('SSE initialization error:', err);
    }
  };

  const openCandidateDetail = async (candidateId: number) => {
    setSelectedCandidateId(candidateId);
    setIsDetailLoading(true);
    setSelectedCandidateDetail(null);
    try {
      const res = await api.getAdminCandidateDetail(candidateId);
      setSelectedCandidateDetail(res);
    } catch (err) {
      console.error('Failed to fetch candidate details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openAuditLogsModal = async () => {
    setShowAuditLogs(true);
    setAuditLogsLoading(true);
    try {
      const res = await api.getAdminAuditLogs();
      setAuditLogs(res.logs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCandidates();
  };

  const resetFilters = () => {
    setSearch('');
    setFilterRole('');
    setFilterSeniority('');
    setFilterStatus('');
    setFilterMinCompletion('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Real-Time Live Notification Banner */}
      {realtimeNotification && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="font-semibold">{realtimeNotification}</span>
          </div>
          <button
            onClick={() => setRealtimeNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>MIHORA ADMINISTRATIVE CONSOLE</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live SSE Sync Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Candidate Profiles &amp; Engineering Registry
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time PostgreSQL candidate data collection, verified credentials, and export services.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openAuditLogsModal}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Audit Logs
          </button>

          <a
            href={api.getExportCsvUrl()}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </a>

          <a
            href={api.getExportJsonUrl()}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            Export JSON
          </a>

          <button
            onClick={() => {
              loadMetrics();
              loadCandidates();
            }}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real Metric Cards — Zero fake numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Total Registered Candidates</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {metricsLoading ? '...' : metrics?.totalCandidates ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">PostgreSQL unique candidate records</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Complete Profiles (≥80%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
            {metricsLoading ? '...' : metrics?.completedProfiles ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Full dossiers with verified skills</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Profiles In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 tabular-nums">
            {metricsLoading ? '...' : metrics?.inProgressProfiles ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Partially saved candidate accounts</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Ready for Deployment</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-700 tabular-nums">
            {metricsLoading ? '...' : metrics?.readyForDeployment ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Willing to deploy on-site</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, email, city, ref..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </form>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                showFilterDrawer || filterRole || filterSeniority || filterStatus || filterMinCompletion
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="updated_at">Sort: Last Updated</option>
              <option value="created_at">Sort: Created Date</option>
              <option value="completion_percentage">Sort: Completeness</option>
              <option value="experience">Sort: Years Experience</option>
              <option value="name">Sort: Name</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              title={`Toggle sort order (Current: ${sortOrder})`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Tray */}
        {showFilterDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role Title</label>
              <input
                type="text"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                placeholder="e.g. Civil, Software"
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Seniority Level</label>
              <select
                value={filterSeniority}
                onChange={(e) => setFilterSeniority(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
              >
                <option value="">All Levels</option>
                <option value="Intern">Intern</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Principal">Principal</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Availability Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="currently_available">Currently Available</option>
                <option value="employed">Employed</option>
                <option value="serving_notice">Serving Notice</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {isTableLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono">Querying PostgreSQL candidate records...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Candidate Profiles Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || filterRole || filterSeniority
                ? 'No candidate profiles matched your filter criteria. Try adjusting the search parameters.'
                : 'No candidate profiles have registered in the database yet. Candidates who sign up will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Role &amp; Seniority</th>
                  <th className="py-3 px-4">City / Region</th>
                  <th className="py-3 px-4 text-right">Experience</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-center">Completeness</th>
                  <th className="py-3 px-4 text-center">Deployment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {candidates.map((cand) => {
                  const nameStr = `${cand.first_name || ''} ${cand.last_name || ''}`.trim() || 'Candidate Name';

                  return (
                    <tr
                      key={cand.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => openCandidateDetail(cand.id)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {cand.reference_code}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{nameStr}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                          {cand.email}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {cand.primary_role || 'Not specified'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cand.seniority_level || 'Mid-Level'}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800">{cand.current_city || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{cand.current_country || ''}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        {cand.total_experience_years !== null ? `${cand.total_experience_years} yrs` : '—'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="capitalize text-slate-700">
                          {cand.employment_status?.replace(/_/g, ' ') || 'Available'}
                        </span>
                        {cand.notice_period_days ? (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {cand.notice_period_days}d notice
                          </div>
                        ) : null}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono tabular-nums font-bold">
                          <span
                            className={
                              cand.completion_percentage >= 80
                                ? 'text-emerald-700'
                                : cand.completion_percentage >= 50
                                ? 'text-amber-700'
                                : 'text-slate-500'
                            }
                          >
                            {cand.completion_percentage}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            cand.willing_onsite_deployment
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-slate-500 bg-slate-100'
                          }`}
                        >
                          {cand.willing_onsite_deployment ? 'On-Site' : 'Remote'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openCandidateDetail(cand.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {!isTableLoading && candidates.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(page * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{totalCount}</span> candidates
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs">
                Page {page} of {totalPages || 1}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Dossier Detail Drawer/Modal */}
      {selectedCandidateId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedCandidateId(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {isDetailLoading || !selectedCandidateDetail ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading complete dossier...</p>
              </div>
            ) : (
              <div>
                {/* Dossier Header */}
                <div className="border-b border-slate-200 pb-5 mb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedCandidateDetail.candidate.reference_code}
                    </span>
                    <span>·</span>
                    <span>Account: {selectedCandidateDetail.candidate.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedCandidateDetail.candidate.first_name}{' '}
                        {selectedCandidateDetail.candidate.last_name}
                      </h2>
                      <div className="text-sm font-semibold text-blue-600 mt-0.5">
                        {selectedCandidateDetail.candidate.primary_role || 'Engineering Candidate'} ·{' '}
                        {selectedCandidateDetail.candidate.seniority_level || 'Mid-Level'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          generateCandidatePdf(
                            selectedCandidateDetail.candidate,
                            selectedCandidateDetail.experiences,
                            selectedCandidateDetail.education,
                            selectedCandidateDetail.skills
                          )
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        Download PDF Dossier
                      </button>
                    </div>
                  </div>
                </div>

                {/* Structured Dossier Sections */}
                <div className="space-y-6 text-xs text-slate-700">
                  {/* Summary */}
                  {selectedCandidateDetail.candidate.professional_summary && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Professional Summary
                      </h3>
                      <p className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                        {selectedCandidateDetail.candidate.professional_summary}
                      </p>
                    </div>
                  )}

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-400 block">Total Experience</span>
                      <span className="font-bold text-slate-800">
                        {selectedCandidateDetail.candidate.total_experience_years ?? 0} Years
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-400 block">Expected Remuneration</span>
                      <span className="font-bold text-slate-800">
                        {selectedCandidateDetail.candidate.expected_compensation_amount
                          ? `${selectedCandidateDetail.candidate.expected_compensation_amount.toLocaleString()} ${selectedCandidateDetail.candidate.compensation_currency}`
                          : 'Not specified'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-400 block">Notice Period</span>
                      <span className="font-bold text-slate-800">
                        {selectedCandidateDetail.candidate.notice_period_days ?? 0} Days
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-400 block">Deployment Willingness</span>
                      <span className="font-bold text-slate-800">
                        {selectedCandidateDetail.candidate.willing_onsite_deployment ? 'On-Site Willing' : 'Remote Only'}
                      </span>
                    </div>
                  </div>

                  {/* Commute & Accommodation Requirements */}
                  <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Deployment, Commute &amp; Accommodation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Max Commute:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCandidateDetail.candidate.max_commute_distance_km
                            ? `${selectedCandidateDetail.candidate.max_commute_distance_km} km`
                            : 'Flexible'}{' '}
                          ·{' '}
                          {selectedCandidateDetail.candidate.max_commute_time_minutes
                            ? `${selectedCandidateDetail.candidate.max_commute_time_minutes} mins`
                            : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Accommodation Status:</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {selectedCandidateDetail.candidate.accommodation_status?.replace(/_/g, ' ')}
                          {selectedCandidateDetail.candidate.accommodation_beyond_km
                            ? ` (Beyond ${selectedCandidateDetail.candidate.accommodation_beyond_km} km)`
                            : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Transportation:</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {selectedCandidateDetail.candidate.transportation_status?.replace(/_/g, ' ') || 'None specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Career Experience History */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Work Experience Records ({selectedCandidateDetail.experiences?.length || 0})
                    </h3>
                    {selectedCandidateDetail.experiences?.length === 0 ? (
                      <p className="text-slate-400 italic">No experience records attached.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCandidateDetail.experiences.map((exp: any) => (
                          <div key={exp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-slate-900">{exp.job_title}</span>
                                <span className="text-blue-600 ml-2 font-medium">· {exp.company_name}</span>
                              </div>
                              <span className="font-mono text-slate-500">
                                {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                              </span>
                            </div>
                            {exp.responsibilities && <p className="text-slate-600 mt-1">{exp.responsibilities}</p>}
                            {exp.technologies && (
                              <div className="text-[11px] text-slate-500 mt-1">
                                <span className="font-semibold">Tools:</span> {exp.technologies}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Academic Background ({selectedCandidateDetail.education?.length || 0})
                    </h3>
                    {selectedCandidateDetail.education?.length === 0 ? (
                      <p className="text-slate-400 italic">No education records attached.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCandidateDetail.education.map((edu: any) => (
                          <div key={edu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                            <div>
                              <div className="font-bold text-slate-900">{edu.qualification}</div>
                              <div className="text-blue-600">{edu.institution} {edu.country && `· ${edu.country}`}</div>
                            </div>
                            <div className="font-mono text-slate-500">
                              {edu.start_year} — {edu.completion_year || 'Present'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skills Grid */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Technical &amp; Domain Skills ({selectedCandidateDetail.skills?.length || 0})
                    </h3>
                    {selectedCandidateDetail.skills?.length === 0 ? (
                      <p className="text-slate-400 italic">No skills listed.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidateDetail.skills.map((s: any) => (
                          <div
                            key={s.id}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-800 font-medium shadow-2xs"
                          >
                            <span>{s.skill_name}</span>
                            <span className="text-[11px] text-blue-600 ml-1.5 font-mono">
                              ({s.proficiency_level}, {s.years_of_experience} yrs)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Audit Logs Modal */}
      {showAuditLogs && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAuditLogs(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-1">Administrative Audit Logs</h2>
            <p className="text-xs text-slate-500 mb-4">
              Immutable PostgreSQL audit trail of candidate registrations, profile edits, and document exports.
            </p>

            {auditLogsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading audit history...</div>
            ) : auditLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No audit events recorded yet.</div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-slate-900">{log.action}</div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Actor: <span className="font-mono text-slate-800">{log.actor_email || 'System'}</span> (
                      {log.actor_role || 'ANONYMOUS'})
                    </div>
                    {log.metadata && (
                      <div className="mt-1 font-mono text-[11px] text-slate-500 bg-white p-1.5 rounded border border-slate-200 truncate">
                        {log.metadata}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
