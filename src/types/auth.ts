export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organization_id: string;
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}
