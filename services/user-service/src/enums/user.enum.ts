export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum ProfileStatus {
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete',
  VERIFIED = 'verified',
}

export enum AgentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
} 