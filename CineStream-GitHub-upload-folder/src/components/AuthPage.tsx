import Eye from "lucide-react/dist/esm/icons/eye.js";
import EyeOff from "lucide-react/dist/esm/icons/eye-off.js";
import Loader2 from "lucide-react/dist/esm/icons/loader-2.js";
import Lock from "lucide-react/dist/esm/icons/lock.js";
import Mail from "lucide-react/dist/esm/icons/mail.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import type { FormEvent } from "react";
import { useState } from "react";

type AuthMode = "login" | "signup";

type AuthPageProps = {
  configured: boolean;
  error: string | null;
  loading: boolean;
  notice: string | null;
  sessionLoading: boolean;
  onGoogleSignIn: () => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<void>;
};

export function AuthPage({ configured, error, loading, notice, sessionLoading, onGoogleSignIn, onSignIn, onSignUp }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const isSignup = mode === "signup";
  const disabled = loading || sessionLoading || !configured;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (isSignup && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (isSignup) {
      await onSignUp(email, password, fullName);
    } else {
      await onSignIn(email, password);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(229,9,20,0.26),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(135deg,#030305_0%,#111116_48%,#050506_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.72)_100%)]" />

      <section className="relative mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:block">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cine-red ring-1 ring-white/12 backdrop-blur">
            <Sparkles size={15} />
            Members only
          </p>
          <h1 className="mt-6 max-w-xl text-6xl font-black leading-[0.9] text-white xl:text-7xl">CineStream</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/66">
            Sign in to unlock your movie discovery space, synced wishlist, watchlist, trailers, and recommendations.
          </p>
        </div>

        <div className="glass-panel relative mx-auto w-full max-w-md overflow-hidden rounded-[36px] p-5 shadow-2xl sm:p-6">
          <div className="pointer-events-none absolute inset-x-8 -top-36 h-72 rounded-full bg-cine-red/25 blur-3xl" />
          <div className="relative">
            <div className="text-center lg:text-left">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-[22px] bg-cine-red text-2xl font-black text-white shadow-glow lg:mx-0">C</div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-cine-red">CineStream</p>
              <h2 className="mt-2 text-3xl font-black text-white">{isSignup ? "Create your account" : "Welcome back"}</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {sessionLoading ? "Restoring your secure session..." : isSignup ? "Create an account to enter CineStream." : "Sign in to continue to CineStream."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setLocalError(null);
                }}
                className={`h-10 rounded-full text-sm font-black transition ${!isSignup ? "bg-cine-red text-white shadow-glow" : "text-white/58 hover:bg-white/[0.08] hover:text-white"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setLocalError(null);
                }}
                className={`h-10 rounded-full text-sm font-black transition ${isSignup ? "bg-cine-red text-white shadow-glow" : "text-white/58 hover:bg-white/[0.08] hover:text-white"}`}
              >
                Sign Up
              </button>
            </div>

            {!configured ? (
              <div className="mt-5 rounded-[24px] bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50 ring-1 ring-yellow-200/20">
                Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void onGoogleSignIn()}
              disabled={disabled}
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
                <Lock size={18} className="text-white/48" />
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

              {isSignup ? (
                <label className="glass-input flex h-12 items-center gap-2 rounded-full px-4 text-white">
                  <Lock size={18} className="text-white/48" />
                  <input
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/42"
                    placeholder="Confirm password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </label>
              ) : null}

              {localError || error ? <p className="rounded-[18px] bg-red-500/12 px-4 py-3 text-sm font-semibold text-red-100 ring-1 ring-red-300/20">{localError ?? error}</p> : null}
              {notice ? <p className="rounded-[18px] bg-emerald-400/12 px-4 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/20">{notice}</p> : null}

              <button
                type="submit"
                disabled={disabled}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cine-red text-sm font-black text-white shadow-glow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading || sessionLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {sessionLoading ? "Checking session" : isSignup ? "Create account" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
