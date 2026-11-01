// Sign-in options shown on /login. Google first; others are switched on here
// once they are set up in Supabase Auth (Apple and Kakao are built in, LINE needs a custom OIDC provider).
// Button text lives in the dictionaries (login.providers).
export type AuthProvider = { id: "google" | "apple" | "kakao"; enabled: boolean };

export const AUTH_PROVIDERS: AuthProvider[] = [
  { id: "google", enabled: true },
  { id: "apple", enabled: false },
  { id: "kakao", enabled: false },
];
