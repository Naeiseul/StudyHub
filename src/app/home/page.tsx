"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import ForcePasswordChange from "@/components/ForcePasswordChange";
import "./login.css";

export default function Home() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<"teacher" | "student" | null>("student");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Force password change state
  const [forcePasswordUser, setForcePasswordUser] = useState<{ email: string } | null>(null);

  // Password reset state
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Signed in status
  const [signedInUser, setSignedInUser] = useState<{ email?: string; role?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        let mustChange = session.user.user_metadata?.must_change_password ?? false;
        if (!mustChange) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("must_change_password")
            .eq("id", session.user.id)
            .maybeSingle();
          if (prof?.must_change_password) {
            mustChange = true;
          }
        }

        const isInviteOrRecovery = typeof window !== "undefined" &&
          (window.location.hash.includes("type=invite") || window.location.hash.includes("type=recovery"));

        if (mustChange || isInviteOrRecovery) {
          setForcePasswordUser({ email: session.user.email || "" });
        } else {
          setSignedInUser({
            email: session.user.email,
            role: session.user.user_metadata?.role || "student",
          });
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let mustChange = session.user.user_metadata?.must_change_password ?? false;
        if (!mustChange) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("must_change_password")
            .eq("id", session.user.id)
            .maybeSingle();
          if (prof?.must_change_password) {
            mustChange = true;
          }
        }

        const isInviteOrRecovery = event === "PASSWORD_RECOVERY" || (typeof window !== "undefined" &&
          (window.location.hash.includes("type=invite") || window.location.hash.includes("type=recovery")));

        if (mustChange || isInviteOrRecovery) {
          setForcePasswordUser({ email: session.user.email || "" });
        } else {
          setSignedInUser({
            email: session.user.email,
            role: session.user.user_metadata?.role || "student",
          });
        }
      } else {
        setSignedInUser(null);
        setForcePasswordUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const triggerError = (msg: string) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const toggleCard = (role: "teacher" | "student") => {
    setExpanded(expanded === role ? null : role);
    setError("");
  };

  const switchAuthMode = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setInviteCode("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      triggerError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr) {
        triggerError(authErr.message);
        return;
      }

      if (data?.user) {
        // If student supplied code on login or profile
        if (inviteCode.trim()) {
          try {
            await supabase.rpc("claim_student_invite", { p_invite_code: inviteCode.trim() });
          } catch (e) {
            console.warn("Invite claim check:", e);
          }
        }

        // Check if user must change password from profiles table or metadata
        const { data: profData } = await supabase
          .from("profiles")
          .select("must_change_password, role")
          .eq("id", data.user.id)
          .single();

        const mustChange = profData?.must_change_password ?? data.user.user_metadata?.must_change_password ?? false;

        if (mustChange) {
          setForcePasswordUser({ email: data.user.email || email });
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      triggerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !name) {
      triggerError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      triggerError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      triggerError("Passwords do not match.");
      return;
    }

    if (expanded === "student" && !inviteCode.trim()) {
      triggerError("An invite code is required to create a student account.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: expanded,
            invite_code: expanded === "student" ? inviteCode.trim().toUpperCase() : undefined,
          },
        },
      });

      if (authErr) {
        triggerError(authErr.message);
      } else if (data?.user) {
        // If student invite code was provided, attempt to claim it
        if (expanded === "student" && inviteCode.trim()) {
          try {
            await supabase.rpc("claim_student_invite", { p_invite_code: inviteCode.trim() });
          } catch (e) {
            console.warn("Could not auto-claim invite:", e);
          }
        }

        setError("");
        alert("Account created successfully! You can now log in.");
        switchAuthMode("login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed.";
      triggerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      triggerError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
      if (resetErr) {
        triggerError(resetErr.message);
      } else {
        setResetSent(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset link.";
      triggerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSignedInUser(null);
    setForcePasswordUser(null);
  };

  const isSignup = authMode === "signup";
  const onSubmit = isSignup ? handleSignup : handleLogin;

  return (
    <div className="login-page">
      {/* Background Video */}
      <video
        className="login-video"
        src="/assets/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        controlsList="nodownload"
      />
      
      {/* Dim overlay */}
      <div className="login-overlay" />

      {/* Main Login Container */}
      <div className="login-container">
        {/* Title and Logo */}
        <div className="login-title">
          <Image
            className="login-logo"
            src="/assets/logo.png"
            alt="StudyHub Logo"
            width={100}
            height={100}
            priority
          />
          StudyHub
        </div>

        {forcePasswordUser ? (
          <ForcePasswordChange
            userEmail={forcePasswordUser.email}
            onSuccess={() => {
              setForcePasswordUser(null);
              router.push("/dashboard");
            }}
          />
        ) : signedInUser ? (
          <div className="auth-card">
            <h3 className="auth-desc">Welcome back!</h3>
            <div className="auth-email">{signedInUser.email}</div>
            <p className="auth-desc" style={{ fontSize: "12px", opacity: 0.8 }}>
              Role: <strong style={{ textTransform: "capitalize" }}>{signedInUser.role}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
              <button className="login-btn" onClick={() => router.push("/dashboard")}>
                Go to {signedInUser.role === "teacher" ? "Teacher" : "Student"} Portal →
              </button>
              <button className="auth-switch" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        ) : resetMode ? (
          <div className="auth-card">
            <h3 className="auth-desc">Reset Your Password</h3>
            {resetSent ? (
              <>
                <p className="auth-success">
                  Password reset link sent! Check your inbox.
                </p>
                <button
                  type="button"
                  className="auth-switch"
                  onClick={() => {
                    setResetMode(false);
                    setResetSent(false);
                  }}
                >
                  Back to Log In
                </button>
              </>
            ) : (
              <form onSubmit={handleResetPassword} className="role-card-form" style={{ padding: 0 }}>
                <p className="auth-desc" style={{ fontSize: "12px" }}>
                  Enter your account email and we will send you a link to reset your password.
                </p>
                <div className="login-field">
                  <label className="login-label" htmlFor="reset-email">Email Address</label>
                  <input
                    id="reset-email"
                    className="login-input"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="login-error">{error}</div>}
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  className="auth-switch"
                  onClick={() => {
                    setResetMode(false);
                    setError("");
                  }}
                >
                  Cancel and return to Log In
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="role-cards">
            {/* Teacher Card */}
            <div className={`role-card ${expanded === "teacher" ? "expanded" : ""}`}>
              <button
                className="role-card-header"
                type="button"
                onClick={() => toggleCard("teacher")}
              >
                <span className="role-card-icon">&#128218;</span>
                <span className="role-card-label">Teacher</span>
                <span className="role-card-chevron">{expanded === "teacher" ? "▴" : "▾"}</span>
              </button>

              {expanded === "teacher" && (
                <form className="role-card-form" onSubmit={onSubmit}>
                  {isSignup && (
                    <div className="login-field">
                      <label className="login-label" htmlFor="teacher-name">Full Name</label>
                      <input
                        id="teacher-name"
                        className="login-input"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                  )}

                  <div className="login-field">
                    <label className="login-label" htmlFor="teacher-email">Email</label>
                    <input
                      id="teacher-email"
                      className={`login-input ${shaking ? "error" : ""}`}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label className="login-label" htmlFor="teacher-password">Password</label>
                    <div className="login-input-wrap">
                      <input
                        id="teacher-password"
                        className={`login-input ${shaking ? "error" : ""}`}
                        type={showPassword ? "text" : "password"}
                        placeholder={isSignup ? "At least 6 characters" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isSignup ? "new-password" : "current-password"}
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

                  {isSignup && (
                    <div className="login-field">
                      <label className="login-label" htmlFor="teacher-confirm">Confirm Password</label>
                      <div className="login-input-wrap">
                        <input
                          id="teacher-confirm"
                          className={`login-input ${shaking ? "error" : ""}`}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="login-eye"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && <div className="login-error">{error}</div>}

                  <button className="login-btn" type="submit" disabled={loading}>
                    {loading
                      ? "Please wait..."
                      : isSignup
                      ? "Create Teacher Account"
                      : "Log in as Teacher"}
                  </button>

                  {!isSignup && (
                    <button
                      type="button"
                      className="auth-switch"
                      onClick={() => setResetMode(true)}
                    >
                      Forgot password?
                    </button>
                  )}

                  <button
                    type="button"
                    className="auth-switch"
                    onClick={() => switchAuthMode(isSignup ? "login" : "signup")}
                  >
                    {isSignup
                      ? "Already have an account? Log in"
                      : "Don't have an account? Sign up"}
                  </button>
                </form>
              )}
            </div>

            {/* Student Card */}
            <div className={`role-card ${expanded === "student" ? "expanded" : ""}`}>
              <button
                className="role-card-header"
                type="button"
                onClick={() => toggleCard("student")}
              >
                <span className="role-card-icon">&#9998;</span>
                <span className="role-card-label">Student</span>
                <span className="role-card-chevron">{expanded === "student" ? "▴" : "▾"}</span>
              </button>

              {expanded === "student" && (
                <form className="role-card-form" onSubmit={onSubmit}>
                  {isSignup && (
                    <>
                      <div className="login-field">
                        <label className="login-label" htmlFor="student-invite">Invite Code</label>
                        <input
                          id="student-invite"
                          className="login-input login-input-code"
                          type="text"
                          placeholder="e.g. STU-A7X9K2"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          maxLength={10}
                          autoComplete="off"
                          required
                        />
                      </div>
                      <div className="login-field">
                        <label className="login-label" htmlFor="student-name">Full Name</label>
                        <input
                          id="student-name"
                          className="login-input"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="login-field">
                    <label className="login-label" htmlFor="student-email">Email</label>
                    <input
                      id="student-email"
                      className={`login-input ${shaking ? "error" : ""}`}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label className="login-label" htmlFor="student-password">Password</label>
                    <div className="login-input-wrap">
                      <input
                        id="student-password"
                        className={`login-input ${shaking ? "error" : ""}`}
                        type={showPassword ? "text" : "password"}
                        placeholder={isSignup ? "At least 6 characters" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isSignup ? "new-password" : "current-password"}
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

                  {isSignup && (
                    <div className="login-field">
                      <label className="login-label" htmlFor="student-confirm">Confirm Password</label>
                      <div className="login-input-wrap">
                        <input
                          id="student-confirm"
                          className={`login-input ${shaking ? "error" : ""}`}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="login-eye"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && <div className="login-error">{error}</div>}

                  <button className="login-btn" type="submit" disabled={loading}>
                    {loading
                      ? "Please wait..."
                      : isSignup
                      ? "Create Student Account"
                      : "Log in as Student"}
                  </button>

                  {!isSignup && (
                    <button
                      type="button"
                      className="auth-switch"
                      onClick={() => setResetMode(true)}
                    >
                      Forgot password?
                    </button>
                  )}

                  <button
                    type="button"
                    className="auth-switch"
                    onClick={() => switchAuthMode(isSignup ? "login" : "signup")}
                  >
                    {isSignup
                      ? "Already have an account? Log in"
                      : "Don't have an account? Sign up"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
