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
    if (adminPin.trim() === "0102") {
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 px-6 sm:px-10 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src="/assets/logo-square.png"
            alt="StudyHub"
            width={30}
            height={30}
            className="rounded"
          />
          <span className="text-base font-bold text-slate-900 tracking-tight">StudyHub</span>
          <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">Admin</span>
        </div>

        <Link
          href="/home"
          className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          &larr; Back to Login
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col justify-start">
        {!isUnlocked ? (
          /* PIN Protection (Flat Minimal) */
          <div className="max-w-xs w-full mx-auto py-16 text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Admin Access</h2>
            <p className="text-xs text-slate-500 mb-5">Enter security PIN</p>

            {pinError && (
              <div className="mb-4 text-xs text-red-600 font-medium">
                {pinError}
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                required
                placeholder="PIN"
                className="w-full text-center tracking-widest text-base bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-slate-800 transition-colors"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm"
              >
                Unlock
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Admin Form (Flat Minimal) */
          <div className="w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Enroll Educator</h2>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {result && (
              <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <p className="font-bold text-emerald-800 mb-1">
                  ✓ Enrolled: {result.salutation} ({result.data?.email})
                </p>
                <p className="text-emerald-700">
                  Temporary Password: <strong className="font-mono text-slate-900">{result.tempPassword}</strong>
                </p>
                <p className="text-emerald-600">
                  Email dispatch: {result.emailSent ? "Delivered" : (result.emailError || "Email pending")}
                </p>
              </div>
            )}

            <form onSubmit={handleEnroll} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Olwethuthando"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Surname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zuma"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "female" | "male")}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                  >
                    <option value="female">Female (Ms. / Mrs.)</option>
                    <option value="male">Male (Mr.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah.smith@school.co.za"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Custom Password <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#b82e2e] hover:bg-[#992525] text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <span>Enroll Educator</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
