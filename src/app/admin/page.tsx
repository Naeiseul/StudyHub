"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdminEnrollment() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/enroll-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          capacity,
          tempPassword: tempPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed.");
      }

      setResult(data);
      setFullName("");
      setEmail("");
      setTempPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to enroll teacher.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#12121a]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
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
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Enroll Paid Teacher</h2>
            <p className="text-sm text-slate-400 mt-1">
              Use this form when an educator pays via EFT. It creates their verified account in Supabase and automatically emails them their credentials via Resend.
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
                  ? `An email with their login credentials was sent to ${result.data?.email || "their inbox"} via Resend.`
                  : `Credentials generated. Email status: ${result.emailError || "Check configuration"}`}
              </p>
              <div className="bg-black/40 rounded-lg p-3 text-xs font-mono text-slate-300 space-y-1">
                <p>Email: <strong className="text-white">{result.data?.email}</strong></p>
                <p>Temp Password: <strong className="text-red-400">{result.tempPassword}</strong></p>
                <p>Student Capacity: <strong className="text-white">{result.data?.student_capacity}</strong></p>
              </div>
            </div>
          )}

          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Teacher Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mrs. Sarah Smith"
                className="w-full bg-[#181824] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Teacher Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. teacher@school.co.za"
                className="w-full bg-[#181824] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                  className="w-full bg-[#181824] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
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
                  className="w-full bg-[#181824] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
      </main>
    </div>
  );
}
