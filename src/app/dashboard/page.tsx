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
import {
  DOCUMENT_TEMPLATES,
  DocumentType,
  generateDocumentHtml,
} from "@/lib/documentTemplates";
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

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  studentName: string;
  studentEmail: string;
  description: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

// Vector Line Icons (Ruby Theme #b82e2e)
function InvoiceIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
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

function DocumentsIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
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

function StudentsGroupIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<StudentInvite[]>([]);

  // Navigation State
  const [activeDepartment, setActiveDepartment] = useState<string>("dashboard");
  const [activeSubPage, setActiveSubPage] = useState<string>("overview");

  // Selection state for student roster
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [emailSentMap, setEmailSentMap] = useState<Record<string, boolean>>({});

  // Real-time sending indicators
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change modal
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  // Student official statement modal
  const [showStudentInvoiceModal, setShowStudentInvoiceModal] = useState(false);

  // --- Document Generator State (Teacher Operational Feature) ---
  const [docStudentId, setDocStudentId] = useState<string>("");
  const [docType, setDocType] = useState<DocumentType>("parent_consent");
  const [docExtraNotes, setDocExtraNotes] = useState<string>("");
  const [generatedDocPreview, setGeneratedDocPreview] = useState<string>("");

  // --- Invoice Generator State (Teacher Operational Feature) ---
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: "inv-1",
      invoiceNo: "INV-2026-001",
      studentName: "John Doe",
      studentEmail: "john.doe@example.com",
      description: "Mathematics Grade 12 - Term 1 Tuition",
      amount: 2500,
      date: "2026-09-01",
      dueDate: "2026-09-15",
      status: "paid",
    },
    {
      id: "inv-2",
      invoiceNo: "INV-2026-002",
      studentName: "Jane Smith",
      studentEmail: "jane.smith@example.com",
      description: "Physical Sciences Grade 12 - Term 1 Tuition",
      amount: 2500,
      date: "2026-09-05",
      dueDate: "2026-09-20",
      status: "pending",
    },
  ]);
  const [invStudentId, setInvStudentId] = useState("");
  const [invDescription, setInvDescription] = useState("");
  const [invAmount, setInvAmount] = useState<number>(2500);
  const [invDueDate, setInvDueDate] = useState<string>("2026-09-25");

  // Single Student Enrollment Form State
  const [singleName, setSingleName] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [autoSendSingle, setAutoSendSingle] = useState(true);
  const [enrollingSingle, setEnrollingSingle] = useState(false);
  const [singleError, setSingleError] = useState("");
  const [latestSingleInvite, setLatestSingleInvite] = useState<StudentInvite | null>(null);

  // Bulk Spreadsheet / CSV Import State
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

  // Load sent email statuses from localStorage
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

      // Fetch Profile
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

      // Fetch student invites if teacher
      if (userRole === "teacher") {
        const { data: inviteData } = await supabase
          .from("student_invites")
          .select("*")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

        if (inviteData) {
          setInvites(inviteData);
          if (inviteData.length > 0 && !docStudentId) {
            setDocStudentId(inviteData[0].id);
            setInvStudentId(inviteData[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [router, loadSentMap, docStudentId]);

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
      text: `Sent ${successCount} invitation email(s) via Resend.${failCount > 0 ? ` ${failCount} failed.` : ""}`,
    });
  };

  const handleSendAll = async () => {
    if (invites.length === 0) return;
    if (!confirm(`Dispatch invitation emails to all ${invites.length} enrolled students?`)) return;

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
      text: `Finished: ${successCount} delivered${failCount > 0 ? `, ${failCount} failed` : ""}.`,
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
    const text = `Hi ${inv.student_name},\n\nYou have been enrolled in StudyHub!\n\nPortal login details:\n- Website: https://studyhub.logtraq.co.za\n- Email: ${inv.student_email}\n- Temporary Password: ${inv.temp_password}\n- Student Code: ${inv.invite_code}\n\nPlease log in at https://studyhub.logtraq.co.za to access your student portal.`;
    navigator.clipboard.writeText(text);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Single Student Enrollment Submit
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

  // File upload handler
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

  const handleParsePasteText = () => {
    if (!pasteText.trim()) return;
    const rows = parseSpreadsheetText(pasteText);
    setParsedRows(rows);
    setShowPasteBox(false);
  };

  // Bulk Import Execution
  const handleExecuteBulkImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const remaining = (profile?.student_capacity || 20) - invites.length;
    if (validRows.length > remaining) {
      alert(`Cannot import ${validRows.length} students. You only have ${remaining} seat(s) remaining.`);
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

  // Document Generator Execution
  const handleGenerateDocument = () => {
    const targetStudent = invites.find((i) => i.id === docStudentId) || {
      student_name: "Selected Student",
      invite_code: "STU-2026-001",
      student_email: "student@example.com",
    };

    const docHtml = generateDocumentHtml(
      docType,
      {
        name: targetStudent.student_name,
        studentId: targetStudent.invite_code,
        email: targetStudent.student_email,
        monthlyFee: 1500,
        totalDebt: 12000,
        paidAmount: 10000,
      },
      {
        institutionName: "StudyHub Education",
        educatorName: profile?.full_name || "Lead Educator",
        contactEmail: profile?.email || "info@logtraq.co.za",
        website: "studyhub.logtraq.co.za",
      },
      docExtraNotes
    );

    setGeneratedDocPreview(docHtml);
  };

  // Bulletproof print using hidden iframe to bypass popup blockers
  const printDocument = (contentHtml?: string) => {
    const htmlToPrint = typeof contentHtml === "string" && contentHtml ? contentHtml : generatedDocPreview;
    if (!htmlToPrint) return;

    let iframe = document.getElementById("studyhub-print-frame") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "studyhub-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Invoice: Student Account</title>
            <base href="${window.location.origin}/" />
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, Helvetica, sans-serif; }
              @media print {
                body { margin: 0; padding: 10mm; }
                @page { margin: 10mm; size: A4; }
              }
            </style>
          </head>
          <body>
            ${htmlToPrint}
          </body>
        </html>
      `);
      frameDoc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    }
  };

  // Direct file download to user's Downloads folder
  const downloadDocument = (contentHtml?: string, fileName = "Invoice_Student_Account.html") => {
    const htmlToDownload = typeof contentHtml === "string" && contentHtml ? contentHtml : generatedDocPreview;
    if (!htmlToDownload) return;

    const fullHtml = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice: Student Account</title>
        <base href="${window.location.origin}/" />
        <style>
          body { margin: 0; padding: 30px; font-family: Arial, Helvetica, sans-serif; background: #f8fafc; }
          .sheet { max-width: 820px; margin: 0 auto; background: #ffffff; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; border-radius: 8px; }
          @media print {
            body { padding: 0; background: #ffffff; }
            .sheet { box-shadow: none; border: none; padding: 10mm; }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          ${htmlToDownload}
        </div>
      </body>
    </html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStudentInvoiceHtml = () => {
    return generateDocumentHtml(
      "student_invoice",
      {
        name: profile?.full_name || "Student Account",
        studentId: "u23489102",
        email: profile?.email || "student@up.ac.za",
        programme: "12134002  BSc in Computer Science",
        address: "Hatfield Campus, Pretoria, Gauteng, 0028",
      },
      {
        institutionName: "StudyHub Education",
        educatorName: "Academic Administration",
        contactEmail: "ssc@studyhub.logtraq.co.za",
        website: "www.studyhub.logtraq.co.za",
        logoUrl: "/assets/logo.png",
      }
    );
  };

  // Invoice Generator Execution
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = invites.find((i) => i.id === invStudentId) || {
      student_name: "Enrolled Student",
      student_email: "student@example.com",
    };

    const newInv: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNo: `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`,
      studentName: targetStudent.student_name,
      studentEmail: targetStudent.student_email,
      description: invDescription.trim() || "Monthly Tuition & Materials Fee",
      amount: Number(invAmount) || 2500,
      date: new Date().toISOString().split("T")[0],
      dueDate: invDueDate,
      status: "pending",
    };

    setInvoices([newInv, ...invoices]);
    setInvDescription("");
    setStatusMessage({
      type: "success",
      text: `Invoice ${newInv.invoiceNo} issued for ${newInv.studentName} (R ${newInv.amount}). Ready for Paystack receipt.`,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/home");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-slate-900 font-sans">
        <p className="text-sm text-slate-500 animate-pulse">Loading StudyHub Portal...</p>
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

  const isTeacher = profile.role === "teacher" || profile.role === "admin";
  const activeCount = invites.length;
  const capacity = profile.student_capacity || 20;
  const percentUsed = Math.min(100, Math.round((activeCount / capacity) * 100));
  const validParsedCount = parsedRows.filter((r) => r.isValid).length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // --- Tile Definitions for Launchpads ---
  const TEACHER_TILES = [
    { id: "students", title: "Students", icon: StudentsGroupIcon, subtitle: "Roster, enrolments & attendance" },
    { id: "finance", title: "Finance", icon: FinanceIcon, subtitle: "Fee ledger & Paystack collections" },
    { id: "invoices", title: "Invoices", icon: InvoiceIcon, subtitle: "Issue invoices & billing records" },
    { id: "documents", title: "Documents", icon: DocumentsIcon, subtitle: "Consent forms, letters & templates" },
    { id: "timetable", title: "Timetable", icon: TimetableIcon, subtitle: "Calendar, sessions & live links" },
    { id: "academic-overview", title: "Academic Overview", icon: ModulesIcon, subtitle: "Modules, marks & Moodle" },
    { id: "announcements", title: "Announcements", icon: AnnouncementsIcon, subtitle: "Institutional broadcasts" },
    { id: "settings", title: "Settings", icon: SettingsIcon, subtitle: "Capacity, profile & bulk import" },
  ];

  const STUDENT_TILES = [
    { id: "finance", title: "Finances", icon: FinanceIcon, subtitle: "Fee balance, payments & clearance" },
    { id: "invoices", title: "Invoices", icon: InvoiceIcon, subtitle: "Invoice: Student Account & statements" },
    { id: "modules", title: "My Modules", icon: ModulesIcon, subtitle: "Enrolled courses & Moodle classroom" },
    { id: "student-life", title: "Student Life", icon: StudentLifeIcon, subtitle: "Student ID, profile & registration" },
    { id: "timetable", title: "Timetable", icon: TimetableIcon, subtitle: "Weekly schedule & live class links" },
    { id: "announcements", title: "Announcements", icon: AnnouncementsIcon, subtitle: "Official notices & dates" },
    { id: "settings", title: "Settings", icon: SettingsIcon, subtitle: "Account preferences & password" },
  ];

  const activeTiles = isTeacher ? TEACHER_TILES : STUDENT_TILES;

  // --- Department Sidebar Menus ---
  const TEACHER_MENUS: Record<string, { id: string; label: string }[]> = {
    students: [
      { id: "all_students", label: "All Students" },
      { id: "enrolments", label: "Enrolments & Bulk Import" },
      { id: "profiles", label: "Student Profiles" },
      { id: "attendance", label: "Attendance & Status" },
    ],
    finance: [
      { id: "overview", label: "Fee Ledger" },
      { id: "payments", label: "Payments (Paystack)" },
      { id: "statements", label: "Statements" },
    ],
    invoices: [
      { id: "invoices_list", label: "All Invoices" },
      { id: "generate_invoice", label: "Issue New Invoice" },
    ],
    documents: [
      { id: "generate_doc", label: "Generate Document" },
      { id: "consent_forms", label: "Consent Forms" },
      { id: "enrolment_letters", label: "Enrolment Letters" },
      { id: "academic_letters", label: "Academic Letters" },
      { id: "templates", label: "Templates Library" },
    ],
    timetable: [
      { id: "calendar", label: "Calendar" },
      { id: "upcoming_sessions", label: "Upcoming Sessions" },
      { id: "schedule_class", label: "Schedule a Class" },
    ],
    "academic-overview": [
      { id: "modules_list", label: "Teaching Modules" },
      { id: "results", label: "Results Overview" },
      { id: "moodle_link", label: "Open Moodle Classroom ↗" },
    ],
    announcements: [
      { id: "all_announcements", label: "All Announcements" },
      { id: "create_broadcast", label: "New Broadcast" },
    ],
    settings: [
      { id: "profile_settings", label: "Institution & Profile" },
      { id: "capacity_settings", label: "Student Capacity" },
      { id: "security", label: "Password & Security" },
    ],
  };

  const STUDENT_MENUS: Record<string, { id: string; label: string }[]> = {
    finance: [
      { id: "overview", label: "Account Overview" },
      { id: "balance", label: "Account Balance" },
      { id: "invoices", label: "My Invoices" },
      { id: "statements", label: "Statements" },
      { id: "payment_history", label: "Payment History" },
    ],
    modules: [
      { id: "current_modules", label: "Current Modules" },
      { id: "overview", label: "Module Overview" },
      { id: "academic_results", label: "Academic Results" },
      { id: "open_classroom", label: "Open Classroom (Moodle) ↗" },
    ],
    "student-life": [
      { id: "my_profile", label: "My Profile" },
      { id: "student_id", label: "Student ID Card" },
      { id: "proof_of_reg", label: "Proof of Registration" },
      { id: "support", label: "Student Support" },
    ],
    timetable: [
      { id: "weekly", label: "Weekly Timetable" },
      { id: "upcoming_classes", label: "Upcoming Classes & Links" },
      { id: "test_dates", label: "Test & Exam Dates" },
    ],
    announcements: [
      { id: "all", label: "All Announcements" },
      { id: "notices", label: "Important Notices" },
    ],
    settings: [
      { id: "account", label: "Account Settings" },
      { id: "password", label: "Password & Security" },
    ],
  };

  const currentMenus = isTeacher ? TEACHER_MENUS : STUDENT_MENUS;
  const activeSubMenuItems = currentMenus[activeDepartment] || [];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      {/* Universal Top Header */}
      <header className="w-full border-b border-slate-200 bg-white px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div
          onClick={() => {
            setActiveDepartment("dashboard");
            setStatusMessage(null);
          }}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <Image src="/assets/logo-square.png" alt="StudyHub" width={30} height={30} className="rounded" priority />
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">StudyHub</span>
            <span className="text-[10px] text-[#b82e2e] font-bold tracking-wider uppercase block -mt-1">
              {isTeacher ? "Tutoring Operations Portal" : "Student Self-Service Portal"}
            </span>
          </div>
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

      {/* STAGE 1: DASHBOARD LAUNCHPAD (NO SIDEBAR) */}
      {activeDepartment === "dashboard" ? (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isTeacher ? "Institution Operations Launchpad" : "Student Center Launchpad"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isTeacher
                ? "Select an operational department to manage your tutoring institution"
                : "Select an institutional service to view your academic and financial records"}
            </p>
          </div>

          {/* Clean Ruby Tile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => {
                  setActiveDepartment(tile.id);
                  const firstSub = (currentMenus[tile.id] || [])[0]?.id || "overview";
                  setActiveSubPage(firstSub);
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

          {/* Teacher Operational Snapshot */}
          {isTeacher && (
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                <span>Tutoring Capacity: </span>
                <strong className="text-slate-900">{activeCount} / {capacity} Enrolled Students</strong>
              </div>
              <div className="w-full sm:w-64 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#b82e2e] h-full transition-all duration-500" style={{ width: `${percentUsed}%` }} />
              </div>
            </div>
          )}
        </main>
      ) : (
        /* STAGE 2: INSIDE A DEPARTMENT (LEFT SIDEBAR ACTIVATED) */
        <div className="flex-1 flex w-full">
          {/* Department-Specific Left Sidebar */}
          <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-57px)]">
            <div className="space-y-4">
              {/* Back to Launchpad button */}
              <button
                onClick={() => setActiveDepartment("dashboard")}
                className="flex items-center gap-2 px-3 py-2 w-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>Dashboard Launchpad</span>
              </button>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold text-[#b82e2e] uppercase tracking-wider px-3 mb-2">
                  {activeDepartment.replace("-", " ")}
                </p>

                <nav className="space-y-1">
                  {activeSubMenuItems.map((item) => {
                    const isMoodleLink = item.label.includes("Moodle");
                    const isActive = activeSubPage === item.id;

                    if (isMoodleLink) {
                      return (
                        <a
                          key={item.id}
                          href="https://moodle.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                        >
                          <span>{item.label}</span>
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </a>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSubPage(item.id);
                          setStatusMessage(null);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isActive
                            ? "bg-red-50 text-[#b82e2e] font-bold border-r-2 border-[#b82e2e]"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Other Department Quick Jumps */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Departments
                </p>
                <div className="space-y-0.5">
                  {activeTiles
                    .filter((t) => t.id !== activeDepartment)
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveDepartment(t.id);
                          const first = (currentMenus[t.id] || [])[0]?.id || "overview";
                          setActiveSubPage(first);
                          setStatusMessage(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 w-full text-left rounded hover:bg-slate-50 block transition-colors cursor-pointer"
                      >
                        {t.title}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-slate-100 pt-3 space-y-1">
              <button
                onClick={() => setShowPasswordChangeModal(true)}
                className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1 w-full text-left font-medium block cursor-pointer"
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

          {/* Department Main Workspace */}
          <main className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <button onClick={() => setActiveDepartment("dashboard")} className="hover:text-slate-700 underline cursor-pointer">
                    Dashboard
                  </button>
                  <span>/</span>
                  <span className="capitalize text-slate-500 font-semibold">{activeDepartment.replace("-", " ")}</span>
                  <span>/</span>
                  <span className="capitalize text-slate-900 font-bold">{activeSubPage.replace("_", " ")}</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
                  {activeSubPage.replace("_", " ")}
                </h1>
              </div>

              <button
                onClick={() => setActiveDepartment("dashboard")}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
              >
                ✕ Close to Launchpad
              </button>
            </div>

            {/* Global Notification */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <span>{statusMessage.text}</span>
                <button onClick={() => setStatusMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold ml-3 cursor-pointer">
                  ✕
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TEACHER DEPARTMENT VIEWS */}
            {/* ========================================================================= */}

            {/* --- TEACHER: STUDENTS DEPARTMENT --- */}
            {isTeacher && activeDepartment === "students" && (
              <div className="space-y-6">
                {activeSubPage === "all_students" || activeSubPage === "overview" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Student Directory ({invites.length})</h2>
                        <p className="text-xs text-slate-500">Single source of student profiles, registration codes, and status.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedIds.length > 0 ? (
                          <>
                            <span className="text-xs text-slate-600 font-medium mr-1">{selectedIds.length} selected</span>
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
                          onClick={() => setActiveSubPage("enrolments")}
                          className="text-xs text-[#b82e2e] underline font-semibold cursor-pointer"
                        >
                          Go to Enrolments & Bulk Import &rarr;
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
                              <th className="py-2.5 px-3">Fee Status</th>
                              <th className="py-2.5 px-3">Invite Email</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {invites.map((inv) => {
                              const isSent = emailSentMap[inv.id];
                              const isSendingThis = sendingId === inv.id;
                              const isChecked = selectedIds.includes(inv.id);

                              return (
                                <tr key={inv.id} className={`transition-colors ${isChecked ? "bg-slate-50" : "hover:bg-slate-50/60"}`}>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleSelect(inv.id)}
                                      className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-slate-900">{inv.student_name}</td>
                                  <td className="py-2.5 px-3 font-mono text-xs text-[#b82e2e] font-semibold">{inv.invite_code}</td>
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
                ) : activeSubPage === "enrolments" ? (
                  /* Enrolments & Bulk Import */
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <h2 className="text-base font-bold text-slate-900">Bulk Student Import (CSV / Excel)</h2>
                          <p className="text-xs text-slate-500">Upload spreadsheet or paste rows to enroll students automatically.</p>
                        </div>
                        <button
                          onClick={downloadSampleCsvTemplate}
                          className="text-xs text-[#b82e2e] hover:underline font-semibold cursor-pointer"
                        >
                          Download Sample CSV
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-[#b82e2e]/50 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-slate-50/50"
                        >
                          <input ref={fileInputRef} type="file" accept=".csv, .xlsx, .xls, .tsv, .txt" className="hidden" onChange={handleFileUpload} />
                          <div className="text-3xl text-[#b82e2e]">📄</div>
                          <p className="text-xs font-semibold text-slate-800">
                            {isParsingFile ? "Reading spreadsheet..." : "Click to select CSV or Excel file"}
                          </p>
                          <p className="text-[11px] text-slate-400">Supports .csv, .xlsx, and .xls</p>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 bg-white">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 mb-1">Paste From Spreadsheet</h3>
                            <p className="text-[11px] text-slate-500">Copy rows directly from Excel or Google Sheets (Name and Email).</p>
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
                              <p className="text-[11px] text-slate-500">Remaining capacity: {capacity - activeCount} seats</p>
                            </div>
                            <button onClick={() => setParsedRows([])} className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer">
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

                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
                            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={autoSendBulk}
                                onChange={(e) => setAutoSendBulk(e.target.checked)}
                                className="rounded border-slate-300 text-[#b82e2e] focus:ring-0 cursor-pointer"
                              />
                              Automatically dispatch invitation emails via Resend
                            </label>

                            <button
                              onClick={handleExecuteBulkImport}
                              disabled={importingBulk || validParsedCount === 0}
                              className="px-5 py-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              {importingBulk ? "Importing & Sending..." : `Import & Send All (${validParsedCount})`}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Single Student Enrollment Form */}
                    <div className="space-y-4 max-w-lg border-t border-slate-200 pt-6">
                      <h2 className="text-base font-bold text-slate-900">Single Student Enrollment</h2>
                      {singleError && <p className="text-xs text-red-600 font-medium">{singleError}</p>}
                      <form onSubmit={handleSingleEnroll} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Student Full Name *</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                            placeholder="e.g. John Doe"
                            value={singleName}
                            onChange={(e) => setSingleName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Student / Parent Email *</label>
                          <input
                            type="email"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
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
                  </div>
                ) : (
                  /* Profiles / Attendance placeholder views */
                  <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">Student Attendance & Academic Logs</h3>
                    <p className="text-xs text-slate-500">
                      Attendance records and module results synchronized with official StudyHub rosters.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-600">
                      {invites.length} student(s) currently marked present for ongoing curriculum period.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- TEACHER: FINANCE & INVOICE GENERATOR --- */}
            {/* --- TEACHER: DEDICATED INVOICES TILE --- */}
            {isTeacher && activeDepartment === "invoices" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Student Invoices &amp; Billing</h2>
                    <p className="text-xs text-slate-500">Issue official invoices, track clearance status, and export UP-style student accounts.</p>
                  </div>
                  <button
                    onClick={() => setActiveSubPage(activeSubPage === "generate_invoice" ? "invoices_list" : "generate_invoice")}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {activeSubPage === "generate_invoice" ? "View Invoices Table" : "+ Issue New Invoice"}
                  </button>
                </div>

                {activeSubPage === "generate_invoice" ? (
                  /* Interactive Invoice Generator */
                  <div className="max-w-xl space-y-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Generate Student Invoice</h2>
                      <p className="text-xs text-slate-500">Create a tuition invoice prepared for automated Paystack payment reconciliation.</p>
                    </div>

                    <form onSubmit={handleCreateInvoice} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
                        <select
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          value={invStudentId}
                          onChange={(e) => setInvStudentId(e.target.value)}
                          required
                        >
                          {invites.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.student_name} ({inv.invite_code}) &bull; {inv.student_email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Invoice Item Description *</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          placeholder="e.g. Mathematics Grade 12 - Term 1 Tuition"
                          value={invDescription}
                          onChange={(e) => setInvDescription(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Amount (ZAR) *</label>
                          <input
                            type="number"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                            value={invAmount}
                            onChange={(e) => setInvAmount(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Due Date *</label>
                          <input
                            type="date"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                            value={invDueDate}
                            onChange={(e) => setInvDueDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#b82e2e] hover:bg-[#a02626] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Issue Invoice &bull; Notify Student
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Invoices Table */
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">All Issued Student Invoices</h3>
                      <span className="text-xs font-bold text-slate-500">{invoices.length} Total</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="py-2.5 px-4">Invoice #</th>
                            <th className="py-2.5 px-4">Student</th>
                            <th className="py-2.5 px-4">Description</th>
                            <th className="py-2.5 px-4">Due Date</th>
                            <th className="py-2.5 px-4">Amount</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.map((inv) => (
                            <tr key={inv.id}>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                              <td className="py-3 px-4 font-medium text-slate-800">{inv.studentName}</td>
                              <td className="py-3 px-4 text-slate-600">{inv.description}</td>
                              <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">R {inv.amount.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                                    inv.status === "paid"
                                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                      : "text-amber-700 bg-amber-50 border border-amber-200"
                                  }`}
                                >
                                  {inv.status === "paid" ? "Paid" : "Pending"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      const docHtml = generateDocumentHtml(
                                        "student_invoice",
                                        {
                                          name: inv.studentName,
                                          studentId: "u23489102",
                                          email: inv.studentEmail,
                                          monthlyFee: inv.amount,
                                          totalDebt: 12000,
                                          paidAmount: inv.status === "paid" ? 12000 : 11010,
                                        },
                                        {
                                          institutionName: "StudyHub Education",
                                          educatorName: profile?.full_name || "Lead Educator",
                                          contactEmail: profile?.email || "info@logtraq.co.za",
                                          website: "studyhub.logtraq.co.za",
                                        }
                                      );
                                      printDocument(docHtml);
                                    }}
                                    className="px-2.5 py-1 border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px] font-bold rounded transition-colors cursor-pointer"
                                  >
                                    Print
                                  </button>
                                  <button
                                    onClick={() => {
                                      const docHtml = generateDocumentHtml(
                                        "student_invoice",
                                        {
                                          name: inv.studentName,
                                          studentId: "u23489102",
                                          email: inv.studentEmail,
                                          monthlyFee: inv.amount,
                                          totalDebt: 12000,
                                          paidAmount: inv.status === "paid" ? 12000 : 11010,
                                        },
                                        {
                                          institutionName: "StudyHub Education",
                                          educatorName: profile?.full_name || "Lead Educator",
                                          contactEmail: profile?.email || "info@logtraq.co.za",
                                          website: "studyhub.logtraq.co.za",
                                        }
                                      );
                                      downloadDocument(docHtml, `${inv.invoiceNo}.html`);
                                    }}
                                    className="px-2 py-1 border border-slate-200 hover:border-slate-400 text-slate-600 text-[11px] rounded transition-colors cursor-pointer"
                                    title="Download File"
                                  >
                                    &darr;
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isTeacher && activeDepartment === "finance" && (
              <div className="space-y-6">
                {activeSubPage === "generate_invoice" ? (
                  /* Interactive Invoice Generator */
                  <div className="max-w-xl space-y-5 bg-white border border-slate-200 rounded-xl p-6">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Generate Student Invoice</h2>
                      <p className="text-xs text-slate-500">Create a tuition invoice prepared for automated Paystack payment reconciliation.</p>
                    </div>

                    <form onSubmit={handleCreateInvoice} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
                        <select
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          value={invStudentId}
                          onChange={(e) => setInvStudentId(e.target.value)}
                          required
                        >
                          {invites.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.student_name} ({inv.invite_code}) · {inv.student_email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Invoice Item Description *</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          placeholder="e.g. Mathematics Grade 12 - Term 1 Tuition"
                          value={invDescription}
                          onChange={(e) => setInvDescription(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Amount (ZAR) *</label>
                          <input
                            type="number"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                            value={invAmount}
                            onChange={(e) => setInvAmount(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Due Date *</label>
                          <input
                            type="date"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                            value={invDueDate}
                            onChange={(e) => setInvDueDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800">Payment Gateway Integration:</p>
                        <p>When Paystack is activated, a secure payment link will automatically be attached to this invoice.</p>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#b82e2e] hover:bg-[#a02626] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Generate & Record Invoice
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Finance Overview / Invoices List */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fees Billed</p>
                        <p className="text-2xl font-black text-slate-900">
                          R {invoices.reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">All student tuition charges</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid / Reconciled</p>
                        <p className="text-2xl font-black text-emerald-700">
                          R {invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium">EFT & Paystack verified</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</p>
                        <p className="text-2xl font-black text-[#b82e2e]">
                          R {invoices.filter((i) => i.status !== "paid").reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-red-600 font-medium">Pending student payments</p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Institutional Invoices</h3>
                        <button
                          onClick={() => setActiveSubPage("generate_invoice")}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          + New Invoice
                        </button>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-4">Invoice #</th>
                            <th className="py-2.5 px-4">Student</th>
                            <th className="py-2.5 px-4">Description</th>
                            <th className="py-2.5 px-4">Due Date</th>
                            <th className="py-2.5 px-4">Amount</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.map((inv) => (
                            <tr key={inv.id}>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                              <td className="py-3 px-4 font-medium text-slate-800">{inv.studentName}</td>
                              <td className="py-3 px-4 text-slate-600">{inv.description}</td>
                              <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">R {inv.amount.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                                    inv.status === "paid"
                                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                      : "text-amber-700 bg-amber-50 border border-amber-200"
                                  }`}
                                >
                                  {inv.status === "paid" ? "Paid" : "Pending"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    const docHtml = generateDocumentHtml(
                                      "student_invoice",
                                      {
                                        name: inv.studentName,
                                        studentId: "STU-2026-001",
                                        email: inv.studentEmail,
                                        monthlyFee: inv.amount,
                                        totalDebt: 12000,
                                        paidAmount: inv.status === "paid" ? 12000 : 10000,
                                      },
                                      {
                                        institutionName: "StudyHub Education",
                                        educatorName: profile?.full_name || "Lead Educator",
                                        contactEmail: profile?.email || "info@logtraq.co.za",
                                        website: "studyhub.logtraq.co.za",
                                      }
                                    );
                                    printDocument(docHtml);
                                  }}
                                  className="px-2.5 py-1 border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px] font-bold rounded transition-colors cursor-pointer"
                                >
                                  Print Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- TEACHER: DOCUMENTS GENERATOR (MAJOR PRODUCT VALUE) --- */}
            {isTeacher && activeDepartment === "documents" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Document Generation Controls */}
                  <div className="lg:col-span-1 space-y-4 bg-white border border-slate-200 rounded-xl p-5">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Generate Institutional Document</h2>
                      <p className="text-xs text-slate-500">Auto-populates official letters and consent forms with student database records.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
                      <select
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        value={docStudentId}
                        onChange={(e) => setDocStudentId(e.target.value)}
                      >
                        {invites.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.student_name} ({inv.invite_code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Document Type *</label>
                      <select
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as DocumentType)}
                      >
                        {DOCUMENT_TEMPLATES.map((tmpl) => (
                          <option key={tmpl.id} value={tmpl.id}>
                            {tmpl.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tutor Commentary / Special Notes</label>
                      <textarea
                        rows={3}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        placeholder="Optional remarks included in letter..."
                        value={docExtraNotes}
                        onChange={(e) => setDocExtraNotes(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleGenerateDocument}
                      className="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Generate Document Preview
                    </button>
                  </div>

                  {/* Right: Live Document Preview */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Official Document Preview</span>
                      {generatedDocPreview && (
                        <button
                          onClick={printDocument}
                          className="px-3 py-1 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Print / Save as PDF
                        </button>
                      )}
                    </div>

                    {generatedDocPreview ? (
                      <div
                        className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: generatedDocPreview }}
                      />
                    ) : (
                      <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center text-xs text-slate-400 space-y-2 bg-white">
                        <p>Select a student and document template on the left, then click "Generate Document Preview".</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- TEACHER: TIMETABLE & SESSIONS --- */}
            {isTeacher && activeDepartment === "timetable" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Institutional Tutoring Timetable</h2>
                    <p className="text-xs text-slate-500">Scheduled lessons with virtual Google Meet and Zoom classroom links.</p>
                  </div>
                  <button
                    onClick={() => alert("Session scheduling opened.")}
                    className="px-3.5 py-1.5 bg-[#b82e2e] text-white text-xs font-bold rounded-lg"
                  >
                    + Schedule Class
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-[#b82e2e]">Monday · 18:00 - 19:30</p>
                      <p className="text-sm font-bold text-slate-900">Mathematics Grade 12: Calculus & Derivatives</p>
                      <p className="text-xs text-slate-500">24 Students Enrolled · Virtual Lecture Room</p>
                    </div>
                    <a
                      href="https://meet.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                    >
                      <span>Join Google Meet</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-[#b82e2e]">Wednesday · 17:30 - 19:00</p>
                      <p className="text-sm font-bold text-slate-900">Physical Sciences: Newton's Laws Workshop</p>
                      <p className="text-xs text-slate-500">18 Students Enrolled</p>
                    </div>
                    <a
                      href="https://zoom.us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                    >
                      <span>Join Zoom Meeting</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* --- TEACHER: ACADEMIC OVERVIEW & MOODLE LINK --- */}
            {isTeacher && activeDepartment === "academic-overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Academic Overview & Moodle Classroom</h2>
                  <p className="text-xs text-slate-500">
                    StudyHub manages institutional operations; Moodle delivers academic quizzes, notes, and lessons.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">MATHEMATICS 12</span>
                      <span className="text-xs text-slate-400">24 Students Enrolled</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Grade 12 Mathematics (Pure Maths)</h3>
                    <p className="text-xs text-slate-500">Average Class Performance: <strong>78%</strong></p>
                    <a
                      href="https://moodle.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <span>Manage in Moodle Classroom</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">PHYSICAL SCIENCES</span>
                      <span className="text-xs text-slate-400">18 Students Enrolled</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Physical Sciences (Physics & Chemistry)</h3>
                    <p className="text-xs text-slate-500">Average Class Performance: <strong>72%</strong></p>
                    <a
                      href="https://moodle.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <span>Manage in Moodle Classroom</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* --- TEACHER: ANNOUNCEMENTS --- */}
            {isTeacher && activeDepartment === "announcements" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Institutional Announcements</h2>
                  <button onClick={() => alert("Broadcast dialog ready.")} className="px-3.5 py-1.5 bg-[#b82e2e] text-white text-xs font-bold rounded-lg">
                    + New Broadcast
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#b82e2e]">Registration & Finance</span>
                      <span className="text-slate-400">Published Today</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">September Tuition Invoices Issued</h3>
                    <p className="text-xs text-slate-600">All registered students have been sent their updated monthly invoices.</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TEACHER: SETTINGS --- */}
            {isTeacher && activeDepartment === "settings" && (
              <div className="space-y-6 max-w-lg">
                <h2 className="text-base font-bold text-slate-900">Institution & Educator Configuration</h2>
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2 text-xs">
                  <p><strong>Educator:</strong> {profile.full_name} ({profile.email})</p>
                  <p><strong>Role:</strong> Lead Academic Tutor</p>
                  <p><strong>Allocated Capacity:</strong> {capacity} active student seats</p>
                </div>
                <button
                  onClick={() => setShowPasswordChangeModal(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  Change Account Password
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STUDENT SELF-SERVICE DEPARTMENT VIEWS */}
            {/* ========================================================================= */}

            {/* --- STUDENT: FINANCES OVERVIEW --- */}
            {!isTeacher && activeDepartment === "finance" && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Student Fee Account</h2>
                    <p className="text-xs text-slate-500">Overview of tuition billing, payments credited, and outstanding balances.</p>
                  </div>
                  <button
                    onClick={() => setActiveDepartment("invoices")}
                    className="px-4 py-2 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Official Invoice Tile &rarr;</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fees Billed</p>
                    <p className="text-2xl font-black text-slate-900">R 12,000.00</p>
                    <p className="text-[11px] text-slate-400">Academic session 2026</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Cleared</p>
                    <p className="text-2xl font-black text-emerald-700">R 11,010.00</p>
                    <p className="text-[11px] text-emerald-600 font-medium">Verified payments credited</p>
                  </div>
                  <div className="bg-white border-2 border-red-200 rounded-xl p-5 space-y-1 bg-red-50/40 shadow-sm">
                    <p className="text-xs font-semibold text-[#b82e2e] uppercase tracking-wider">Outstanding Debt</p>
                    <p className="text-2xl font-black text-[#b82e2e]">R 990.00</p>
                    <p className="text-[11px] text-amber-700 font-bold">Status: Due By You</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">Tuition Settlement (Paystack / EFT)</h3>
                  <p className="text-xs text-slate-500">Pay your outstanding tuition balance securely online or download your official statement.</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => alert("Connecting to Paystack Gateway for R 990.00...")}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Pay R 990.00 via Paystack
                    </button>
                    <button
                      onClick={() => setActiveDepartment("invoices")}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Open Invoice: Student Account
                    </button>
                    <button
                      onClick={() => downloadDocument(getStudentInvoiceHtml(), "StudyHub_Fee_Statement.html")}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Download Statement (.html)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- STUDENT: DEDICATED INVOICES TILE (UP INVOICE: STUDENT ACCOUNT) --- */}
            {!isTeacher && activeDepartment === "invoices" && (
              <div className="space-y-5 max-w-5xl mx-auto">
                {/* UP Action Header */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">Invoice: Student Account</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        R 990.00 Due By You
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Official statement of account &amp; fee ledger &bull; University of Pretoria model.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => alert("Connecting to Paystack for R 990.00...")}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Pay R 990.00 via Paystack</span>
                    </button>
                    <button
                      onClick={() => printDocument(getStudentInvoiceHtml())}
                      className="px-4 py-2 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Print / Save as PDF</span>
                    </button>
                    <button
                      onClick={() => downloadDocument(getStudentInvoiceHtml(), "Invoice_Student_Account.html")}
                      className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Download File
                    </button>
                    <button
                      onClick={() => setShowStudentInvoiceModal(true)}
                      className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Fullscreen View
                    </button>
                  </div>
                </div>

                {/* The Embedded Sheet matching UP Invoice Layout Exactly */}
                <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-8 shadow-md overflow-x-auto">
                  <div
                    className="min-w-[700px]"
                    dangerouslySetInnerHTML={{ __html: getStudentInvoiceHtml() }}
                  />
                </div>
              </div>
            )}
{/* --- STUDENT: MY MODULES & MOODLE CLASSROOM --- */}
            {!isTeacher && activeDepartment === "modules" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Enrolled Academic Modules</h2>
                  <p className="text-xs text-slate-500">Your registered curriculum modules with direct access to Moodle classroom.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">MAT 114</span>
                      <span className="text-xs text-emerald-700 font-bold">Status: Active</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Mathematics Grade 12</h3>
                    <p className="text-xs text-slate-500">Tutor: <strong>Mr. Zuma</strong> · Current Mark: <strong>78%</strong></p>
                    <a
                      href="https://moodle.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <span>Open Classroom in Moodle</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">PHY 114</span>
                      <span className="text-xs text-emerald-700 font-bold">Status: Active</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Physical Sciences Grade 12</h3>
                    <p className="text-xs text-slate-500">Tutor: <strong>Mrs. Naidoo</strong> · Current Mark: <strong>72%</strong></p>
                    <a
                      href="https://moodle.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <span>Open Classroom in Moodle</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* --- STUDENT: STUDENT LIFE & ID --- */}
            {!isTeacher && activeDepartment === "student-life" && (
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl p-6 bg-white max-w-lg space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#b82e2e] text-white flex items-center justify-center font-bold text-lg">
                      {getInitials(profile.full_name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{profile.full_name}</h3>
                      <p className="text-xs text-slate-500 font-mono">Student ID: {invites[0]?.invite_code || "STU-240189"}</p>
                      <p className="text-xs text-emerald-700 font-bold mt-0.5">Registration Status: Active</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Enrolled Modules:</strong> Mathematics Grade 12, Physical Sciences Grade 12</p>
                  </div>

                  <button
                    onClick={() => alert("Downloading official proof of registration letter.")}
                    className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Download Proof of Registration (PDF)
                  </button>
                </div>
              </div>
            )}

            {/* --- STUDENT: TIMETABLE --- */}
            {!isTeacher && activeDepartment === "timetable" && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-slate-900">My Weekly Timetable</h2>
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-xs font-bold text-[#b82e2e]">Monday · 18:00</p>
                    <p className="text-sm font-bold text-slate-900">Mathematics Grade 12: Calculus</p>
                    <p className="text-xs text-slate-500">Live Virtual Session</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#b82e2e]">Wednesday · 17:30</p>
                    <p className="text-sm font-bold text-slate-900">Physical Sciences Workshop</p>
                    <p className="text-xs text-slate-500">Exam Preparation & Problem Solving</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- STUDENT: ANNOUNCEMENTS --- */}
            {!isTeacher && activeDepartment === "announcements" && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-slate-900">Announcements</h2>
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-1.5">
                  <p className="text-xs font-bold text-[#b82e2e]">Academic Administration</p>
                  <h3 className="text-sm font-bold text-slate-900">Term 1 Assessment Schedules Published</h3>
                  <p className="text-xs text-slate-600">Please review your weekly timetable for updated assessment times.</p>
                </div>
              </div>
            )}

            {/* --- STUDENT: SETTINGS --- */}
            {!isTeacher && activeDepartment === "settings" && (
              <div className="space-y-6 max-w-lg">
                <h2 className="text-base font-bold text-slate-900">Account & Security</h2>
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2 text-xs">
                  <p><strong>Name:</strong> {profile.full_name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Role:</strong> Student</p>
                </div>
                <button
                  onClick={() => setShowPasswordChangeModal(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  Change Password
                </button>
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
      {/* Student Official Invoice & Statement Modal */}
      {showStudentInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <Image src="/assets/logo.png" alt="StudyHub" width={110} height={35} className="object-contain" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Official Statement of Account</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printDocument(getStudentInvoiceHtml())}
                  className="px-3 py-1.5 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowStudentInvoiceModal(false)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div
              className="border border-slate-200 rounded-lg p-4 bg-white overflow-auto max-h-[75vh]"
              dangerouslySetInnerHTML={{ __html: getStudentInvoiceHtml() }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
