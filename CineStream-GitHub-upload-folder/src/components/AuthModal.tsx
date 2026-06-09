import Eye from "lucide-react/dist/esm/icons/eye.js";
import EyeOff from "lucide-react/dist/esm/icons/eye-off.js";
import Loader2 from "lucide-react/dist/esm/icons/loader-2.js";
import Mail from "lucide-react/dist/esm/icons/mail.js";
import X from "lucide-react/dist/esm/icons/x.js";
import type { FormEvent } from "react";
import { useState } from "react";

export type AuthMode = "login" | "signup";

type AuthModalProps = {
  configured: boolean;
  error: string | null;
  loading: boolean;
  mode: AuthMode;
  open: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onModeChange: (mode: AuthMode) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<void>;
};

export function AuthModal({ configured, error, loading, mode, open, onClose, onGoogleSignIn, onModeChange, onSignIn, onSignUp }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === "signup";

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSignup) {
      await onSignUp(email, password, fullName);
    } else {
      await onSignIn(email, password);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/78 px-4 py-6 backdrop-blur-2xl" role="dialog" aria-modal="true">
      <div className="glass-panel relative w-full max-w-md overflow-hidden rounded-[34px] p-5 shadow-2xl sm:p-6">
        <div className="pointer-events-none absolute inset-x-10 -top-32 h-64 rounded-full bg-cine-red/25 blur-3xl" />
        <button
          onClick={onClose}
          className="glass-button absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/18"
          aria-label="Close login"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cine-red">CineStream Account</p>
          <h2 className="mt-2 text-3xl font-black text-white">{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p className="mt-2 text-sm leading-6 text-white/58">
            {isSignup ? "Save your movies to the cloud and continue across devices." : "Sign in to sync your wishlist and watchlist."}
          </p>

          {!configured ? (
            <div className="mt-5 rounded-[24px] bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50 ring-1 ring-yellow-200/20">
              Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable login.
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void onGoogleSignIn()}
            disabled={!configured || loading}
            className="glass-button mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-black text-white transition hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-black">G</span>}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/36">
            <span className="h-px flex-1 bg-white/12" />
            or
            <span className="h-px flex-1 bg-white/12" />
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
            {isSignup ? (
              <label className="glass-input flex h-12 items-center rounded-full px-4 text-white">
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-white/42"
                  placeholder="Full name"
                  autoComplete="name"
                />
              </label>
            ) : null}
            <label className="glass-input flex h-12 items-center gap-2 rounded-full px-4 text-white">
              <Mail size={18} className="text-white/48" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/42"
                placeholder="Email"
                type="email"
                autoComplete="email"
                required
              />
            </label>
            <label className="glass-input flex h-12 items-center gap-2 rounded-full px-4 text-white">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/42"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
                required
              />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </label>

            {error ? <p className="rounded-[18px] bg-red-500/12 px-4 py-3 text-sm font-semibold text-red-100 ring-1 ring-red-300/20">{error}</p> : null}

            <button
              type="submit"
              disabled={!configured || loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cine-red text-sm font-black text-white shadow-glow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isSignup ? "Create account" : "Login"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => onModeChange(isSignup ? "login" : "signup")}
            className="mt-5 w-full rounded-full py-2 text-sm font-bold text-white/62 transition hover:bg-white/[0.06] hover:text-white"
          >
            {isSignup ? "Already have an account? Login" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
