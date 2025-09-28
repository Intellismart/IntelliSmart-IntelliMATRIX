export type Role = "admin" | "business" | "consumer" | "reseller";

export type Tenant = {
  id: string; // slug
  name: string;
  createdAt: string; // ISO
  ownerUserId?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId?: string; // required for business/consumer
  managedTenantIds?: string[]; // for reseller
  password?: string; // demo only
};

export type Agent = {
  id: string;
  tenantId: string;
  name: string;
  status: "running" | "stopped";
};

export type Session = {
  userId: string;
  tenantId?: string; // active tenant for reseller/admin
  role: Role;
  iat: number;
};

export type DbSchema = {
  tenants: Tenant[];
  users: User[];
  agents: Agent[];
};
