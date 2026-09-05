"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdminEnrollment() {
  const [adminPin, setAdminPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [email, setEmail] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() === "2026") {
      setIsUnlocked(true);
      setPinError("");
    } else {
      setPinError("Incorrect Admin PIN. Access denied.");
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!firstName.trim() || !surname.trim() || !email.trim()) {
      setError("Please fill in First Name, Surname, and Email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/enroll-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          surname: surname.trim(),
          gender,
          email: email.trim().toLowerCase(),
          capacity,
          tempPassword: tempPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed.");
      }

      setResult(data);
      setFirstName("");
      setSurname("");
      setEmail("");
      setTempPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to enroll teacher.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#10121a]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src="/assets/logo-square.png"
            alt="StudyHub"
            width={36}
            height={36}
            className="rounded-lg shadow-md"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              StudyHub <span className="text-xs bg-red-600/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono uppercase">Admin</span>
            </h1>
            <p className="text-xs text-slate-400">EFT Client Enrollment & Credentials Dispatch</p>
          </div>
        </div>

        <Link
          href="/home"
          className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3.5 py-1.5 rounded-lg border border-white/10 transition-colors"
        >
          &larr; Back to Login
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center">
        {!isUnlocked ? (
          /* PIN Protection Lock Screen */
          <div className="bg-[#12141d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center max-w-md mx-auto w-full">
            <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400 font-bold text-lg">
              🔒
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Restricted Administration</h2>
            <p className="text-xs text-slate-400 mb-6">
              This area is restricted to StudyHub administrators. Enter your security PIN to unlock enrollment.
            </p>

            {pinError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
                {pinError}
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                required
                placeholder="Enter Admin PIN"
                className="w-full text-center tracking-widest text-lg bg-[#181a24] border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm"
              >
                Unlock Admin Access &rarr;
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Admin Form */
          <div className="bg-[#12141d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Enroll Paid Teacher</h2>
              <p className="text-sm text-slate-400 mt-1">
                Input the client&apos;s details after receiving their EFT payment. It registers their verified account in Supabase and automatically delivers the academic welcome email via Resend.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className="mb-6 p-5 rounded-xl bg-green-950/30 border border-green-500/30 animate-fadeIn">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  ✓ Educator Enrolled Successfully!
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  {result.emailSent
                    ? `An academic welcome email was sent to ${result.data?.email || "their inbox"} addressing them as ${result.salutation}.`
                    : `Credentials generated. Email status: ${result.emailError || "Check configuration"}`}
                </p>
                <div className="bg-black/50 rounded-lg p-3 text-xs font-mono text-slate-300 space-y-1 border border-white/5">
                  <p>Salutation: <strong className="text-white">{result.salutation}</strong></p>
                  <p>Email: <strong className="text-white">{result.data?.email}</strong></p>
                  <p>Temp Password: <strong className="text-red-400">{result.tempPassword}</strong></p>
                  <p>Student Capacity: <strong className="text-white">{result.data?.student_capacity}</strong></p>
                </div>
              </div>
            )}

            <form onSubmit={handleEnroll} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Olwethuthando"
                    className="w-full bg-[#181a24] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Surname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zuma"
                    className="w-full bg-[#181a24] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "female" | "male")}
                    className="w-full bg-[#181a24] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="female">Female (Ms. / Mrs.)</option>
                    <option value="male">Male (Mr.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah.smith@school.co.za"
                    className="w-full bg-[#181a24] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    className="w-full bg-[#181a24] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Password <span className="text-slate-500 lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    className="w-full bg-[#181a24] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Enrolling & Sending Email...</span>
                  </>
                ) : (
                  <span>Enroll Teacher & Dispatch Welcome Email &rarr;</span>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
