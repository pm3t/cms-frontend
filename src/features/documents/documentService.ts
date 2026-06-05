import api from '../../lib/axios';

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type DocumentCategory = 'SERMON' | 'TEACHING' | 'WORSHIP' | 'ADMINISTRATIVE' | 'OTHER';
export type CertificateType = 'BAPTISM' | 'MARRIAGE' | 'CONFIRMATION' | 'MEMBERSHIP' | 'OTHER';

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  fileName?: string;
  uploadedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  tags?: string;
  speaker?: string;
  date?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  fileName?: string;
  currentVersion: number;
  isPublic: boolean;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  tenantId: string;
  memberId?: string;
  member?: { id: string; firstName: string; lastName?: string; email?: string };
  type: CertificateType;
  certificateNumber: string;
  recipientName: string;
  recipientAddress?: string;
  issuedDate: string;
  issuedBy: string;
  location?: string;
  templateId?: string;
  template?: { id: string; name: string; type: CertificateType };
  fileUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTemplate {
  id: string;
  tenantId: string;
  name: string;
  type: CertificateType;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Document / Library API ──────────────────────────────────────────────────

export const documentService = {
  async getDocuments(filters?: { category?: DocumentCategory; search?: string }): Promise<Document[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    const res = await api.get(`/documents/library?${params.toString()}`);
    return res.data;
  },

  async getDocumentById(id: string): Promise<Document> {
    const res = await api.get(`/documents/library/${id}`);
    return res.data;
  },

  async createDocument(formData: FormData): Promise<Document> {
    const res = await api.post('/documents/library', formData, {
      headers: { 'Content-Type': undefined }, // Let browser set multipart boundary automatically
    });
    return res.data;
  },

  async updateDocument(id: string, data: Partial<Omit<Document, 'id' | 'tenantId' | 'versions' | 'createdAt' | 'updatedAt'>>): Promise<Document> {
    const res = await api.patch(`/documents/library/${id}`, data);
    return res.data;
  },

  async uploadVersion(id: string, formData: FormData): Promise<Document> {
    const res = await api.post(`/documents/library/${id}/version`, formData, {
      headers: { 'Content-Type': undefined }, // Let browser set multipart boundary automatically
    });
    return res.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/library/${id}`);
  },

  // ─── Certificates ────────────────────────────────────────────────────────

  async getCertificates(filters?: { type?: CertificateType; search?: string }): Promise<Certificate[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.search) params.set('search', filters.search);
    const res = await api.get(`/documents/certificates?${params.toString()}`);
    return res.data;
  },

  async getCertificateById(id: string): Promise<Certificate> {
    const res = await api.get(`/documents/certificates/${id}`);
    return res.data;
  },

  async getMemberCertificates(memberId: string): Promise<Certificate[]> {
    const res = await api.get(`/documents/certificates/member/${memberId}`);
    return res.data;
  },

  async createCertificate(formData: FormData): Promise<Certificate> {
    const res = await api.post('/documents/certificates', formData, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },

  async updateCertificate(id: string, formData: FormData): Promise<Certificate> {
    const res = await api.patch(`/documents/certificates/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },

  async deleteCertificate(id: string): Promise<void> {
    await api.delete(`/documents/certificates/${id}`);
  },

  // ─── Templates ───────────────────────────────────────────────────────────

  async getTemplates(): Promise<CertificateTemplate[]> {
    const res = await api.get('/documents/templates');
    return res.data;
  },

  async getTemplateById(id: string): Promise<CertificateTemplate> {
    const res = await api.get(`/documents/templates/${id}`);
    return res.data;
  },

  async createTemplate(data: { name: string; type: CertificateType; content: string; isDefault?: boolean }): Promise<CertificateTemplate> {
    const res = await api.post('/documents/templates', data);
    return res.data;
  },

  async updateTemplate(id: string, data: Partial<CertificateTemplate>): Promise<CertificateTemplate> {
    const res = await api.patch(`/documents/templates/${id}`, data);
    return res.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/documents/templates/${id}`);
  },
};
