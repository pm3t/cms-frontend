import api from '../../lib/axios';

export type FacilityType = 'SANCTUARY' | 'MEETING_ROOM' | 'HALL' | 'OFFICE' | 'KITCHEN' | 'STORAGE' | 'OTHER';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'OUT_OF_SERVICE';
export type EquipmentLogAction = 'CHECKED_OUT' | 'RETURNED' | 'MAINTENANCE' | 'REPAIR' | 'INSPECTION';
export type MaintenanceFrequency = 'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type UtilityType = 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'GAS' | 'OTHER';

export interface Facility {
  id: string; tenantId: string; name: string; type: FacilityType;
  capacity?: number; location?: string; description?: string; amenities?: string;
  isActive: boolean; createdAt: string; updatedAt: string;
  _count?: { bookings: number; maintenances: number };
}
export interface FacilityBooking {
  id: string; tenantId: string; facilityId: string;
  facility?: { id: string; name: string; type: FacilityType; location?: string };
  requestedBy: string; purpose: string; description?: string;
  startTime: string; endTime: string; status: BookingStatus;
  approvedBy?: string; notes?: string; createdAt: string; updatedAt: string;
}
export interface Equipment {
  id: string; tenantId: string; name: string; category: string;
  serialNumber?: string; purchaseDate?: string; purchasePrice?: number;
  condition: EquipmentCondition; location?: string; description?: string;
  nextMaintenanceDate?: string; isActive: boolean; createdAt: string; updatedAt: string;
  _count?: { logs: number };
}
export interface EquipmentLog {
  id: string; equipmentId: string; action: EquipmentLogAction;
  performedBy: string; notes?: string; date: string; createdAt: string;
}
export interface MaintenanceSchedule {
  id: string; tenantId: string; title: string; description?: string;
  type: string; frequency: MaintenanceFrequency; status: MaintenanceStatus;
  facilityId?: string; facility?: { id: string; name: string };
  equipmentId?: string; equipment?: { id: string; name: string };
  scheduledDate: string; completedDate?: string; assignedTo?: string;
  cost?: number; notes?: string; createdAt: string; updatedAt: string;
}
export interface UtilityRecord {
  id: string; tenantId: string; type: UtilityType; month: number; year: number;
  amount: number; usage?: number; unit?: string; vendor?: string;
  invoiceNumber?: string; isPaid: boolean; notes?: string;
  createdAt: string; updatedAt: string;
}

const BASE = '/facility';

export const facilityService = {
  // Facilities
  getFacilities: () => api.get(`${BASE}/rooms`).then(r => r.data as Facility[]),
  getFacilityById: (id: string) => api.get(`${BASE}/rooms/${id}`).then(r => r.data as Facility),
  createFacility: (data: any) => api.post(`${BASE}/rooms`, data).then(r => r.data as Facility),
  updateFacility: (id: string, data: any) => api.patch(`${BASE}/rooms/${id}`, data).then(r => r.data as Facility),
  deleteFacility: (id: string) => api.delete(`${BASE}/rooms/${id}`).then(r => r.data),
  checkAvailability: (id: string, startTime: string, endTime: string) =>
    api.get(`${BASE}/rooms/${id}/availability`, { params: { startTime, endTime } }).then(r => r.data),

  // Bookings
  getBookings: (filters?: { facilityId?: string; status?: BookingStatus; date?: string }) =>
    api.get(`${BASE}/bookings`, { params: filters }).then(r => r.data as FacilityBooking[]),
  getBookingById: (id: string) => api.get(`${BASE}/bookings/${id}`).then(r => r.data as FacilityBooking),
  createBooking: (data: any) => api.post(`${BASE}/bookings`, data).then(r => r.data as FacilityBooking),
  updateBookingStatus: (id: string, status: BookingStatus, approvedBy?: string) =>
    api.patch(`${BASE}/bookings/${id}/status`, { status, approvedBy }).then(r => r.data as FacilityBooking),
  deleteBooking: (id: string) => api.delete(`${BASE}/bookings/${id}`),

  // Equipment
  getEquipments: (filters?: { condition?: EquipmentCondition; category?: string; search?: string }) =>
    api.get(`${BASE}/equipment`, { params: filters }).then(r => r.data as Equipment[]),
  getEquipmentById: (id: string) => api.get(`${BASE}/equipment/${id}`).then(r => r.data),
  createEquipment: (data: any) => api.post(`${BASE}/equipment`, data).then(r => r.data as Equipment),
  updateEquipment: (id: string, data: any) => api.patch(`${BASE}/equipment/${id}`, data).then(r => r.data as Equipment),
  deleteEquipment: (id: string) => api.delete(`${BASE}/equipment/${id}`),
  addEquipmentLog: (id: string, data: any) => api.post(`${BASE}/equipment/${id}/log`, data).then(r => r.data as EquipmentLog),

  // Maintenance
  getMaintenances: (filters?: { status?: MaintenanceStatus; type?: string; facilityId?: string }) =>
    api.get(`${BASE}/maintenance`, { params: filters }).then(r => r.data as MaintenanceSchedule[]),
  getOverdueMaintenance: () => api.get(`${BASE}/maintenance/overdue`).then(r => r.data as MaintenanceSchedule[]),
  getMaintenanceById: (id: string) => api.get(`${BASE}/maintenance/${id}`).then(r => r.data as MaintenanceSchedule),
  createMaintenance: (data: any) => api.post(`${BASE}/maintenance`, data).then(r => r.data as MaintenanceSchedule),
  updateMaintenance: (id: string, data: any) => api.patch(`${BASE}/maintenance/${id}`, data).then(r => r.data as MaintenanceSchedule),
  deleteMaintenance: (id: string) => api.delete(`${BASE}/maintenance/${id}`),

  // Utilities
  getUtilities: (filters?: { type?: UtilityType; year?: number }) =>
    api.get(`${BASE}/utilities`, { params: filters }).then(r => r.data as UtilityRecord[]),
  getUtilitySummary: (year: number) => api.get(`${BASE}/utilities/summary/${year}`).then(r => r.data),
  getUtilityById: (id: string) => api.get(`${BASE}/utilities/${id}`).then(r => r.data as UtilityRecord),
  createUtility: (data: any) => api.post(`${BASE}/utilities`, data).then(r => r.data as UtilityRecord),
  updateUtility: (id: string, data: any) => api.patch(`${BASE}/utilities/${id}`, data).then(r => r.data as UtilityRecord),
  deleteUtility: (id: string) => api.delete(`${BASE}/utilities/${id}`),
};
