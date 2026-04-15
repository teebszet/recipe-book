"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function AuthModal() {
  const { showAuthModal, closeAuthModal, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(password);
    setLoading(false);

    if (!success) {
      setError("Incorrect password");
      setPassword("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#fef9f2]/80 backdrop-blur-[20px]"
        onClick={closeAuthModal}
      />
      <div className="relative bg-[#ffffff] rounded-xl p-8 w-full max-w-sm shadow-[0_8px_24px_rgba(29,28,24,0.06)]">
        <h2 className="font-serif text-xl text-[#1d1c18] mb-6">
          Contributor login
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 rounded-lg bg-[#e6e2db] text-[#1d1c18] placeholder:text-[#86736d] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#86736d]/30 transition-colors"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-[#ba1a1a]">{error}</p>
          )}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={closeAuthModal}
              className="px-4 py-2 text-sm text-[#6f331d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-6 py-2 rounded-[0.75rem] bg-[#6f331d] text-white text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
