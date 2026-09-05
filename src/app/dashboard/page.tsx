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

      const userRole = profData?.role || user.user_metadata?.role || "teacher";
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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f] text-white font-[family-name:var(--font-geist-sans)]">
        <p className="animate-pulse">Loading your portal...</p>
      </div>
    );
  }

  if (!profile) return null;

  // If user must change password, force modal
  if (profile.must_change_password) {
    return (
      <div className="login-page">
        <video className="login-video" src="/assets/hero.mp4" autoPlay loop muted playsInline />
        <div className="login-overlay" />
        <div className="login-container">
          <div className="login-title">
            <Image className="login-logo" src="/assets/logo.png" alt="StudyHub" width={90} height={90} />
            StudyHub
          </div>
          <ForcePasswordChange
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
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Top Navbar */}
      <header className="w-full border-b border-white/10 bg-[#101017]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo.png" alt="StudyHub Logo" width={38} height={38} priority />
          <span className="font-bold text-lg tracking-tight text-white">StudyHub</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-500/20 text-red-400 border border-red-500/30 capitalize">
            {profile.role} Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPasswordChangeModal(true)}
            className="text-xs sm:text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-950/40 via-red-900/20 to-neutral-900/40 border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, <span className="text-red-400">{profile.full_name}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Logged in as <strong className="text-gray-200">{profile.email}</strong>
          </p>

          {profile.role === "teacher" && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                <span>Student Capacity Enrolled</span>
                <span className="text-red-400">{activeCount} / {capacity} Students</span>
              </div>
              <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Teacher Section: Enroll Students */}
        {profile.role === "teacher" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Enrollment Form */}
            <div className="lg:col-span-1 bg-[#12121a] border border-white/10 rounded-2xl p-6 shadow-lg h-fit">
              <h2 className="text-lg font-bold text-white mb-1">Enroll New Student</h2>
              <p className="text-xs text-gray-400 mb-5">
                Generate a student code and login to email to a student or parent.
              </p>

              <form onSubmit={handleEnrollStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#181822] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="e.g. John Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Student / Parent Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-[#181822] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                </div>

                {enrollError && (
                  <p className="text-xs text-red-400 font-medium">{enrollError}</p>
                )}

                <button
                  type="submit"
                  disabled={enrolling || activeCount >= capacity}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors shadow-lg shadow-red-950/50"
                >
                  {enrolling ? "Enrolling..." : "Generate Student Invite"}
                </button>
              </form>

              {/* Newly Generated Invite Card */}
              {latestInvite && (
                <div className="mt-6 p-4 rounded-xl bg-green-950/30 border border-green-500/30 animate-fadeIn">
                  <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                    ✓ Student Enrolled Successfully!
                  </h3>
                  <div className="text-xs space-y-1 text-gray-300 font-mono mb-3">
                    <p>Code: <strong className="text-white">{latestInvite.invite_code}</strong></p>
                    <p>Temp PW: <strong className="text-white">{latestInvite.temp_password}</strong></p>
                  </div>
                  <button
                    onClick={() => copyInviteTemplate(latestInvite)}
                    className="w-full py-2 bg-green-700 hover:bg-green-600 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    {copied ? "✓ Copied to Clipboard!" : "Copy Parent Invitation Email"}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Enrolled Students List */}
            <div className="lg:col-span-2 bg-[#12121a] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Enrolled Students ({invites.length})</h2>
              </div>

              {invites.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No students enrolled yet. Use the form on the left to generate student logins.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Invite Code</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invites.map((inv) => (
                        <tr key={inv.id} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 font-medium text-white">{inv.student_name}</td>
                          <td className="py-3.5 text-gray-400 text-xs">{inv.student_email}</td>
                          <td className="py-3.5 font-mono text-xs text-red-400 font-bold">{inv.invite_code}</td>
                          <td className="py-3.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                inv.status === "claimed"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => copyInviteTemplate(inv)}
                              className="text-xs text-gray-300 hover:text-white underline"
                            >
                              Copy Email
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
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-2">Student Account Status</h2>
            <p className="text-sm text-gray-400 mb-6">
              Your account is active. Study tools and revision materials will appear here as your teacher assigns them.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Account Security</p>
              <p className="text-sm text-white font-medium mt-1">Your personal password is set.</p>
              <button
                onClick={() => setShowPasswordChangeModal(true)}
                className="mt-3 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Manual Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowPasswordChangeModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold z-10"
            >
              ✕
            </button>
            <ForcePasswordChange
              userEmail={profile.email}
              onSuccess={() => {
                setShowPasswordChangeModal(false);
                alert("Password successfully updated!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
