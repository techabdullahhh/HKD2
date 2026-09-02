import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/common/Button";

export function LoginPage() {
  const { login, error } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      const role = useAuthStore.getState().user?.role;
      navigate(role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
    } catch {
      // error surfaced via store
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-hkd-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-hkd-charcoal p-8 shadow-card">
        <div className="mb-8 text-center">
          <div className="font-display text-4xl tracking-wide text-hkd-pink">HASHMI KA DERA</div>
          <div className="urdu-text mt-1 text-3xl text-hkd-yellow">ہاشمی کا ڈیرہ</div>
          <div className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-hkd-cream/50">Pizza Point POS</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Username</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-hkd-black px-4 py-3.5 text-lg text-hkd-cream outline-none focus:border-hkd-pink"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-hkd-black px-4 py-3.5 text-lg text-hkd-cream outline-none focus:border-hkd-pink"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-400">{error}</div>}

          <Button type="submit" size="xl" disabled={submitting} className="mt-2 w-full">
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
