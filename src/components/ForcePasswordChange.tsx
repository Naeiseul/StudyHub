"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ForcePasswordChangeProps {
  userEmail?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  theme?: "light" | "dark";
}

export default function ForcePasswordChange({ userEmail, onSuccess, onCancel, theme = "dark" }: ForcePasswordChangeProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    setLoading(true);
    try {
      // 1. Update password in Supabase Auth
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false },
      });

      if (updateErr) {
        throw updateErr;
      }

      // 2. Clear must_change_password flag in profiles
      try {
        await supabase.rpc("mark_password_changed");
      } catch {
        // Fallback direct update
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase
            .from("profiles")
            .update({ must_change_password: false })
            .eq("id", user.id);
        }
      }

      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      setError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  if (theme === "light") {
    return (
      <div className="w-full text-slate-900">
        <h3 className="text-base font-bold mb-1">Set Password</h3>
        {userEmail && <p className="text-xs text-slate-500 mb-4">{userEmail}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 ${
                  shaking ? "border-red-500" : ""
                }`}
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 ${
                shaking ? "border-red-500" : ""
              }`}
              type={showPassword ? "text" : "password"}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-medium py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {loading ? "Saving..." : "Save Password"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-xs text-slate-500 hover:text-slate-800 font-medium py-1.5 transition-colors cursor-pointer text-center"
            >
              Cancel & Log Out
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="auth-card" style={{ maxWidth: "420px", width: "100%", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h3 className="auth-desc" style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>
          Set Your Personal Password
        </h3>
        <p className="auth-desc" style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
          You logged in with a temporary password. Please choose a new, permanent password to secure your account.
        </p>
        {userEmail && (
          <div className="auth-email" style={{ marginTop: "10px", fontSize: "12px" }}>
            {userEmail}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="role-card-form" style={{ padding: 0 }}>
        <div className="login-field">
          <label className="login-label" htmlFor="new-password">New Password</label>
          <div className="login-input-wrap">
            <input
              id="new-password"
              className={`login-input ${shaking ? "error" : ""}`}
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <div className="login-field">
          <label className="login-label" htmlFor="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            className={`login-input ${shaking ? "error" : ""}`}
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: "6px" }}>
          {loading ? "Saving Password..." : "Save Password & Enter Portal"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="auth-switch"
            onClick={onCancel}
            style={{ marginTop: "12px" }}
          >
            Cancel and Log Out
          </button>
        )}
      </form>
    </div>
  );
}
