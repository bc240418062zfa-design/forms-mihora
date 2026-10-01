import {
  User,
  CandidateProfileResponse,
  Candidate,
  Experience,
  Education,
  Skill,
  CandidateDocument,
  AdminMetrics,
  AuditLog,
} from '../types';

const TOKEN_KEY = 'mihora_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Non-json response
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; confirmPassword: string; acceptTerms: boolean }) {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async adminLogin(data: { email: string; password: string }) {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async checkAdminStatus() {
    return request<{ hasAdmin: boolean }>('/api/auth/check-admin-status');
  },

  async setupInitialAdmin(data: { email: string; password: string; confirmPassword: string; setupKey?: string }) {
    return request<{ success: boolean; message: string }>('/api/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return request<{ user: User }>('/api/auth/me');
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },

  // Candidate
  async getCandidateProfile() {
    return request<CandidateProfileResponse>('/api/candidate/me');
  },

  async updateCandidateProfile(data: Partial<Candidate>) {
    return request<{ success: boolean; message: string; candidate: Candidate; completeness: any }>(
      '/api/candidate/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  async addExperience(data: Partial<Experience>) {
    return request<{ success: boolean; experience: Experience }>('/api/candidate/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteExperience(id: number) {
    return request<{ success: boolean; message: string }>(`/api/candidate/experiences/${id}`, {
      method: 'DELETE',
    });
  },

  async addEducation(data: Partial<Education>) {
    return request<{ success: boolean; education: Education }>('/api/candidate/education', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteEducation(id: number) {
    return request<{ success: boolean; message: string }>(`/api/candidate/education/${id}`, {
      method: 'DELETE',
    });
  },

  async addSkill(data: Partial<Skill>) {
    return request<{ success: boolean; skill: Skill }>('/api/candidate/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteSkill(id: number) {
    return request<{ success: boolean; message: string }>(`/api/candidate/skills/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin
  async getAdminMetrics() {
    return request<AdminMetrics>('/api/admin/metrics');
  },

  async getAdminCandidates(params: Record<string, string | number | boolean | undefined | null>) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    }
    return request<{
      candidates: Candidate[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/admin/candidates?${query.toString()}`);
  },

  async getAdminCandidateDetail(id: number) {
    return request<{
      candidate: Candidate;
      experiences: Experience[];
      education: Education[];
      certifications: any[];
      skills: Skill[];
      documents?: CandidateDocument[];
      auditLogs: AuditLog[];
    }>(`/api/admin/candidates/${id}`);
  },

  async getAdminAuditLogs(page = 1) {
    return request<{ logs: AuditLog[]; total: number; page: number; pageSize: number }>(
      `/api/admin/audit-logs?page=${page}`
    );
  },

  getExportCsvUrl(): string {
    return `/api/admin/exports/csv`;
  },

  getExportJsonUrl(): string {
    return `/api/admin/exports/json`;
  },
};
