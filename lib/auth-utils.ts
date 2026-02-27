const COOKIE_NAME = "pl-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setCookie(token: string) {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  return match ? match[2] : null;
}

export function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

const DEMO_EMAIL = "demo@progressionlabs.com";
const DEMO_PASSWORD = "progression-demo";

export function validateCredentials(email: string, password: string): boolean {
  return email === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export function generateToken(): string {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
