import api from '../../lib/axios';

export interface PastoralVisitation {
  id?: string;
  memberId: string;
  visitorName: string;
  visitDate: string;
  type: 'HOME' | 'HOSPITAL' | 'OTHER';
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED';
  purpose: string;
  notes?: string | null;
  member?: any;
}

export interface CounselingRecord {
  id?: string;
  memberId: string;
  counselorId?: string | null;
  counselorName: string;
  counselingDate: string;
  title: string;
  issueDescription: string;
  actionPlan?: string | null;
  notes: string;
  isPrivate: boolean;
  member?: any;
}

export interface PrayerRequest {
  id?: string;
  memberId?: string | null;
  requesterName: string;
  requesterEmail?: string | null;
  requesterPhone?: string | null;
  content: string;
  isAnonymous: boolean;
  isPrivate: boolean;
  status: 'PENDING' | 'ACTIVE' | 'ANSWERED';
  prayerCount?: number;
  notes?: string | null;
  member?: any;
}

export interface CareGroup {
  id?: string;
  name: string;
  description?: string | null;
  leaderName?: string | null;
  members?: { id: string; member: any }[];
}

export interface CrisisRecord {
  id?: string;
  memberId: string;
  crisisType: 'BEREAVEMENT' | 'SICKNESS' | 'FINANCIAL' | 'FAMILY' | 'ACCIDENT' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignedToId?: string | null;
  notes?: string | null;
  member?: any;
}

export interface EmergencyContact {
  id?: string;
  memberId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string | null;
  isPrimary: boolean;
}

export const pastoralService = {
  // --- Visitations ---
  async getVisitations(): Promise<PastoralVisitation[]> {
    const res = await api.get('/pastoral/visitations');
    return res.data;
  },
  async getVisitationById(id: string): Promise<PastoralVisitation> {
    const res = await api.get(`/pastoral/visitations/${id}`);
    return res.data;
  },
  async createVisitation(data: PastoralVisitation): Promise<PastoralVisitation> {
    const res = await api.post('/pastoral/visitations', data);
    return res.data;
  },
  async updateVisitation(id: string, data: Partial<PastoralVisitation>): Promise<PastoralVisitation> {
    const res = await api.patch(`/pastoral/visitations/${id}`, data);
    return res.data;
  },
  async deleteVisitation(id: string): Promise<void> {
    await api.delete(`/pastoral/visitations/${id}`);
  },

  // --- Counseling (Strict Privacy) ---
  async getCounselings(): Promise<CounselingRecord[]> {
    const res = await api.get('/pastoral/counseling');
    return res.data;
  },
  async getCounselingById(id: string): Promise<CounselingRecord> {
    const res = await api.get(`/pastoral/counseling/${id}`);
    return res.data;
  },
  async createCounseling(data: CounselingRecord): Promise<CounselingRecord> {
    const res = await api.post('/pastoral/counseling', data);
    return res.data;
  },
  async updateCounseling(id: string, data: Partial<CounselingRecord>): Promise<CounselingRecord> {
    const res = await api.patch(`/pastoral/counseling/${id}`, data);
    return res.data;
  },
  async deleteCounseling(id: string): Promise<void> {
    await api.delete(`/pastoral/counseling/${id}`);
  },

  // --- Prayer Requests ---
  async getPrayers(): Promise<PrayerRequest[]> {
    const res = await api.get('/pastoral/prayers');
    return res.data;
  },
  async getPrayerById(id: string): Promise<PrayerRequest> {
    const res = await api.get(`/pastoral/prayers/${id}`);
    return res.data;
  },
  async createPrayer(data: PrayerRequest): Promise<PrayerRequest> {
    const res = await api.post('/pastoral/prayers', data);
    return res.data;
  },
  async updatePrayer(id: string, data: Partial<PrayerRequest>): Promise<PrayerRequest> {
    const res = await api.patch(`/pastoral/prayers/${id}`, data);
    return res.data;
  },
  async incrementPray(id: string): Promise<PrayerRequest> {
    const res = await api.post(`/pastoral/prayers/${id}/pray`);
    return res.data;
  },
  async deletePrayer(id: string): Promise<void> {
    await api.delete(`/pastoral/prayers/${id}`);
  },

  // --- Care Groups ---
  async getCareGroups(): Promise<CareGroup[]> {
    const res = await api.get('/pastoral/care-groups');
    return res.data;
  },
  async getCareGroupById(id: string): Promise<CareGroup> {
    const res = await api.get(`/pastoral/care-groups/${id}`);
    return res.data;
  },
  async createCareGroup(data: CareGroup): Promise<CareGroup> {
    const res = await api.post('/pastoral/care-groups', data);
    return res.data;
  },
  async updateCareGroup(id: string, data: Partial<CareGroup>): Promise<CareGroup> {
    const res = await api.patch(`/pastoral/care-groups/${id}`, data);
    return res.data;
  },
  async deleteCareGroup(id: string): Promise<void> {
    await api.delete(`/pastoral/care-groups/${id}`);
  },
  async addCareGroupMember(groupId: string, memberId: string): Promise<any> {
    const res = await api.post(`/pastoral/care-groups/${groupId}/members`, { memberId });
    return res.data;
  },
  async removeCareGroupMember(groupId: string, memberId: string): Promise<void> {
    await api.delete(`/pastoral/care-groups/${groupId}/members/${memberId}`);
  },

  // --- Crisis Records ---
  async getCrises(): Promise<CrisisRecord[]> {
    const res = await api.get('/pastoral/crisis');
    return res.data;
  },
  async getCrisisById(id: string): Promise<CrisisRecord> {
    const res = await api.get(`/pastoral/crisis/${id}`);
    return res.data;
  },
  async createCrisis(data: CrisisRecord): Promise<CrisisRecord> {
    const res = await api.post('/pastoral/crisis', data);
    return res.data;
  },
  async updateCrisis(id: string, data: Partial<CrisisRecord>): Promise<CrisisRecord> {
    const res = await api.patch(`/pastoral/crisis/${id}`, data);
    return res.data;
  },
  async deleteCrisis(id: string): Promise<void> {
    await api.delete(`/pastoral/crisis/${id}`);
  },

  // --- Emergency Contacts ---
  async getEmergencyContacts(memberId: string): Promise<EmergencyContact[]> {
    const res = await api.get(`/pastoral/emergency-contacts/member/${memberId}`);
    return res.data;
  },
  async createEmergencyContact(data: EmergencyContact): Promise<EmergencyContact> {
    const res = await api.post('/pastoral/emergency-contacts', data);
    return res.data;
  },
  async updateEmergencyContact(id: string, data: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const res = await api.patch(`/pastoral/emergency-contacts/${id}`, data);
    return res.data;
  },
  async deleteEmergencyContact(id: string): Promise<void> {
    await api.delete(`/pastoral/emergency-contacts/${id}`);
  }
};
