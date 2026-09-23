import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { recordLogin, recordLogout } from "@/lib/auth.functions";
import { getDeviceInfo } from "@/lib/device";
import { profilesRepository, type Profile } from "@/lib/db/profiles";

const REMEMBER_KEY = "jl_remember_me";
const SESSION_MARKER = "jl_session_active";
const LOGIN_HISTORY_KEY = "jl_login_history_id";

type AuthContextValue = {
  hydrated: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  loginModalOpen: boolean;
  /** Opens the login modal, remembering where to go after success. */
  requireAuth: (redirectTo?: string) => void;
  openLogin: (redirectTo?: string) => void;
  closeLogin: () => void;
  /** Called after Supabase has established a session; resolves the pending redirect. */
  completeLogin: (method?: "password" | "otp", remember?: boolean) => string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function safeLocal() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const redirectRef = useRef<string | null>(null);

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(session);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      setProfile(await profilesRepository.getById(userId));
    } catch {
      setProfile(null);
    }
  }, []);

  // Restore the session on mount and keep it in sync (refresh tokens, expiry, other tabs).
  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
      if (event === "SIGNED_OUT") setProfile(null);
    });

    void (async () => {
      const store = safeLocal();
      const remember = store?.getItem(REMEMBER_KEY) !== "0";
      const sameBrowserSession = window.sessionStorage.getItem(SESSION_MARKER) === "1";

      // "Remember me" off → the session ends when the browser session ends.
      if (!remember && !sameBrowserSession) {
        await supabase.auth.signOut();
        store?.removeItem(REMEMBER_KEY);
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      if (data.session) window.sessionStorage.setItem(SESSION_MARKER, "1");
      setHydrated(true);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.id) void loadProfile(user.id);
  }, [user?.id, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await loadProfile(user.id);
  }, [user?.id, loadProfile]);

  const openLogin = useCallback((to?: string) => {
    redirectRef.current = to ?? null;
    setLoginModalOpen(true);
  }, []);

  const requireAuth = openLogin;
  const closeLogin = useCallback(() => setLoginModalOpen(false), []);

  const completeLogin = useCallback((method: "password" | "otp" = "password", remember = true) => {
    const store = safeLocal();
    store?.setItem(REMEMBER_KEY, remember ? "1" : "0");
    try {
      window.sessionStorage.setItem(SESSION_MARKER, "1");
    } catch {
      /* ignore */
    }

    setLoginModalOpen(false);

    void (async () => {
      try {
        const info = getDeviceInfo();
        const res = await recordLogin({ data: { method, ...info } });
        if (res?.loginHistoryId) store?.setItem(LOGIN_HISTORY_KEY, res.loginHistoryId);
      } catch {
        /* history is best-effort */
      }
    })();

    const target = redirectRef.current;
    redirectRef.current = null;
    return target;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    const store = safeLocal();
    const loginHistoryId = store?.getItem(LOGIN_HISTORY_KEY) ?? null;
    try {
      await recordLogout({ data: { loginHistoryId } });
    } catch {
      /* best-effort */
    }
    store?.removeItem(LOGIN_HISTORY_KEY);
    store?.removeItem(REMEMBER_KEY);
    try {
      window.sessionStorage.removeItem(SESSION_MARKER);
    } catch {
      /* ignore */
    }
    await supabase.auth.signOut();
    setProfile(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      isAuthenticated,
      loading,
      user,
      session,
      profile,
      refreshProfile,
      loginModalOpen,
      requireAuth,
      openLogin,
      closeLogin,
      completeLogin,
      signOut,
    }),
    [
      hydrated,
      isAuthenticated,
      loading,
      user,
      session,
      profile,
      refreshProfile,
      loginModalOpen,
      requireAuth,
      openLogin,
      closeLogin,
      completeLogin,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
