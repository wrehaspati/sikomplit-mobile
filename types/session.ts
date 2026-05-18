export interface ISession {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: IRole;
}

export interface ICredentials {
  email: string;
  password: string;
}

export interface IRole {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}