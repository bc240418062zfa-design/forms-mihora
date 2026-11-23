import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { api, getStoredToken } from '../services/api';
import { Candidate, AdminMetrics, AuditLog } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import { AnimatedNumber } from '../components/ui/MotionPrimitives';
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
  }, [page, pageSize, search, filterRole, filterSeniority, filterStatus, filterMinCompletion, sortBy, sortOrder]);

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
      return <ArrowUpDown className="w-3 h-3 opacity-45 shrink-0" />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {actionError && (
          <div
            role="alert"
            className="p-3.5 bg-[var(--status-danger-soft)] border border-rose-200 rounded-[var(--radius-md)] text-[var(--status-danger)] text-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
          <div className="p-3.5 bg-[var(--accent-primary-soft)] border border-blue-200 rounded-[var(--radius-md)] text-[var(--accent-primary)] text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{realtimeNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setRealtimeNotification(null)}
              className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Admin Portal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[var(--ink-muted)] mb-1.5">
              <span className="font-semibold text-[var(--ink-primary)]">
                MIHORA Administrative Console
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--status-success)] inline-flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] inline-block" />
                Live SSE Stream Active
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] tracking-tight">
              Candidate Profiles &amp; Engineering Registry
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-1">
              PostgreSQL-backed candidate intake, verified competencies, and structured dossier exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openAuditLogsModal}
              className="px-3.5 py-2 text-xs font-semibold text-[var(--ink-primary)] bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-sm)] hover:bg-[var(--surface-subtle)] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span>Audit Logs</span>
            </button>

            <button
              type="button"
              disabled={exportingFormat !== null}
              onClick={() => handleExport('csv')}
              className="px-3.5 py-2 text-xs font-semibold text-[var(--ink-primary)] bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-sm)] hover:bg-[var(--surface-subtle)] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--status-success)]" />
              <span>{exportingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              disabled={exportingFormat !== null}
              onClick={() => handleExport('json')}
              className="px-3.5 py-2 text-xs font-semibold text-[var(--ink-primary)] bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-sm)] hover:bg-[var(--surface-subtle)] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <FileCode className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>{exportingFormat === 'json' ? 'Exporting...' : 'Export JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActionError(null);
                loadMetrics();
                loadCandidates();
              }}
              className="p-2 text-[var(--ink-secondary)] bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-sm)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
              title="Refresh records"
              aria-label="Refresh database records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hairline-Divided 4-Column Real Metrics Strip */}
        <div className="bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)]">
          <div className="p-5">
            <div className="text-xs font-mono font-medium text-[var(--ink-muted)]">
              Registered Candidates
            </div>
            <div className="text-3xl font-bold font-mono text-[var(--ink-primary)] tabular-nums mt-1.5">
              {metricsLoading ? '—' : <AnimatedNumber value={metrics?.totalCandidates ?? 0} />}
            </div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">
              Total database records
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-mono font-medium text-[var(--ink-muted)]">
              Complete (≥80%)
            </div>
            <div className="text-3xl font-bold font-mono text-[var(--status-success)] tabular-nums mt-1.5">
              {metricsLoading ? '—' : <AnimatedNumber value={metrics?.completedProfiles ?? 0} />}
            </div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">
              Full verified dossiers
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-mono font-medium text-[var(--ink-muted)]">
              In Progress
            </div>
            <div className="text-3xl font-bold font-mono text-[var(--status-warning)] tabular-nums mt-1.5">
              {metricsLoading ? '—' : <AnimatedNumber value={metrics?.inProgressProfiles ?? 0} />}
            </div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">
              Partially completed drafts
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-mono font-medium text-[var(--ink-muted)]">
              On-Site Ready
            </div>
            <div className="text-3xl font-bold font-mono text-[var(--accent-primary)] tabular-nums mt-1.5">
              {metricsLoading ? '—' : <AnimatedNumber value={metrics?.readyForDeployment ?? 0} />}
            </div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">
              Willing to deploy on-site
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-hairline)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
              <Search className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, role, email, city, ref code..."
                className="field-input field-input-icon text-xs py-2"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowFilterDrawer((prev) => !prev)}
                className={`px-3 py-2 text-xs font-semibold rounded-[var(--radius-sm)] border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                  showFilterDrawer || hasActiveFilters
                    ? 'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'bg-[var(--surface-elevated)] border-[var(--border-strong)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]'
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
                className="px-3 py-2 text-xs rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--ink-primary)]"
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
                className="p-2 text-[var(--ink-secondary)] bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-sm)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                title={`Toggle sort order (${sortOrder})`}
                aria-label={`Toggle sort order, currently ${sortOrder}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[var(--ink-muted)] mr-1">Active:</span>
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onClear}
                  className="px-2.5 py-1 text-xs font-medium text-[var(--accent-primary)] bg-[var(--accent-primary-soft)] border border-blue-200 rounded-[var(--radius-sm)] hover:bg-blue-100/70 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{chip.label}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--ink-primary)] ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {showFilterDrawer && (
            <div className="mt-4 pt-4 border-t border-[var(--border-hairline)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1">
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
                  className="field-input text-xs py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1">
                  Seniority Level
                </label>
                <select
                  value={filterSeniority}
                  onChange={(e) => {
                    setFilterSeniority(e.target.value);
                    setPage(1);
                  }}
                  className="field-input text-xs py-1.5"
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
                <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1">
                  Availability Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="field-input text-xs py-1.5"
                >
                  <option value="">All Statuses</option>
                  <option value="currently_available">Currently Available</option>
                  <option value="employed">Employed</option>
                  <option value="serving_notice">Serving Notice</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1">
                  Min Completeness
                </label>
                <select
                  value={filterMinCompletion}
                  onChange={(e) => {
                    setFilterMinCompletion(e.target.value);
                    setPage(1);
                  }}
                  className="field-input text-xs py-1.5"
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
                  className="w-full px-3 py-2 text-xs font-semibold text-[var(--ink-secondary)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-inset)] rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Candidate Directory Table */}
        <div className="bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-hairline)] overflow-hidden shadow-[var(--shadow-card)]">
          {isTableLoading ? (
            <div className="p-6 space-y-3" aria-busy="true">
              {[1, 2, 3, 4, 5].map((row) => (
                <div
                  key={row}
                  className="h-11 bg-[var(--surface-subtle)] rounded-[var(--radius-sm)] animate-pulse"
                />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Users className="w-9 h-9 text-[var(--ink-faint)] mx-auto mb-3" />
              <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
                No Candidate Profiles Found
              </h3>
              <p className="text-xs text-[var(--ink-muted)] mt-1 max-w-sm mx-auto leading-relaxed">
                {search || hasActiveFilters
                  ? 'No candidate records matched your active filters. Try clearing or adjusting your query.'
                  : 'No candidate profiles have registered yet. New registrations appear here in real time.'}
              </p>
              {(search || hasActiveFilters) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-hairline)] text-xs font-mono font-semibold text-[var(--ink-muted)]">
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleColumnSort('name')}
                        className="inline-flex items-center gap-1 hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
                      >
                        <span>Candidate</span>
                        {renderSortIcon('name')}
                      </button>
                    </th>
                    <th className="py-3 px-4">Role &amp; Seniority</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleColumnSort('experience')}
                        className="inline-flex items-center justify-end gap-1 hover:text-[var(--ink-primary)] transition-colors cursor-pointer ml-auto"
                      >
                        <span>Exp</span>
                        {renderSortIcon('experience')}
                      </button>
                    </th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleColumnSort('completion_percentage')}
                        className="inline-flex items-center justify-end gap-1 hover:text-[var(--ink-primary)] transition-colors cursor-pointer ml-auto"
                      >
                        <span>Score</span>
                        {renderSortIcon('completion_percentage')}
                      </button>
                    </th>
                    <th className="py-3 px-4">Deployment</th>
                    <th className="py-3 px-4 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)] text-xs text-[var(--ink-secondary)]">
                  {candidates.map((cand) => {
                    const nameStr =
                      `${cand.first_name || ''} ${cand.last_name || ''}`.trim() || 'Unnamed Candidate';

                    return (
                      <tr
                        key={cand.id}
                        onClick={() => openCandidateDetail(cand.id)}
                        className="hover:bg-[var(--surface-subtle)]/70 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-[var(--accent-primary)] whitespace-nowrap">
                          {cand.reference_code}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[var(--ink-primary)]">{nameStr}</div>
                          <div className="text-xs text-[var(--ink-muted)] font-mono truncate max-w-[190px]">
                            {cand.email}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[var(--ink-primary)]">
                            {cand.primary_role || 'Not specified'}
                          </div>
                          <div className="text-xs text-[var(--ink-muted)]">
                            {cand.seniority_level || 'Mid-Level'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-[var(--ink-primary)]">{cand.current_city || '—'}</div>
                          <div className="text-xs text-[var(--ink-muted)]">
                            {cand.current_country || ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                          {cand.total_experience_years !== null
                            ? `${cand.total_experience_years}y`
                            : '—'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="capitalize text-[var(--ink-primary)]">
                            {cand.employment_status?.replace(/_/g, ' ') || 'Available'}
                          </span>
                          {cand.notice_period_days ? (
                            <div className="text-xs text-[var(--ink-muted)] font-mono">
                              {cand.notice_period_days}d notice
                            </div>
                          ) : null}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                          <span
                            className={
                              cand.completion_percentage >= 80
                                ? 'text-[var(--status-success)]'
                                : cand.completion_percentage >= 50
                                ? 'text-[var(--status-warning)]'
                                : 'text-[var(--ink-muted)]'
                            }
                          >
                            {cand.completion_percentage}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={
                              cand.willing_onsite_deployment
                                ? 'font-medium text-[var(--status-success)]'
                                : 'text-[var(--ink-muted)]'
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
                            className="px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary-soft)] rounded-[var(--radius-sm)] transition-colors inline-flex items-center gap-1 cursor-pointer"
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

          {/* Pagination */}
          {!isTableLoading && candidates.length > 0 && (
            <div className="px-4 py-3.5 bg-[var(--surface-subtle)] border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--ink-muted)]">
              <div className="font-mono">
                Showing <span className="font-semibold text-[var(--ink-primary)]">{(page - 1) * pageSize + 1}</span>–
                <span className="font-semibold text-[var(--ink-primary)]">
                  {Math.min(page * pageSize, totalCount)}
                </span>{' '}
                of <span className="font-semibold text-[var(--ink-primary)]">{totalCount}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  aria-label="Previous page"
                  className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-mono text-xs px-2">
                  Page {page} / {totalPages || 1}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  aria-label="Next page"
                  className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Slide-Over Candidate Dossier Drawer */}
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
              aria-label="Candidate Dossier Detail"
              onClick={() => setSelectedCandidateId(null)}
              className="fixed inset-0 z-50 bg-[var(--surface-ink)]/55 backdrop-blur-xs flex justify-end"
            >
              <motion.div
                key="dossier-drawer-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--surface-elevated)] border-l border-[var(--border-hairline)] max-w-2xl w-full h-full overflow-y-auto shadow-[var(--shadow-popover)] p-6 sm:p-8 relative"
              >
                <button
                  type="button"
                  onClick={() => setSelectedCandidateId(null)}
                  aria-label="Close dossier drawer"
                  className="absolute top-5 right-5 p-2 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] rounded-[var(--radius-sm)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {isDetailLoading || !selectedCandidateDetail ? (
                  <div className="py-24 text-center">
                    <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-mono text-[var(--ink-muted)]">
                      Loading candidate dossier...
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="border-b border-[var(--border-hairline)] pb-5 mb-6 pr-8">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--ink-muted)] mb-1.5">
                        <span className="font-semibold text-[var(--accent-primary)]">
                          {selectedCandidateDetail.candidate.reference_code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{selectedCandidateDetail.candidate.email}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                        <div>
                          <h2 className="font-display text-2xl font-bold text-[var(--ink-primary)]">
                            {selectedCandidateDetail.candidate.first_name}{' '}
                            {selectedCandidateDetail.candidate.last_name}
                          </h2>
                          <div className="text-sm font-semibold text-[var(--accent-primary)] mt-0.5">
                            {selectedCandidateDetail.candidate.primary_role || 'Engineering Candidate'} ·{' '}
                            {selectedCandidateDetail.candidate.seniority_level || 'Mid-Level'}
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
                          className="px-4 py-2 text-xs font-semibold text-white bg-[var(--surface-ink)] hover:bg-slate-800 rounded-[var(--radius-md)] transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Dossier</span>
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-[var(--border-hairline)] text-xs text-[var(--ink-secondary)]">
                      {selectedCandidateDetail.candidate.professional_summary && (
                        <div className="pb-5">
                          <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] mb-2">
                            Professional Summary
                          </h3>
                          <p className="leading-relaxed text-[var(--ink-primary)]">
                            {selectedCandidateDetail.candidate.professional_summary}
                          </p>
                        </div>
                      )}

                      <div className="py-5 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-[var(--ink-muted)] block">Total Experience</span>
                          <span className="font-mono font-bold text-[var(--ink-primary)] mt-0.5 block">
                            {selectedCandidateDetail.candidate.total_experience_years ?? 0} Years
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--ink-muted)] block">Expected Remuneration</span>
                          <span className="font-mono font-bold text-[var(--ink-primary)] mt-0.5 block">
                            {selectedCandidateDetail.candidate.expected_compensation_amount
                              ? `${Number(
                                  selectedCandidateDetail.candidate.expected_compensation_amount
                                ).toLocaleString()} ${selectedCandidateDetail.candidate.compensation_currency}`
                              : 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--ink-muted)] block">Notice Period</span>
                          <span className="font-mono font-bold text-[var(--ink-primary)] mt-0.5 block">
                            {selectedCandidateDetail.candidate.notice_period_days ?? 0} Days
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--ink-muted)] block">Deployment</span>
                          <span className="font-bold text-[var(--ink-primary)] mt-0.5 block">
                            {selectedCandidateDetail.candidate.willing_onsite_deployment
                              ? 'On-Site Willing'
                              : 'Remote Only'}
                          </span>
                        </div>
                      </div>

                      <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-xs text-[var(--ink-muted)] block">Max Commute</span>
                          <span className="font-mono font-semibold text-[var(--ink-primary)] mt-0.5 block">
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
                          <span className="text-xs text-[var(--ink-muted)] block">Accommodation</span>
                          <span className="font-semibold text-[var(--ink-primary)] capitalize mt-0.5 block">
                            {selectedCandidateDetail.candidate.accommodation_status?.replace(/_/g, ' ')}
                            {selectedCandidateDetail.candidate.accommodation_beyond_km
                              ? ` (Beyond ${selectedCandidateDetail.candidate.accommodation_beyond_km} km)`
                              : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--ink-muted)] block">Transportation</span>
                          <span className="font-semibold text-[var(--ink-primary)] capitalize mt-0.5 block">
                            {selectedCandidateDetail.candidate.transportation_status?.replace(/_/g, ' ') ||
                              'None specified'}
                          </span>
                        </div>
                      </div>

                      <div className="py-5">
                        <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] mb-3">
                          Work Experience ({selectedCandidateDetail.experiences?.length || 0})
                        </h3>
                        {selectedCandidateDetail.experiences?.length === 0 ? (
                          <p className="text-[var(--ink-muted)]">No experience records attached.</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedCandidateDetail.experiences.map((exp: any) => (
                              <div
                                key={exp.id}
                                className="pb-3 border-b border-[var(--border-hairline)] last:border-b-0 last:pb-0"
                              >
                                <div className="flex flex-wrap justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-[var(--ink-primary)]">
                                      {exp.job_title}
                                    </span>
                                    <span className="text-[var(--accent-primary)] ml-2 font-medium">
                                      · {exp.company_name}
                                    </span>
                                  </div>
                                  <span className="font-mono text-xs text-[var(--ink-muted)]">
                                    {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                                  </span>
                                </div>
                                {exp.responsibilities && (
                                  <p className="text-[var(--ink-secondary)] mt-1">{exp.responsibilities}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="py-5">
                        <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] mb-3">
                          Academic Background ({selectedCandidateDetail.education?.length || 0})
                        </h3>
                        {selectedCandidateDetail.education?.length === 0 ? (
                          <p className="text-[var(--ink-muted)]">No education records attached.</p>
                        ) : (
                          <div className="space-y-2.5">
                            {selectedCandidateDetail.education.map((edu: any) => (
                              <div key={edu.id} className="flex justify-between gap-4">
                                <div>
                                  <div className="font-bold text-[var(--ink-primary)]">
                                    {edu.qualification}
                                  </div>
                                  <div className="text-[var(--accent-primary)]">
                                    {edu.institution} {edu.country && `· ${edu.country}`}
                                  </div>
                                </div>
                                <div className="font-mono text-xs text-[var(--ink-muted)] shrink-0">
                                  {edu.start_year} — {edu.is_current ? 'Present' : edu.completion_year || 'Present'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-5">
                        <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] mb-3">
                          Technical Skills ({selectedCandidateDetail.skills?.length || 0})
                        </h3>
                        {selectedCandidateDetail.skills?.length === 0 ? (
                          <p className="text-[var(--ink-muted)]">No skills listed.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            {selectedCandidateDetail.skills.map((s: any) => (
                              <div
                                key={s.id}
                                className="py-1.5 border-b border-[var(--border-hairline)] flex items-baseline justify-between gap-2"
                              >
                                <span className="font-semibold text-[var(--ink-primary)]">
                                  {s.skill_name}
                                </span>
                                <span className="font-mono text-xs text-[var(--ink-muted)]">
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

        {/* System Audit Logs Modal */}
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
              aria-label="Administrative Audit Logs"
              onClick={() => setShowAuditLogs(false)}
              className="fixed inset-0 z-50 bg-[var(--surface-ink)]/55 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                key="audit-modal-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-hairline)] max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-[var(--shadow-popover)] p-6 relative"
              >
                <button
                  type="button"
                  onClick={() => setShowAuditLogs(false)}
                  aria-label="Close audit logs"
                  className="absolute top-5 right-5 p-2 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] rounded-[var(--radius-sm)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="font-display text-lg font-bold text-[var(--ink-primary)] mb-1">
                  Administrative Audit Logs
                </h2>
                <p className="text-xs text-[var(--ink-muted)] mb-5">
                  Immutable PostgreSQL audit trail of registrations, profile saves, and data exports.
                </p>

                {auditLogsLoading ? (
                  <div className="py-12 text-center font-mono text-xs text-[var(--ink-muted)]">
                    Loading audit history...
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--ink-muted)]">
                    No audit events recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)]">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="py-3 text-xs">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-mono font-semibold text-[var(--ink-primary)]">
                            {log.action}
                          </span>
                          <span className="font-mono text-xs text-[var(--ink-muted)]">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[var(--ink-secondary)] mt-0.5">
                          Actor: <span className="font-mono">{log.actor_email || 'System'}</span> (
                          {log.actor_role || 'ANONYMOUS'})
                        </div>
                        {log.metadata && (
                          <div className="mt-1 font-mono text-xs text-[var(--ink-muted)] truncate">
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
    </MotionConfig>
  );
};
