"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ForcePasswordChangeProps {
  userEmail?: string;
  onSuccess: () => void;
}

export default function ForcePasswordChange({ userEmail, onSuccess }: ForcePasswordChangeProps) {
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
      </form>
    </div>
  );
}
