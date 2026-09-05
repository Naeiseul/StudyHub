"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import "./login.css";

export default function Home() {
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

  // Password reset state
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Signed in status
  const [signedInUser, setSignedInUser] = useState<{ email?: string; role?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSignedInUser({
          email: session.user.email,
          role: session.user.user_metadata?.role || "student",
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSignedInUser({
          email: session.user.email,
          role: session.user.user_metadata?.role || "student",
        });
      } else {
        setSignedInUser(null);
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
        email,
        password,
      });

      if (authErr) {
        triggerError(authErr.message);
      } else if (data?.user) {
        setSignedInUser({
          email: data.user.email,
          role: expanded || "student",
        });
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
        email,
        password,
        options: {
          data: {
            name,
            role: expanded,
            invite_code: expanded === "student" ? inviteCode.trim().toUpperCase() : undefined,
          },
        },
      });

      if (authErr) {
        triggerError(authErr.message);
      } else if (data?.user) {
        setError("");
        alert("Account created successfully! Please check your email to verify your account.");
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
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail);
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

        {signedInUser ? (
          <div className="auth-card">
            <h3 className="auth-desc">Welcome back!</h3>
            <div className="auth-email">{signedInUser.email}</div>
            <p className="auth-desc" style={{ fontSize: "12px", opacity: 0.8 }}>
              Role: <strong style={{ textTransform: "capitalize" }}>{signedInUser.role}</strong>
            </p>
            <button className="login-btn" onClick={handleLogout}>
              Log Out
            </button>
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
                          placeholder="e.g. KT7X2M"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          maxLength={6}
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
