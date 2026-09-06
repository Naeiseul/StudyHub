"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import ForcePasswordChange from "@/components/ForcePasswordChange";
import {
  parseSpreadsheetText,
  parseExcelFile,
  downloadSampleCsvTemplate,
  ParsedStudentRow,
} from "@/lib/csvParser";
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

type SectionType =
  | "dashboard"
  | "finances"
  | "modules"
  | "student-life"
  | "invoices"
  | "timetable"
  | "announcements"
  | "settings";

// --- Vector Line Icons (Ruby Theme #b82e2e) ---
function FinanceIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polyline points="3 10 12 4 21 10" />
      <line x1="6" y1="10" x2="6" y2="21" />
      <line x1="10" y1="10" x2="10" y2="21" />
      <line x1="14" y1="10" x2="14" y2="21" />
      <line x1="18" y1="10" x2="18" y2="21" />
    </svg>
  );
}

function ModulesIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="12" y1="6" x2="16" y2="6" />
      <line x1="12" y1="10" x2="16" y2="10" />
    </svg>
  );
}

function StudentLifeIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function InvoicesIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function TimetableIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="12" cy="15" r="2" />
    </svg>
  );
}

function AnnouncementsIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="9" y1="10" x2="15" y2="10" />
    </svg>
  );
}

function SettingsIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BellIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<StudentInvite[]>([]);

  // Navigation: "dashboard" (Launchpad) vs inside a section
  const [activeSection, setActiveSection] = useState<SectionType>("dashboard");

  // Selection state for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [emailSentMap, setEmailSentMap] = useState<Record<string, boolean>>({});

  // Real-time sending & status indicators
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change modal
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  // Settings: Single Student Enrollment Form
  const [singleName, setSingleName] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [autoSendSingle, setAutoSendSingle] = useState(true);
  const [enrollingSingle, setEnrollingSingle] = useState(false);
  const [singleError, setSingleError] = useState("");
  const [latestSingleInvite, setLatestSingleInvite] = useState<StudentInvite | null>(null);

  // Settings: Bulk Spreadsheet / CSV Import
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [autoSendBulk, setAutoSendBulk] = useState(true);
  const [importingBulk, setImportingBulk] = useState(false);
  const [bulkImportProgress, setBulkImportProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [bulkImportResult, setBulkImportResult] = useState<{
    successCount: number;
    failCount: number;
    errors: string[];
  } | null>(null);

  // Load sent emails history from localStorage
  const loadSentMap = useCallback((userId: string) => {
    try {
      const stored = localStorage.getItem(`studyhub_sent_invites_${userId}`);
      if (stored) {
        setEmailSentMap(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const markEmailSent = useCallback(
    (inviteId: string) => {
      setEmailSentMap((prev) => {
        const updated = { ...prev, [inviteId]: true };
        if (profile?.id) {
          try {
            localStorage.setItem(`studyhub_sent_invites_${profile.id}`, JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
        return updated;
      });
    },
    [profile?.id]
  );

  const fetchUserData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      loadSentMap(user.id);

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
  }, [router, loadSentMap]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Dispatch invitation email via Resend API
  const sendSingleInviteEmail = async (inv: StudentInvite): Promise<boolean> => {
    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "student",
        to: inv.student_email,
        name: inv.student_name,
        tempPassword: inv.temp_password,
        inviteCode: inv.invite_code,
        teacherName: profile?.full_name || "Your Educator",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to dispatch email");
    }

    markEmailSent(inv.id);
    return true;
  };

  // Row-level "Send / Resend" email click
  const handleSendRowEmail = async (inv: StudentInvite) => {
    setSendingId(inv.id);
    setStatusMessage(null);
    try {
      await sendSingleInviteEmail(inv);
      setStatusMessage({
        type: "success",
        text: `Invitation email delivered to ${inv.student_email}!`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to dispatch email";
      setStatusMessage({
        type: "error",
        text: `Failed sending to ${inv.student_email}: ${msg}`,
      });
    } finally {
      setSendingId(null);
    }
  };

  // Bulk: Send email to selected students
  const handleSendSelected = async () => {
    if (selectedIds.length === 0) return;
    setBulkSending(true);
    setStatusMessage(null);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      const inv = invites.find((item) => item.id === id);
      if (!inv) continue;

      setBulkProgress({
        current: i + 1,
        total: selectedIds.length,
        message: `Dispatching to ${inv.student_name} (${inv.student_email})...`,
      });

      try {
        await sendSingleInviteEmail(inv);
        successCount++;
      } catch {
        failCount++;
      }

      await new Promise((r) => setTimeout(r, 180));
    }

    setBulkSending(false);
    setBulkProgress(null);
    setSelectedIds([]);
    setStatusMessage({
      type: failCount === 0 ? "success" : "error",
      text: `Sent ${successCount} invitation email(s) via Resend.${
        failCount > 0 ? ` ${failCount} failed.` : ""
      }`,
    });
  };

  // Bulk: Send email to all students
  const handleSendAll = async () => {
    if (invites.length === 0) return;
    if (!confirm(`Are you sure you want to dispatch invitation emails to all ${invites.length} enrolled students?`)) {
      return;
    }

    setBulkSending(true);
    setStatusMessage(null);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < invites.length; i++) {
      const inv = invites[i];
      setBulkProgress({
        current: i + 1,
        total: invites.length,
        message: `Dispatching ${i + 1} of ${invites.length}: ${inv.student_name}...`,
      });

      try {
        await sendSingleInviteEmail(inv);
        successCount++;
      } catch {
        failCount++;
      }

      await new Promise((r) => setTimeout(r, 180));
    }

    setBulkSending(false);
    setBulkProgress(null);
    setStatusMessage({
      type: failCount === 0 ? "success" : "error",
      text: `Finished dispatching to all students: ${successCount} delivered${
        failCount > 0 ? `, ${failCount} failed` : ""
      }.`,
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === invites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invites.map((i) => i.id));
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
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Settings: Single Student Enrollment Submit
  const handleSingleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError("");
    setLatestSingleInvite(null);

    if (!singleName.trim() || !singleEmail.trim()) {
      setSingleError("Please enter both the student's name and email.");
      return;
    }

    setEnrollingSingle(true);
    try {
      const { data, error } = await supabase.rpc("create_student_invitation", {
        p_student_name: singleName.trim(),
        p_student_email: singleEmail.trim().toLowerCase(),
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

        setLatestSingleInvite(newEntry);
        setInvites((prev) => [newEntry, ...prev]);
        setSingleName("");
        setSingleEmail("");

        if (autoSendSingle) {
          try {
            await sendSingleInviteEmail(newEntry);
          } catch (mailErr) {
            console.warn("Auto-send error:", mailErr);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to enroll student.";
      setSingleError(msg);
    } finally {
      setEnrollingSingle(false);
    }
  };

  // Settings: File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setBulkImportResult(null);
    try {
      const rows = await parseExcelFile(file);
      setParsedRows(rows);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to read file.";
      alert(msg);
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Settings: Parse pasted text
  const handleParsePasteText = () => {
    if (!pasteText.trim()) return;
    const rows = parseSpreadsheetText(pasteText);
    setParsedRows(rows);
    setShowPasteBox(false);
  };

  // Settings: Execute bulk import
  const handleExecuteBulkImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const remaining = (profile?.student_capacity || 20) - invites.length;
    if (validRows.length > remaining) {
      alert(`Cannot import ${validRows.length} students. You only have ${remaining} available seat(s).`);
      return;
    }

    setImportingBulk(true);
    setBulkImportResult(null);
    setBulkImportProgress({
      current: 0,
      total: validRows.length,
      message: "Starting enrollment...",
    });

    const errors: string[] = [];
    let successCount = 0;
    const newlyCreated: StudentInvite[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setBulkImportProgress({
        current: i + 1,
        total: validRows.length,
        message: `Enrolling ${row.name} (${row.email})...`,
      });

      try {
        const { data, error } = await supabase.rpc("create_student_invitation", {
          p_student_name: row.name.trim(),
          p_student_email: row.email.trim().toLowerCase(),
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
          newlyCreated.push(newEntry);
          successCount++;

          if (autoSendBulk) {
            setBulkImportProgress({
              current: i + 1,
              total: validRows.length,
              message: `Dispatching Resend email to ${row.name}...`,
            });
            try {
              await sendSingleInviteEmail(newEntry);
            } catch (mailErr) {
              console.warn("Bulk auto-send email error:", mailErr);
            }
            await new Promise((r) => setTimeout(r, 180));
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Enrollment error";
        errors.push(`${row.name} (${row.email}): ${msg}`);
      }
    }

    setInvites((prev) => [...newlyCreated, ...prev]);
    setImportingBulk(false);
    setBulkImportProgress(null);
    setBulkImportResult({
      successCount,
      failCount: errors.length,
      errors,
    });

    if (errors.length === 0) {
      setParsedRows([]);
      setPasteText("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/home");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-slate-900 font-sans">
        <p className="text-sm text-slate-500 animate-pulse">Loading StudyHub portal...</p>
      </div>
    );
  }

  if (!profile) return null;

  // Force password change on first login
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
  const validParsedCount = parsedRows.filter((r) => r.isValid).length;

  const TILES = [
    { id: "finances", title: "Finances", icon: FinanceIcon, subtitle: "Fee account & balance" },
    { id: "modules", title: "My Modules", icon: ModulesIcon, subtitle: "Course syllabus & modules" },
    { id: "student-life", title: "Student Life", icon: StudentLifeIcon, subtitle: "Roster, student IDs & life" },
    { id: "invoices", title: "Invoices", icon: InvoicesIcon, subtitle: "Tuition billing & receipts" },
    { id: "timetable", title: "Timetable", icon: TimetableIcon, subtitle: "Schedules & test venues" },
    { id: "announcements", title: "Announcements", icon: AnnouncementsIcon, subtitle: "Institutional notices" },
    { id: "settings", title: "Settings", icon: SettingsIcon, subtitle: "Enrollment & configuration" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      {/* Universal Top Header */}
      <header className="w-full border-b border-slate-200 bg-white px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        {/* Brand */}
        <div
          onClick={() => setActiveSection("dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <Image src="/assets/logo-square.png" alt="StudyHub" width={30} height={30} className="rounded" priority />
          <span className="font-extrabold text-base text-slate-900 tracking-tight">StudyHub</span>
        </div>

        {/* Top-Right: Notification bell + User Name & Avatar */}
        <div className="flex items-center gap-4">
          <button
            title="Notifications"
            className="relative p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#b82e2e] rounded-full ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#b82e2e] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {getInitials(profile.full_name || "User")}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">{profile.full_name}</span>
              <span className="text-[10px] text-slate-400 capitalize font-medium">{profile.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-xs text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              title="Log Out"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* STAGE 1: DASHBOARD (NO SIDEBAR, FULL-WIDTH CLEAN TILE LAUNCHPAD) */}
      {activeSection === "dashboard" ? (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Select an institutional portal service</p>
          </div>

          {/* Clean Ruby Tile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TILES.map((tile) => (
              <button
                key={tile.id}
                onClick={() => {
                  setActiveSection(tile.id as SectionType);
                  setStatusMessage(null);
                }}
                className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl hover:border-[#b82e2e]/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-center cursor-pointer min-h-[200px]"
              >
                <div className="p-4 rounded-2xl bg-red-50/50 group-hover:bg-red-50 text-[#b82e2e] group-hover:scale-110 transition-all duration-200 mb-4 shadow-sm">
                  <tile.icon className="w-10 h-10" />
                </div>
                <span className="text-base font-bold text-slate-900 group-hover:text-[#b82e2e] transition-colors">
                  {tile.title}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 font-medium">{tile.subtitle}</span>
              </button>
            ))}
          </div>

          {/* Capacity Snapshot Footer */}
          {profile.role === "teacher" && (
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                <span>Enrolled Students: </span>
                <strong className="text-slate-900">{activeCount} / {capacity} seats</strong>
              </div>
              <div className="w-full sm:w-64 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#b82e2e] h-full transition-all duration-500"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          )}
        </main>
      ) : (
        /* STAGE 2: INSIDE A SECTION (LEFT SIDEBAR APPEARS) */
        <div className="flex-1 flex w-full">
          {/* Persistent Left Sidebar */}
          <aside className="w-60 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-57px)]">
            <div className="space-y-4">
              {/* Back to Launchpad button */}
              <button
                onClick={() => setActiveSection("dashboard")}
                className="flex items-center gap-2 px-3 py-2 w-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>Dashboard Launchpad</span>
              </button>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Portal Services
                </p>
                <nav className="space-y-1">
                  {TILES.map((tile) => {
                    const isActive = activeSection === tile.id;
                    return (
                      <button
                        key={tile.id}
                        onClick={() => {
                          setActiveSection(tile.id as SectionType);
                          setStatusMessage(null);
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isActive
                            ? "bg-red-50 text-[#b82e2e] font-bold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <tile.icon className={`w-4 h-4 ${isActive ? "text-[#b82e2e]" : "text-slate-400"}`} />
                        <span>{tile.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Sidebar Bottom */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <button
                onClick={() => setShowPasswordChangeModal(true)}
                className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1 w-full text-left font-medium block"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-800 px-3 py-1 w-full text-left font-medium block cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </aside>

          {/* Section Main Content */}
          <main className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <button
                    onClick={() => setActiveSection("dashboard")}
                    className="hover:text-slate-700 underline cursor-pointer"
                  >
                    Dashboard
                  </button>
                  <span>/</span>
                  <span className="capitalize text-slate-700 font-semibold">{activeSection.replace("-", " ")}</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
                  {activeSection.replace("-", " ")}
                </h1>
              </div>

              <button
                onClick={() => setActiveSection("dashboard")}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
              >
                ✕ Close to Tiles
              </button>
            </div>

            {/* Global Notification Banner */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <span>{statusMessage.text}</span>
                <button
                  onClick={() => setStatusMessage(null)}
                  className="text-xs opacity-70 hover:opacity-100 font-bold ml-3 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* SECTION 1: SETTINGS (ENROLLMENT & IMPORT) */}
            {activeSection === "settings" && (
              <div className="space-y-10">
                {/* 1. Bulk Student Import (CSV / Excel) */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Import Students (CSV / Excel)</h2>
                      <p className="text-xs text-slate-500">
                        Upload a file or paste student data to automatically enroll students and dispatch codes.
                      </p>
                    </div>
                    <button
                      onClick={downloadSampleCsvTemplate}
                      className="text-xs text-[#b82e2e] hover:underline font-semibold self-start sm:self-auto cursor-pointer"
                    >
                      Download Sample CSV
                    </button>
                  </div>

                  {/* Upload / Paste Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Drop / Upload */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#b82e2e]/50 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-slate-50/50"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv, .xlsx, .xls, .tsv, .txt"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="text-3xl text-[#b82e2e]">📄</div>
                      <p className="text-xs font-semibold text-slate-800">
                        {isParsingFile ? "Reading spreadsheet..." : "Click to select CSV or Excel file"}
                      </p>
                      <p className="text-[11px] text-slate-400">Supports .csv, .xlsx, and .xls</p>
                    </div>

                    {/* Paste Text Option */}
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 bg-white">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 mb-1">Paste From Spreadsheet</h3>
                        <p className="text-[11px] text-slate-500">
                          Copy rows directly from Excel or Google Sheets (Name and Email) and paste here.
                        </p>
                      </div>
                      {!showPasteBox ? (
                        <button
                          onClick={() => setShowPasteBox(true)}
                          className="w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Open Paste Box
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            placeholder="John Doe, john@example.com&#10;Jane Smith	jane@example.com"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-800"
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleParsePasteText}
                              className="flex-1 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                            >
                              Parse Rows
                            </button>
                            <button
                              onClick={() => setShowPasteBox(false)}
                              className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parsed Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">
                            Ready to Import ({validParsedCount} valid student{validParsedCount === 1 ? "" : "s"})
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Available capacity remaining: {capacity - activeCount} seats
                          </p>
                        </div>
                        <button
                          onClick={() => setParsedRows([])}
                          className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          Clear Table
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Name</th>
                              <th className="py-2 px-3">Email</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3 text-right"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedRows.map((row, idx) => (
                              <tr key={idx} className={row.isValid ? "" : "bg-red-50/50"}>
                                <td className="py-2 px-3 font-medium text-slate-900">{row.name || "—"}</td>
                                <td className="py-2 px-3 font-mono text-slate-600">{row.email || "—"}</td>
                                <td className="py-2 px-3">
                                  {row.isValid ? (
                                    <span className="text-emerald-700 font-semibold text-[11px]">Valid</span>
                                  ) : (
                                    <span className="text-red-600 font-semibold text-[11px]">{row.error}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <button
                                    onClick={() => setParsedRows((prev) => prev.filter((_, i) => i !== idx))}
                                    className="text-slate-400 hover:text-red-600 font-bold cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Auto-send Checkbox & Action Button */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
                        <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoSendBulk}
                            onChange={(e) => setAutoSendBulk(e.target.checked)}
                            className="rounded border-slate-300 text-[#b82e2e] focus:ring-0 cursor-pointer"
                          />
                          Automatically dispatch invitation emails via Resend to all students
                        </label>

                        <button
                          onClick={handleExecuteBulkImport}
                          disabled={importingBulk || validParsedCount === 0}
                          className="px-5 py-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          {importingBulk
                            ? "Importing & Sending..."
                            : `Import & Send All (${validParsedCount})`}
                        </button>
                      </div>

                      {/* Batch Import Progress */}
                      {importingBulk && bulkImportProgress && (
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-medium text-slate-700">
                            <span>{bulkImportProgress.message}</span>
                            <span>
                              {bulkImportProgress.current} / {bulkImportProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#b82e2e] h-full transition-all duration-200"
                              style={{
                                width: `${Math.round(
                                  (bulkImportProgress.current / bulkImportProgress.total) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Batch Result Report */}
                      {bulkImportResult && (
                        <div
                          className={`p-3 rounded-lg text-xs space-y-1 ${
                            bulkImportResult.failCount === 0
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <p className="font-bold">
                            Import complete: {bulkImportResult.successCount} student(s) enrolled successfully.
                          </p>
                          {bulkImportResult.failCount > 0 && (
                            <div>
                              <p className="font-semibold text-red-700">{bulkImportResult.failCount} failed:</p>
                              <ul className="list-disc list-inside text-[11px] text-red-600">
                                {bulkImportResult.errors.map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Single Student Enrollment Form */}
                <div className="space-y-4 max-w-lg">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-base font-bold text-slate-900">Single Student Enrollment</h2>
                    <p className="text-xs text-slate-500">
                      Enroll an individual student and dispatch their credentials directly.
                    </p>
                  </div>

                  {singleError && <p className="text-xs text-red-600 font-medium">{singleError}</p>}

                  {latestSingleInvite && (
                    <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                      <p className="font-bold text-emerald-800">
                        ✓ Enrolled: {latestSingleInvite.student_name} ({latestSingleInvite.student_email})
                      </p>
                      <p className="text-emerald-700 font-mono">
                        Code: <strong>{latestSingleInvite.invite_code}</strong> | PW:{" "}
                        <strong>{latestSingleInvite.temp_password}</strong>
                      </p>
                      <p className="text-emerald-600">
                        {autoSendSingle ? "Email dispatched via Resend." : "Ready for manual dispatch."}
                      </p>
                      <button
                        onClick={() => copyInviteTemplate(latestSingleInvite)}
                        className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded text-xs transition-colors cursor-pointer"
                      >
                        {copiedId === latestSingleInvite.id ? "Copied!" : "Copy Details"}
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSingleEnroll} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                        placeholder="e.g. John Doe"
                        value={singleName}
                        onChange={(e) => setSingleName(e.target.value)}
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
                        value={singleEmail}
                        onChange={(e) => setSingleEmail(e.target.value)}
                        required
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={autoSendSingle}
                        onChange={(e) => setAutoSendSingle(e.target.checked)}
                        className="rounded border-slate-300 text-[#b82e2e] focus:ring-0 cursor-pointer"
                      />
                      Dispatch invitation email immediately via Resend
                    </label>

                    <button
                      type="submit"
                      disabled={enrollingSingle || activeCount >= capacity}
                      className="w-full py-2 px-4 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      {enrollingSingle ? "Enrolling..." : "Enroll Student"}
                    </button>
                  </form>
                </div>

                {/* 3. Educator Account Info */}
                <div className="space-y-3 max-w-lg border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900">Educator Account Details</h3>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <strong>Account:</strong> {profile.full_name} ({profile.email})
                    </p>
                    <p>
                      <strong>Student Capacity:</strong> {capacity} active seats ({capacity - activeCount} available)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChangeModal(true)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Change Account Password
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 2: STUDENT LIFE (ROSTER, IDS, CLEARANCE) */}
            {activeSection === "student-life" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Enrolled Student Roster</h2>
                    <p className="text-xs text-slate-500">
                      Manage student numbers, view financial clearance, and dispatch credentials.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedIds.length > 0 ? (
                      <>
                        <span className="text-xs text-slate-600 font-medium mr-1">
                          {selectedIds.length} selected
                        </span>
                        <button
                          onClick={handleSendSelected}
                          disabled={bulkSending}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Send to Selected ({selectedIds.length})
                        </button>
                        <button
                          onClick={() => setSelectedIds([])}
                          className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleSendAll}
                        disabled={bulkSending || invites.length === 0}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-800 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Send All via Resend
                      </button>
                    )}
                  </div>
                </div>

                {invites.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl space-y-2">
                    <p>No students enrolled yet.</p>
                    <button
                      onClick={() => setActiveSection("settings")}
                      className="text-xs text-[#b82e2e] underline font-semibold cursor-pointer"
                    >
                      Go to Settings to enroll students &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-8">
                            <input
                              type="checkbox"
                              checked={selectedIds.length === invites.length && invites.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Student ID</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Clearance</th>
                          <th className="py-2.5 px-3">Delivery Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invites.map((inv) => {
                          const isSent = emailSentMap[inv.id];
                          const isSendingThis = sendingId === inv.id;
                          const isChecked = selectedIds.includes(inv.id);

                          return (
                            <tr
                              key={inv.id}
                              className={`transition-colors ${isChecked ? "bg-slate-50" : "hover:bg-slate-50/60"}`}
                            >
                              <td className="py-2.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelect(inv.id)}
                                  className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">{inv.student_name}</td>
                              <td className="py-2.5 px-3 font-mono text-xs text-[#b82e2e] font-semibold">
                                {inv.invite_code}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 text-xs font-mono">{inv.student_email}</td>
                              <td className="py-2.5 px-3 text-xs">
                                <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                                  Cleared
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-xs">
                                {isSendingThis ? (
                                  <span className="text-amber-600 font-medium animate-pulse">Sending...</span>
                                ) : isSent ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                                    ✓ Sent
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                    Not Sent
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right space-x-2">
                                <button
                                  onClick={() => handleSendRowEmail(inv)}
                                  disabled={isSendingThis || bulkSending}
                                  className="text-xs text-slate-900 hover:text-black font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                  {isSent ? "Resend" : "Send Email"}
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => copyInviteTemplate(inv)}
                                  className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                                >
                                  {copiedId === inv.id ? "Copied!" : "Copy"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: FINANCES */}
            {activeSection === "finances" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tuition Balance</p>
                    <p className="text-2xl font-black text-slate-900">R 0.00</p>
                    <p className="text-[11px] text-emerald-700 font-medium">✓ Financially Cleared</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">EFT Payments Logged</p>
                    <p className="text-2xl font-black text-slate-900">R 12,500.00</p>
                    <p className="text-[11px] text-slate-400 font-medium">Current academic period</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Invoices</p>
                    <p className="text-2xl font-black text-slate-900">0</p>
                    <p className="text-[11px] text-slate-400 font-medium">No overdue balances</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Financial Statements & Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => alert("Official statement generation in progress.")}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Download Fee Statement (PDF)
                    </button>
                    <button
                      onClick={() => alert("Upload dialog ready.")}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Upload EFT Proof of Payment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: INVOICES */}
            {activeSection === "invoices" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Tuition Invoices & Billing</h2>
                  <button
                    onClick={() => alert("Invoice created.")}
                    className="px-3.5 py-1.5 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    + Issue Invoice
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Invoice #</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">INV-2026-001</td>
                        <td className="py-3 px-4 font-medium text-slate-700">Academic Registration & Curriculum Fee</td>
                        <td className="py-3 px-4 text-slate-500">2026-09-01</td>
                        <td className="py-3 px-4 font-bold text-slate-900">R 4,500.00</td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[11px]">
                            Paid
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">INV-2026-002</td>
                        <td className="py-3 px-4 font-medium text-slate-700">Term 1 Assessment & Materials</td>
                        <td className="py-3 px-4 text-slate-500">2026-09-05</td>
                        <td className="py-3 px-4 font-bold text-slate-900">R 1,200.00</td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[11px]">
                            Paid
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 5: MY MODULES */}
            {activeSection === "modules" && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-slate-900">Active Academic Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#b82e2e] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                        MAT 114
                      </span>
                      <span className="text-xs text-slate-400">{activeCount} Enrolled</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Mathematics Paper 1: Calculus & Algebra</h3>
                    <p className="text-xs text-slate-500">Grade 11 & 12 Advanced Curriculum syllabus and modules.</p>
                    <button
                      onClick={() => alert("Navigating to course material.")}
                      className="text-xs text-[#b82e2e] hover:underline font-semibold"
                    >
                      View Syllabus & Notes &rarr;
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#b82e2e] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                        PHY 114
                      </span>
                      <span className="text-xs text-slate-400">{activeCount} Enrolled</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Physical Sciences: Mechanics & Waves</h3>
                    <p className="text-xs text-slate-500">Practical assessments, formula sheets, and past papers.</p>
                    <button
                      onClick={() => alert("Navigating to course material.")}
                      className="text-xs text-[#b82e2e] hover:underline font-semibold"
                    >
                      View Syllabus & Notes &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: TIMETABLE */}
            {activeSection === "timetable" && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-slate-900">Academic Schedule & Venues</h2>
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-xs font-bold text-[#b82e2e]">Monday · 08:30 - 10:00</p>
                    <p className="text-sm font-bold text-slate-900">MAT 114: Calculus Lecture</p>
                    <p className="text-xs text-slate-500">Venue: Lecture Hall 3 / Online Virtual Portal</p>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-xs font-bold text-[#b82e2e]">Wednesday · 11:00 - 12:30</p>
                    <p className="text-sm font-bold text-slate-900">PHY 114: Physics Practical</p>
                    <p className="text-xs text-slate-500">Venue: Science Lab 2</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#b82e2e]">Friday · 14:00 - 15:30</p>
                    <p className="text-sm font-bold text-slate-900">Tutorial & Assessment Revision</p>
                    <p className="text-xs text-slate-500">Venue: Seminar Room A</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: ANNOUNCEMENTS */}
            {activeSection === "announcements" && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-slate-900">Official Institutional Notices</h2>
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#b82e2e]">Academic Administration</span>
                      <span className="text-[11px] text-slate-400">Today · 09:00</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Term 1 Assessment Schedules Published</h3>
                    <p className="text-xs text-slate-600">
                      All registered students are requested to download their updated timetables and verify their test venues.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#b82e2e]">Finance Department</span>
                      <span className="text-[11px] text-slate-400">2 days ago</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">EFT Proof of Payment Verification</h3>
                    <p className="text-xs text-slate-600">
                      Please ensure all student fee deposits include the unique Student Code (STU-XXXXXX) as your deposit reference.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Manual Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-xl">
            <button
              onClick={() => setShowPasswordChangeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
            <ForcePasswordChange
              theme="light"
              userEmail={profile.email}
              onSuccess={() => {
                setShowPasswordChangeModal(false);
                alert("Password updated successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
