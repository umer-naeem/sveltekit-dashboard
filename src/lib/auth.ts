import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'customer' | 'employee';
}

export class AuthService {
	private static instance: AuthService;
	private currentUser: AuthUser | null = null;

	private constructor() {
		if (browser) {
			this.loadFromStorage();
		}
	}

	public static getInstance(): AuthService {
		if (!AuthService.instance) {
			AuthService.instance = new AuthService();
		}
		return AuthService.instance;
	}

	private loadFromStorage(): void {
		try {
			const stored = localStorage.getItem('auth_user');
			if (stored) {
				this.currentUser = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load user from storage:', error);
			this.currentUser = null;
		}
	}

	private saveToStorage(): void {
		if (browser && this.currentUser) {
			try {
				localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
			} catch (error) {
				console.error('Failed to save user to storage:', error);
			}
		}
	}

	public login(user: AuthUser): void {
		this.currentUser = user;
		this.saveToStorage();
	}

	public logout(): void {
		this.currentUser = null;
		if (browser) {
			localStorage.removeItem('auth_user');
			goto('/login');
		}
	}

	public getCurrentUser(): AuthUser | null {
		return this.currentUser;
	}

	public isAuthenticated(): boolean {
		return this.currentUser !== null;
	}

	public isAdmin(): boolean {
		return this.currentUser?.role === 'admin';
	}

	public requireAuth(): void {
		if (!this.isAuthenticated() && browser) {
			goto('/login');
		}
	}

	public requireAdmin(): void {
		this.requireAuth();
		if (!this.isAdmin() && browser) {
			goto('/dashboard');
		}
	}
}

export const authService = AuthService.getInstance();
