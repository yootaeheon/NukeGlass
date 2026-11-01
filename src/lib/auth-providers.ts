// Sign-in options shown on /login. Google first; others are switched on here
// once they are set up in Supabase Auth (Apple and Kakao are built in, LINE needs a custom OIDC provider).
export type AuthProvider = { id: "google" | "apple" | "kakao"; label: string; enabled: boolean };

export const AUTH_PROVIDERS: AuthProvider[] = [
  { id: "google", label: "Continue with Google", enabled: true },
  { id: "apple", label: "Continue with Apple", enabled: false },
  { id: "kakao", label: "Continue with Kakao", enabled: false },
];
