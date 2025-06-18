export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export enum VerificationType {
  EMAIL = 'email',
  PHONE = 'phone',
} 