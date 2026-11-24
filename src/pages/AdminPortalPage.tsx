import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { api, getStoredToken } from '../services/api';
import { Candidate, AdminMetrics, AuditLog } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import { AnimatedNumber, BlankSheetLoader } from '../components/ui/MotionPrimitives';
import {
  Users,
  Clock,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Radio,
  FileSpreadsheet,
  FileCode,
  X,
} from 'lucide-react';

export const AdminPortalPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSeniority, setFilterSeniority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinCompletion, setFilterMinCompletion] = useState<string>('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  const [exportingFormat, setExportingFormat] = useState<'csv' | 'json' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const data = await api.getAdminMetrics();
      setMetrics(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load administrative metrics.');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const loadCandidates = useCallback(async () => {
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
    } catch (err: any) {
      setActionError(err.message || 'Failed to query candidate directory.');
    } finally {
      setIsTableLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    filterRole,
    filterSeniority,
    filterStatus,
    filterMinCompletion,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
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
            setRealtimeNotification(`New candidate registered · ${data.referenceCode}`);
            loadMetrics();
            loadCandidates();
          } else if (data.type === 'PROFILE_UPDATED') {
            setRealtimeNotification(`Profile updated · ${data.name} (${data.referenceCode})`);
            loadMetrics();
            loadCandidates();
          }
        } catch {
          // ignore ping frames
        }
      };
    } catch {
      // ignore SSE init errors
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [loadMetrics, loadCandidates]);

  useEffect(() => {
    if (!selectedCandidateId && !showAuditLogs) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCandidateId(null);
        setShowAuditLogs(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCandidateId, showAuditLogs]);

  const openCandidateDetail = async (candidateId: number) => {
    setSelectedCandidateId(candidateId);
    setIsDetailLoading(true);
    setSelectedCandidateDetail(null);
    setActionError(null);
    try {
      const res = await api.getAdminCandidateDetail(candidateId);
      setSelectedCandidateDetail(res);
    } catch (err: any) {
      setSelectedCandidateId(null);
      setActionError(err.message || 'Failed to retrieve candidate dossier.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openAuditLogsModal = async () => {
    setShowAuditLogs(true);
    setAuditLogsLoading(true);
    setActionError(null);
    try {
      const res = await api.getAdminAuditLogs();
      setAuditLogs(res.logs);
    } catch (err: any) {
      setShowAuditLogs(false);
      setActionError(err.message || 'Failed to retrieve audit logs.');
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (exportingFormat) return;
    setExportingFormat(format);
    setActionError(null);
    try {
      await api.downloadAdminExport(format);
    } catch (err: any) {
      setActionError(err.message || `Failed to export ${format.toUpperCase()}.`);
    } finally {
      setExportingFormat(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCandidates();
  };

  const handleColumnSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'name' ? 'ASC' : 'DESC');
    }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setFilterRole('');
    setFilterSeniority('');
    setFilterStatus('');
    setFilterMinCompletion('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    filterRole || filterSeniority || filterStatus || filterMinCompletion
  );

  const activeFilterChips: Array<{ key: string; label: string; onClear: () => void }> = [];
  if (search.trim()) {
    activeFilterChips.push({
      key: 'search',
      label: `Search: "${search.trim()}"`,
      onClear: () => {
        setSearch('');
        setPage(1);
      },
    });
  }
  if (filterRole.trim()) {
    activeFilterChips.push({
      key: 'role',
      label: `Role: ${filterRole.trim()}`,
      onClear: () => {
        setFilterRole('');
        setPage(1);
      },
    });
  }
  if (filterSeniority) {
    activeFilterChips.push({
      key: 'seniority',
      label: `Level: ${filterSeniority}`,
      onClear: () => {
        setFilterSeniority('');
        setPage(1);
      },
    });
  }
  if (filterStatus) {
    activeFilterChips.push({
      key: 'status',
      label: `Status: ${filterStatus.replace(/_/g, ' ')}`,
      onClear: () => {
        setFilterStatus('');
        setPage(1);
      },
    });
  }
  if (filterMinCompletion) {
    activeFilterChips.push({
      key: 'completion',
      label: `Score ≥ ${filterMinCompletion}%`,
      onClear: () => {
        setFilterMinCompletion('');
        setPage(1);
      },
    });
  }

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#143A7B] shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#143A7B] shrink-0" />
    );
  };

  const actionBtnClass =
    'px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-[#CBD5E1] rounded-lg hover:bg-[#FAF9F6] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto space-y-6">
          {actionError && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">{actionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-xs font-semibold hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {realtimeNotification && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{realtimeNotification}</span>
              </div>
              <button
                type="button"
                onClick={() => setRealtimeNotification(null)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Header Bar */}
          <section className="enterprise-card p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-slate-500 mb-1.5">
                  <span className="text-[#143A7B] uppercase tracking-wider">
                    Talent Administration
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 inline-flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Live Directory Sync</span>
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Candidate Profiles &amp; Engineering Registry
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage candidate applications, verified academic credentials, and executive exports.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button type="button" onClick={openAuditLogsModal} className={actionBtnClass}>
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Activity Log</span>
                </button>

                <button
                  type="button"
                  disabled={exportingFormat !== null}
                  onClick={() => handleExport('csv')}
                  className={actionBtnClass}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{exportingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
                </button>

                <button
                  type="button"
                  disabled={exportingFormat !== null}
                  onClick={() => handleExport('json')}
                  className={actionBtnClass}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#143A7B]" />
                  <span>{exportingFormat === 'json' ? 'Exporting...' : 'Export JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    loadMetrics();
                    loadCandidates();
                  }}
                  className="p-2 text-slate-600 bg-white border border-[#CBD5E1] rounded-lg hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors cursor-pointer"
                  title="Refresh candidate directory"
                  aria-label="Refresh candidate directory"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* 4-Column Hairline-Divided KPI Strip */}
          <section className="enterprise-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E4E2DA]">
            <div className="p-5 sm:p-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Registered Candidates
              </div>
              <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums mt-2">
                {metricsLoading ? '—' : <AnimatedNumber value={metrics?.totalCandidates ?? 0} />}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Active talent profiles
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Complete (≥80%)
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-700 tabular-nums mt-2">
                {metricsLoading ? '—' : <AnimatedNumber value={metrics?.completedProfiles ?? 0} />}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Verified dossiers ready
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                In Progress
              </div>
              <div className="text-3xl font-bold font-mono text-amber-700 tabular-nums mt-2">
                {metricsLoading ? (
                  '—'
                ) : (
                  <AnimatedNumber value={metrics?.inProgressProfiles ?? 0} />
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Partially completed drafts
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                On-Site Ready
              </div>
              <div className="text-3xl font-bold font-mono text-[#143A7B] tabular-nums mt-2">
                {metricsLoading ? (
                  '—'
                ) : (
                  <AnimatedNumber value={metrics?.readyForDeployment ?? 0} />
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Willing to deploy on-site
              </div>
            </div>
          </section>

          {/* Search & Filter Controls */}
          <section className="enterprise-card p-4 sm:p-5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, role, email, city, ref code..."
                  className="field-input field-input-icon text-sm py-2"
                />
              </form>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFilterDrawer((prev) => !prev)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    showFilterDrawer || hasActiveFilters
                      ? 'bg-[#143A7B] border-[#143A7B] text-white'
                      : 'bg-white border-[#CBD5E1] text-slate-700 hover:bg-[#FAF9F6] hover:text-slate-900'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters{hasActiveFilters ? ' (Active)' : ''}</span>
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Sort candidates by"
                  className="field-input w-auto py-2 px-3 text-xs font-medium"
                >
                  <option value="updated_at">Sort: Last Updated</option>
                  <option value="created_at">Sort: Created Date</option>
                  <option value="completion_percentage">Sort: Completeness</option>
                  <option value="experience">Sort: Experience</option>
                  <option value="name">Sort: Name</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                    setPage(1);
                  }}
                  className="p-2 text-slate-600 bg-white border border-[#CBD5E1] rounded-lg hover:bg-[#FAF9F6] hover:text-slate-900 cursor-pointer"
                  title={`Toggle sort order (${sortOrder})`}
                  aria-label={`Toggle sort order, currently ${sortOrder}`}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-[#E4E2DA] flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500 mr-1">Active:</span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onClear}
                    className="px-2.5 py-1 text-xs font-semibold text-[#143A7B] bg-[#EEF3FA] border border-[#143A7B]/20 rounded-md hover:bg-[#E1EAF7] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{chip.label}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-slate-600 hover:text-[#143A7B] ml-auto cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {showFilterDrawer && (
              <div className="mt-4 pt-4 border-t border-[#E4E2DA] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={filterRole}
                    onChange={(e) => {
                      setFilterRole(e.target.value);
                      setPage(1);
                    }}
                    placeholder="e.g. Civil, Software"
                    className="field-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Seniority Level
                  </label>
                  <select
                    value={filterSeniority}
                    onChange={(e) => {
                      setFilterSeniority(e.target.value);
                      setPage(1);
                    }}
                    className="field-input text-xs py-2"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Availability Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1);
                    }}
                    className="field-input text-xs py-2"
                  >
                    <option value="">All Statuses</option>
                    <option value="currently_available">Currently Available</option>
                    <option value="employed">Employed</option>
                    <option value="serving_notice">Serving Notice</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Min Completeness
                  </label>
                  <select
                    value={filterMinCompletion}
                    onChange={(e) => {
                      setFilterMinCompletion(e.target.value);
                      setPage(1);
                    }}
                    className="field-input text-xs py-2"
                  >
                    <option value="">Any Score</option>
                    <option value="80">≥ 80% (Complete)</option>
                    <option value="50">≥ 50%</option>
                    <option value="25">≥ 25%</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-[#FAF9F6] hover:bg-[#EFECE6] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Candidate Directory Table */}
          <section className="enterprise-card overflow-hidden">
            {isTableLoading ? (
              <div className="p-6" aria-busy="true">
                <BlankSheetLoader label="Loading candidate directory..." />
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-20 text-center px-4">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  No Candidate Profiles Found
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {search || hasActiveFilters
                    ? 'No candidate records matched your active filters. Try clearing or adjusting your query.'
                    : 'No candidate profiles have registered yet. New registrations appear here automatically.'}
                </p>
                {(search || hasActiveFilters) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#E4E2DA] text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Ref Code</th>
                      <th className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleColumnSort('name')}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <span>Candidate</span>
                          {renderSortIcon('name')}
                        </button>
                      </th>
                      <th className="py-3.5 px-4">Role &amp; Seniority</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleColumnSort('experience')}
                          className="inline-flex items-center justify-end gap-1.5 hover:text-slate-900 transition-colors cursor-pointer ml-auto"
                        >
                          <span>Exp</span>
                          {renderSortIcon('experience')}
                        </button>
                      </th>
                      <th className="py-3.5 px-4">Availability</th>
                      <th className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleColumnSort('completion_percentage')}
                          className="inline-flex items-center justify-end gap-1.5 hover:text-slate-900 transition-colors cursor-pointer ml-auto"
                        >
                          <span>Score</span>
                          {renderSortIcon('completion_percentage')}
                        </button>
                      </th>
                      <th className="py-3.5 px-4">Deployment</th>
                      <th className="py-3.5 px-4 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E2DA] text-sm text-slate-700">
                    {candidates.map((cand) => {
                      const nameStr =
                        `${cand.first_name || ''} ${cand.last_name || ''}`.trim() ||
                        'Unnamed Candidate';

                      return (
                        <tr
                          key={cand.id}
                          onClick={() => openCandidateDetail(cand.id)}
                          className="hover:bg-[#F7F6F2] transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#143A7B] whitespace-nowrap">
                            {cand.reference_code}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-display text-sm font-semibold text-slate-900">
                              {nameStr}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-[190px]">
                              {cand.email}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900">
                              {cand.primary_role || 'Not specified'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {cand.seniority_level || 'Mid-Level'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-slate-900">{cand.current_city || '—'}</div>
                            <div className="text-xs text-slate-500">
                              {cand.current_country || ''}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums whitespace-nowrap text-slate-900">
                            {cand.total_experience_years !== null
                              ? `${cand.total_experience_years}y`
                              : '—'}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="capitalize text-slate-800">
                              {cand.employment_status?.replace(/_/g, ' ') || 'Available'}
                            </span>
                            {cand.notice_period_days ? (
                              <div className="text-xs text-slate-500">
                                {cand.notice_period_days}d notice
                              </div>
                            ) : null}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums font-bold">
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
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={
                                cand.willing_onsite_deployment
                                  ? 'text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md'
                                  : 'text-xs text-slate-500'
                              }
                            >
                              {cand.willing_onsite_deployment ? 'On-Site' : 'Remote'}
                            </span>
                          </td>

                          <td
                            className="py-3.5 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => openCandidateDetail(cand.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!isTableLoading && candidates.length > 0 && (
              <div className="px-4 py-3.5 bg-[#FAF9F6] border-t border-[#E4E2DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  Showing{' '}
                  <span className="font-mono font-semibold text-slate-900">
                    {(page - 1) * pageSize + 1}
                  </span>
                  –
                  <span className="font-mono font-semibold text-slate-900">
                    {Math.min(page * pageSize, totalCount)}
                  </span>{' '}
                  of <span className="font-mono font-semibold text-slate-900">{totalCount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                    className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white text-slate-700 hover:bg-[#FAF9F6] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono text-xs px-2 text-slate-700">
                    Page {page} / {totalPages || 1}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                    className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white text-slate-700 hover:bg-[#FAF9F6] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Candidate Dossier Slide-Over Drawer */}
          <AnimatePresence>
            {selectedCandidateId && (
              <motion.div
                key="dossier-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                role="dialog"
                aria-modal="true"
                aria-label="Candidate Profile Summary"
                onClick={() => setSelectedCandidateId(null)}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end"
              >
                <motion.div
                  key="dossier-drawer-panel"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white text-slate-900 border-l border-[#E4E2DA] max-w-2xl w-full h-full overflow-y-auto shadow-2xl p-6 sm:p-8 relative"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCandidateId(null)}
                    aria-label="Close dossier drawer"
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {isDetailLoading || !selectedCandidateDetail ? (
                    <div className="py-12">
                      <BlankSheetLoader label="Loading candidate profile..." />
                    </div>
                  ) : (
                    <div>
                      <div className="border-b border-[#E4E2DA] pb-6 mb-6 pr-8">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-semibold text-[#143A7B] bg-[#EEF3FA] px-2 py-0.5 rounded-md">
                              {selectedCandidateDetail.candidate.reference_code}
                            </span>
                            <span>{selectedCandidateDetail.candidate.email}</span>
                          </div>

                          {selectedCandidateDetail.candidate.completion_percentage >= 80 ? (
                            <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                              Verified Ready
                            </span>
                          ) : (
                            <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                              Draft · {selectedCandidateDetail.candidate.completion_percentage}%
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
                          <div>
                            <h2 className="font-display text-2xl font-bold text-slate-900">
                              {selectedCandidateDetail.candidate.first_name}{' '}
                              {selectedCandidateDetail.candidate.last_name}
                            </h2>
                            <div className="text-sm font-medium text-slate-600 mt-0.5">
                              {selectedCandidateDetail.candidate.primary_role ||
                                'Engineering Candidate'}{' '}
                              · {selectedCandidateDetail.candidate.seniority_level || 'Mid-Level'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              generateCandidatePdf(
                                selectedCandidateDetail.candidate,
                                selectedCandidateDetail.experiences,
                                selectedCandidateDetail.education,
                                selectedCandidateDetail.skills
                              )
                            }
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF Dossier</span>
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-[#E4E2DA] text-sm text-slate-700">
                        {selectedCandidateDetail.candidate.professional_summary && (
                          <div className="pb-5">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              Professional Summary
                            </h3>
                            <p className="leading-relaxed text-slate-800">
                              {selectedCandidateDetail.candidate.professional_summary}
                            </p>
                          </div>
                        )}

                        <div className="py-5 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block">
                              Total Experience
                            </span>
                            <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                              {selectedCandidateDetail.candidate.total_experience_years ?? 0} Years
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">
                              Expected Remuneration
                            </span>
                            <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                              {selectedCandidateDetail.candidate.expected_compensation_amount
                                ? `${Number(
                                    selectedCandidateDetail.candidate.expected_compensation_amount
                                  ).toLocaleString()} ${
                                    selectedCandidateDetail.candidate.compensation_currency
                                  }`
                                : 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">
                              Notice Period
                            </span>
                            <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                              {selectedCandidateDetail.candidate.notice_period_days ?? 0} Days
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">
                              Deployment
                            </span>
                            <span className="font-semibold text-slate-900 mt-0.5 block">
                              {selectedCandidateDetail.candidate.willing_onsite_deployment
                                ? 'On-Site Willing'
                                : 'Remote Only'}
                            </span>
                          </div>
                        </div>

                        <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block">
                              Max Commute
                            </span>
                            <span className="font-mono text-xs font-semibold text-slate-900 mt-0.5 block">
                              {selectedCandidateDetail.candidate.max_commute_distance_km
                                ? `${selectedCandidateDetail.candidate.max_commute_distance_km} km`
                                : 'Flexible'}{' '}
                              ·{' '}
                              {selectedCandidateDetail.candidate.max_commute_time_minutes
                                ? `${selectedCandidateDetail.candidate.max_commute_time_minutes} mins`
                                : 'Any'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">
                              Accommodation
                            </span>
                            <span className="font-semibold text-slate-900 capitalize mt-0.5 block">
                              {selectedCandidateDetail.candidate.accommodation_status?.replace(
                                /_/g,
                                ' '
                              )}
                              {selectedCandidateDetail.candidate.accommodation_beyond_km
                                ? ` (Beyond ${selectedCandidateDetail.candidate.accommodation_beyond_km} km)`
                                : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">
                              Transportation
                            </span>
                            <span className="font-semibold text-slate-900 capitalize mt-0.5 block">
                              {selectedCandidateDetail.candidate.transportation_status?.replace(
                                /_/g,
                                ' '
                              ) || 'None specified'}
                            </span>
                          </div>
                        </div>

                        <div className="py-5">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Work Experience ({selectedCandidateDetail.experiences?.length || 0})
                          </h3>
                          {selectedCandidateDetail.experiences?.length === 0 ? (
                            <p className="text-slate-500">No experience records attached.</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedCandidateDetail.experiences.map((exp: any) => (
                                <div
                                  key={exp.id}
                                  className="pb-3 border-b border-[#E4E2DA] last:border-b-0 last:pb-0"
                                >
                                  <div className="flex flex-wrap justify-between gap-2">
                                    <div>
                                      <span className="font-bold text-slate-900">
                                        {exp.job_title}
                                      </span>
                                      <span className="text-slate-600 ml-2 font-medium">
                                        · {exp.company_name}
                                      </span>
                                    </div>
                                    <span className="font-mono text-xs text-slate-500">
                                      {exp.start_date} —{' '}
                                      {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                                    </span>
                                  </div>
                                  {exp.responsibilities && (
                                    <p className="text-slate-700 mt-1 text-sm">
                                      {exp.responsibilities}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="py-5">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Academic Background ({selectedCandidateDetail.education?.length || 0})
                          </h3>
                          {selectedCandidateDetail.education?.length === 0 ? (
                            <p className="text-slate-500">No education records attached.</p>
                          ) : (
                            <div className="space-y-2.5">
                              {selectedCandidateDetail.education.map((edu: any) => (
                                <div key={edu.id} className="flex justify-between gap-4">
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {edu.qualification}
                                    </div>
                                    <div className="text-slate-600 text-xs">
                                      {edu.institution} {edu.country && `· ${edu.country}`}
                                    </div>
                                  </div>
                                  <div className="font-mono text-xs text-slate-500 shrink-0">
                                    {edu.start_year} —{' '}
                                    {edu.is_current ? 'Present' : edu.completion_year || 'Present'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-5">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Technical Skills ({selectedCandidateDetail.skills?.length || 0})
                          </h3>
                          {selectedCandidateDetail.skills?.length === 0 ? (
                            <p className="text-slate-500">No skills listed.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              {selectedCandidateDetail.skills.map((s: any) => (
                                <div
                                  key={s.id}
                                  className="py-1.5 border-b border-[#E4E2DA] flex items-baseline justify-between gap-2"
                                >
                                  <span className="font-semibold text-slate-900">
                                    {s.skill_name}
                                  </span>
                                  <span className="font-mono text-xs text-slate-500">
                                    {s.proficiency_level} · {s.years_of_experience}y
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activity Log Modal */}
          <AnimatePresence>
            {showAuditLogs && (
              <motion.div
                key="audit-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                role="dialog"
                aria-modal="true"
                aria-label="Administrative Activity Log"
                onClick={() => setShowAuditLogs(false)}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
              >
                <motion.div
                  key="audit-modal-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="enterprise-card max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative"
                >
                  <button
                    type="button"
                    onClick={() => setShowAuditLogs(false)}
                    aria-label="Close activity log"
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h2 className="font-display text-xl font-bold text-slate-900 mb-1">
                    Administrative Activity Log
                  </h2>
                  <p className="text-sm text-slate-600 mb-5">
                    Complete record of candidate registrations, profile updates, and administrative exports.
                  </p>

                  {auditLogsLoading ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                      Loading activity history...
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                      No activity events recorded yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E4E2DA] border-t border-[#E4E2DA]">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="py-3.5 text-sm">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-semibold text-slate-900">
                              {log.action}
                            </span>
                            <span className="font-mono text-xs text-slate-500">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            Actor:{' '}
                            <span className="font-medium text-slate-900">
                              {log.actor_email || 'System'}
                            </span>{' '}
                            ({log.actor_role || 'ANONYMOUS'})
                          </div>
                          {log.metadata && (
                            <div className="mt-1 font-mono text-xs text-slate-500 truncate">
                              {log.metadata}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
};
