import { UserRole } from '../types/urbanpulse';

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    organization: string;
  };
  token: string;
  expiresAt: number;
}

export const DEMO_ACCOUNTS = [
  {
    email: 'transport.authority@urbanpulse.demo',
    password: 'password123',
    name: 'Transport Authority Director',
    role: 'transport_authority' as UserRole,
    organization: 'Gurugram Metropolitan Development Authority'
  },
  {
    email: 'municipal.authority@urbanpulse.demo',
    password: 'password123',
    name: 'Municipal Chief Engineer',
    role: 'municipal_authority' as UserRole,
    organization: 'Municipal Corporation of Gurugram'
  },
  {
    email: 'field.officer@urbanpulse.demo',
    password: 'password123',
    name: 'Officer Rajesh Kumar',
    role: 'field_officer' as UserRole,
    organization: 'Road Maintenance Team 04'
  },
  {
    email: 'admin@urbanpulse.demo',
    password: 'password123',
    name: 'BEL System Administrator',
    role: 'administrator' as UserRole,
    organization: 'Bharat Electronics Limited (BEL)'
  }
];

export class AuthProviderService {
  private static SESSION_KEY = 'urbanpulse_auth_session';

  public static getSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(AuthProviderService.SESSION_KEY);
      if (!stored) return null;
      const session: UserSession = JSON.parse(stored);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(AuthProviderService.SESSION_KEY);
        return null;
      }
      return session;
    } catch (err) {
      return null;
    }
  }

  public static login(email: string, role: UserRole = 'transport_authority'): UserSession {
    const demoAcc = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase()) || {
      email,
      name: email.split('@')[0].toUpperCase(),
      role,
      organization: 'City Transport Authority'
    };

    const session: UserSession = {
      user: {
        id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
        email: demoAcc.email,
        name: demoAcc.name,
        role: demoAcc.role || role,
        organization: demoAcc.organization
      },
      token: `jwt_up_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    localStorage.setItem(AuthProviderService.SESSION_KEY, JSON.stringify(session));
    return session;
  }

  public static logout(): void {
    localStorage.removeItem(AuthProviderService.SESSION_KEY);
  }
}
