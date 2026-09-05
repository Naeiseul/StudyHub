"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import ForcePasswordChange from "@/components/ForcePasswordChange";
import "../home/login.css";

interface Profile {
  id: string;
  email: string;
  role: "teacher" | "student" | "admin";
  full_name: string;
  must_change_password: boolean;
  student_capacity: number;
}

interface StudentInvite {
  id: string;
  student_name: string;
  student_email: string;
  invite_code: string;
  temp_password: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<StudentInvite[]>([]);

  // Enrollment Form State
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [latestInvite, setLatestInvite] = useState<StudentInvite | null>(null);
  const [copied, setCopied] = useState(false);

  // Password modal
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/home");
        return;
      }

      // 1. Fetch Profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const userRole = profData?.role || user.user_metadata?.role || "student";
      const mustChange = profData?.must_change_password ?? user.user_metadata?.must_change_password ?? false;

      const currentProfile: Profile = {
        id: user.id,
        email: user.email || "",
        role: userRole,
        full_name: profData?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
        must_change_password: mustChange,
        student_capacity: profData?.student_capacity || 20,
      };

      setProfile(currentProfile);

      // 2. If Teacher, fetch student invites
      if (userRole === "teacher") {
        const { data: inviteData } = await supabase
          .from("student_invites")
          .select("*")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

        if (inviteData) {
          setInvites(inviteData);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError("");
    setLatestInvite(null);

    if (!studentName.trim() || !studentEmail.trim()) {
      setEnrollError("Please enter both the student's name and email.");
      return;
    }

    setEnrolling(true);
    try {
      // Call Supabase RPC
      const { data, error } = await supabase.rpc("create_student_invitation", {
        p_student_name: studentName.trim(),
        p_student_email: studentEmail.trim().toLowerCase(),
      });

      if (error) throw error;

      if (data?.success) {
        const newEntry: StudentInvite = {
          id: data.invite_id,
          student_name: data.student_name,
          student_email: data.student_email,
          invite_code: data.invite_code,
          temp_password: data.temp_password,
          status: "pending",
          created_at: new Date().toISOString(),
        };

        setLatestInvite(newEntry);
        setInvites((prev) => [newEntry, ...prev]);
        setStudentName("");
        setStudentEmail("");

        // Automatically dispatch invitation email via Resend
        try {
          await fetch("/api/send-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "student",
              to: data.student_email,
              name: data.student_name,
              tempPassword: data.temp_password,
              inviteCode: data.invite_code,
              teacherName: profile?.full_name || "Your Educator",
            }),
          });
        } catch (mailErr) {
          console.warn("Resend email dispatch error:", mailErr);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to enroll student.";
      setEnrollError(msg);
    } finally {
      setEnrolling(false);
    }
  };

  const copyInviteTemplate = (inv: StudentInvite) => {
    const text = `Hi ${inv.student_name},

You have been enrolled in StudyHub!

Here are your portal login details:
- Website: https://studyhub.logtraq.co.za
- Email: ${inv.student_email}
- Temporary Password: ${inv.temp_password}
- Student Code: ${inv.invite_code}

Please log in at https://studyhub.logtraq.co.za using your email and temporary password, then choose your personal password to get started.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/home");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-slate-900 font-sans">
        <p className="text-sm text-slate-500 animate-pulse">Loading portal...</p>
      </div>
    );
  }

  if (!profile) return null;

  // If user must change password, force view
  if (profile.must_change_password) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Image src="/assets/logo-square.png" alt="StudyHub" width={32} height={32} className="rounded" />
            <span className="font-bold text-lg text-slate-900">StudyHub</span>
          </div>
          <ForcePasswordChange
            theme="light"
            userEmail={profile.email}
            onSuccess={() => {
              setProfile({ ...profile, must_change_password: false });
            }}
          />
        </div>
      </div>
    );
  }

  const activeCount = invites.length;
  const capacity = profile.student_capacity || 20;
  const percentUsed = Math.min(100, Math.round((activeCount / capacity) * 100));

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo-square.png" alt="StudyHub" width={28} height={28} className="rounded" priority />
          <span className="font-bold text-base text-slate-900 tracking-tight">StudyHub</span>
          <span className="text-xs text-slate-400 capitalize border-l border-slate-200 pl-3 font-medium">
            {profile.role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPasswordChangeModal(true)}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Overview Header */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome, {profile.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{profile.email}</p>

          {profile.role === "teacher" && (
            <div className="mt-4 max-w-xs">
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
                <span>Enrolled Students</span>
                <span className="text-slate-900 font-semibold">{activeCount} / {capacity}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-900 h-full transition-all duration-500"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Teacher Section: Enroll Students */}
        {profile.role === "teacher" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Enrollment Form */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Enroll Student</h2>

              <form onSubmit={handleEnrollStudent} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    placeholder="e.g. John Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Student / Parent Email *
                  </label>
                  <input
                    type="email"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                </div>

                {enrollError && (
                  <p className="text-xs text-red-600 font-medium">{enrollError}</p>
                )}

                <button
                  type="submit"
                  disabled={enrolling || activeCount >= capacity}
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  {enrolling ? "Enrolling..." : "Enroll Student"}
                </button>
              </form>

              {/* Newly Generated Invite Banner */}
              {latestInvite && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <p className="font-semibold text-emerald-800">
                    ✓ Enrolled: {latestInvite.student_name}
                  </p>
                  <p className="text-emerald-700 font-mono">
                    Code: <strong>{latestInvite.invite_code}</strong> | PW: <strong>{latestInvite.temp_password}</strong>
                  </p>
                  <button
                    onClick={() => copyInviteTemplate(latestInvite)}
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded text-xs transition-colors cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy Details"}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Enrolled Students List */}
            <div className="lg:col-span-2">
              <h2 className="text-base font-bold text-slate-900 mb-3">
                Enrolled Students ({invites.length})
              </h2>

              {invites.length === 0 ? (
                <div className="py-8 text-slate-400 text-sm">
                  No students enrolled yet.
                </div>
              ) : (
                <div className="overflow-x-auto border-t border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500 font-medium">
                        <th className="py-2.5">Student</th>
                        <th className="py-2.5">Email</th>
                        <th className="py-2.5">Invite Code</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invites.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 font-medium text-slate-900">{inv.student_name}</td>
                          <td className="py-2.5 text-slate-600 text-xs">{inv.student_email}</td>
                          <td className="py-2.5 font-mono text-xs text-slate-900 font-semibold">{inv.invite_code}</td>
                          <td className="py-2.5 text-xs text-slate-600">{inv.status}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => copyInviteTemplate(inv)}
                              className="text-xs text-slate-700 hover:text-black font-medium underline"
                            >
                              Copy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Student View */
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Student Account</h2>
            <p className="text-sm text-slate-600">Your account is active.</p>
            <button
              onClick={() => setShowPasswordChangeModal(true)}
              className="text-xs bg-slate-900 hover:bg-black text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
        )}
      </main>

      {/* Manual Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-xl">
            <button
              onClick={() => setShowPasswordChangeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold"
            >
              ✕
            </button>
            <ForcePasswordChange
              theme="light"
              userEmail={profile.email}
              onSuccess={() => {
                setShowPasswordChangeModal(false);
                alert("Password updated!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
