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
  StudentDocData,
  InstitutionDocData,
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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  dept?: string;
  subPage?: string;
  actionText?: string;
}

// =========================================================================
// UCT-Inspired Decorative Banner & Handcrafted Illustrative Icons
// =========================================================================

function AfricanPatternBanner() {
  return (
    <div className="w-full h-2.5 sm:h-3 overflow-hidden bg-[#1e293b] flex shadow-inner shrink-0">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="uct-african-motif" width="70" height="14" patternUnits="userSpaceOnUse">
            <rect width="70" height="14" fill="#1E293B" />
            <polygon points="0,0 17.5,14 35,0" fill="#B82E2E" />
            <polygon points="35,14 52.5,0 70,14" fill="#C2410C" />
            <polygon points="8,0 17.5,7 27,0" fill="#F59E0B" />
            <polygon points="43,14 52.5,7 62,14" fill="#FBBF24" />
            <polygon points="0,14 17.5,0 35,14" fill="#0D9488" opacity="0.8" />
            <circle cx="17.5" cy="7" r="1.5" fill="#FFFFFF" />
            <circle cx="52.5" cy="7" r="1.5" fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uct-african-motif)" />
      </svg>
    </div>
  );
}

// 1. Finance: Neoclassical Bank + Gold Coins Stack + Ruby Currency Seal
function FinanceIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="22" ry="3" fill="#CBD5E1" />
      <path d="M12 24L32 10L52 24H12Z" fill="#2563EB" />
      <polygon points="32,13 48,24 16,24" fill="#3B82F6" />
      <circle cx="32" cy="18" r="2.5" fill="#FDE047" />
      <rect x="10" y="24" width="44" height="3" fill="#1D4ED8" />
      <rect x="14" y="27" width="5" height="18" rx="1" fill="#93C5FD" />
      <rect x="23" y="27" width="5" height="18" rx="1" fill="#BFDBFE" />
      <rect x="36" y="27" width="5" height="18" rx="1" fill="#BFDBFE" />
      <rect x="45" y="27" width="5" height="18" rx="1" fill="#93C5FD" />
      <rect x="10" y="45" width="44" height="4" rx="1" fill="#1E3A8A" />
      <ellipse cx="43" cy="52" rx="8" ry="2.5" fill="#CA8A04" />
      <ellipse cx="43" cy="49" rx="8" ry="2.5" fill="#EAB308" />
      <ellipse cx="43" cy="46" rx="8" ry="2.5" fill="#FACC15" />
      <ellipse cx="43" cy="43" rx="8" ry="2.5" fill="#FEF08A" />
      <circle cx="21" cy="49" r="6.5" fill="#B82E2E" />
      <text x="21" y="53" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="system-ui, sans-serif">R</text>
    </svg>
  );
}

// 2. Students: Scholar Profile Dossier + Yellow Pencil
function StudentsIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="20" ry="3" fill="#CBD5E1" />
      <rect x="12" y="10" width="40" height="44" rx="6" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      <rect x="12" y="10" width="40" height="10" rx="6" fill="#3B82F6" />
      <rect x="26" y="13" width="12" height="4" rx="2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="32" cy="28" r="7" fill="#64748B" />
      <path d="M22 45C22 38 26 36 32 36C38 36 42 38 42 45H22Z" fill="#B82E2E" />
      <g transform="translate(36, 32) rotate(-35)">
        <polygon points="0,0 4,0 2,6" fill="#F59E0B" />
        <polygon points="1,4 3,4 2,6" fill="#0F172A" />
        <rect x="0" y="-14" width="4" height="14" fill="#FBBF24" />
        <rect x="0" y="-18" width="4" height="4" rx="1" fill="#EF4444" />
      </g>
    </svg>
  );
}

// 3. Documents: Application Checklist with Green Checkmarks + Avatar Badge
function DocumentsIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="20" ry="3" fill="#CBD5E1" />
      <rect x="15" y="8" width="34" height="46" rx="3" fill="#3B82F6" />
      <path d="M41 8L49 16H41V8Z" fill="#93C5FD" />
      <rect x="18" y="14" width="22" height="3" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="18" y="21" width="28" height="2.5" rx="1" fill="#FFFFFF" opacity="0.75" />
      <rect x="18" y="27" width="24" height="2.5" rx="1" fill="#FFFFFF" opacity="0.75" />
      <rect x="18" y="33" width="18" height="2.5" rx="1" fill="#FFFFFF" opacity="0.75" />
      <circle cx="41" cy="28" r="4" fill="#22C55E" />
      <path d="M39 28L40.5 29.5L43.5 26.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="45" r="9" fill="#FFFFFF" stroke="#B82E2E" strokeWidth="2" />
      <circle cx="38" cy="42" r="3.5" fill="#B82E2E" />
      <path d="M33 49C33 46 35 45 38 45C41 45 43 46 43 49H33Z" fill="#B82E2E" />
    </svg>
  );
}

// 4. Timetable: Spiral Desk Calendar with Red/Amber Blocks + Mortarboard
function TimetableIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="20" ry="3" fill="#CBD5E1" />
      <rect x="12" y="14" width="40" height="38" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="12" y="14" width="40" height="11" rx="4" fill="#2563EB" />
      <rect x="18" y="10" width="3" height="7" rx="1.5" fill="#64748B" />
      <rect x="28" y="10" width="3" height="7" rx="1.5" fill="#64748B" />
      <rect x="38" y="10" width="3" height="7" rx="1.5" fill="#64748B" />
      <rect x="48" y="10" width="3" height="7" rx="1.5" fill="#64748B" />
      <rect x="17" y="29" width="5" height="5" rx="1" fill="#93C5FD" />
      <rect x="25" y="29" width="5" height="5" rx="1" fill="#B82E2E" />
      <rect x="33" y="29" width="5" height="5" rx="1" fill="#93C5FD" />
      <rect x="41" y="29" width="5" height="5" rx="1" fill="#F59E0B" />
      <rect x="17" y="37" width="5" height="5" rx="1" fill="#F59E0B" />
      <rect x="25" y="37" width="5" height="5" rx="1" fill="#93C5FD" />
      <rect x="33" y="37" width="5" height="5" rx="1" fill="#B82E2E" />
      <g transform="translate(41, 41)">
        <polygon points="0,3 -7,0 0,-3 7,0" fill="#1E293B" />
        <line x1="0" y1="0" x2="6" y2="4" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="0" cy="5" r="3" fill="#B82E2E" />
        <path d="M-4,10 C-4,7 4,7 4,10 Z" fill="#B82E2E" />
      </g>
    </svg>
  );
}

// 5. Academic Overview / Modules: Trio of Scholars in Graduation Caps + Curriculum
function ModulesIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="22" ry="3" fill="#CBD5E1" />
      <g transform="translate(19, 28)">
        <polygon points="0,0 -8,-3 0,-6 8,-3" fill="#475569" />
        <circle cx="0" cy="0" r="3" fill="#94A3B8" />
        <path d="M-5,7 C-5,3 5,3 5,7 Z" fill="#64748B" />
      </g>
      <g transform="translate(45, 28)">
        <polygon points="0,0 -8,-3 0,-6 8,-3" fill="#475569" />
        <circle cx="0" cy="0" r="3" fill="#94A3B8" />
        <path d="M-5,7 C-5,3 5,3 5,7 Z" fill="#64748B" />
      </g>
      <g transform="translate(32, 22)">
        <polygon points="0,0 -11,-4 0,-8 11,-4" fill="#0F172A" />
        <line x1="0" y1="-4" x2="8" y2="1" stroke="#F59E0B" strokeWidth="1.25" />
        <circle cx="0" cy="1" r="4.5" fill="#64748B" />
        <path d="M-7,12 C-7,6 7,6 7,12 Z" fill="#B82E2E" />
      </g>
      <rect x="18" y="44" width="28" height="5" rx="1.5" fill="#2563EB" />
      <rect x="20" y="49" width="24" height="4" rx="1" fill="#D97706" />
      <rect x="16" y="53" width="32" height="4" rx="1" fill="#B82E2E" />
    </svg>
  );
}

// 6. Announcements: Prominent Yellow Notification Triangle + Megaphone Seal
function AnnouncementsIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="20" ry="3" fill="#CBD5E1" />
      <polygon points="32,10 52,46 12,46" fill="#FDE047" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="40" r="2" fill="#0F172A" />
      <line x1="32" y1="22" x2="32" y2="34" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="45" cy="43" r="8" fill="#B82E2E" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M42 41L45 39V47L42 45H40V41H42Z" fill="#FFFFFF" />
      <path d="M47 41C48 42 48 44 47 45" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 7. Settings: Precision Dual-Tone Gear + Shield Keyhole
function SettingsIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="20" ry="3" fill="#CBD5E1" />
      <circle cx="32" cy="31" r="16" fill="#64748B" />
      <circle cx="32" cy="31" r="9" fill="#F8FAFC" />
      <rect x="29" y="11" width="6" height="40" rx="2" fill="#64748B" />
      <rect x="11" y="28" width="42" height="6" rx="2" fill="#64748B" />
      <rect x="16.5" y="15.5" width="31" height="31" rx="2" transform="rotate(45 32 31)" fill="#64748B" />
      <circle cx="32" cy="31" r="7" fill="#F1F5F9" />
      <g transform="translate(32, 33)">
        <path d="M0,0 L11,3 V10 C11,15 0,19 0,19 C0,19 -11,15 -11,10 V3 Z" fill="#B82E2E" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="0" cy="7" r="2" fill="#FFFFFF" />
        <line x1="0" y1="9" x2="0" y2="13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 8. Student Life: Colorful Social Conversation Bubbles + Scholars
function StudentLifeIllustrativeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="56" rx="20" ry="3" fill="#CBD5E1" />
      <rect x="12" y="12" width="18" height="12" rx="6" fill="#F59E0B" />
      <polygon points="17,24 22,24 15,28" fill="#F59E0B" />
      <rect x="34" y="10" width="18" height="12" rx="6" fill="#0284C7" />
      <polygon points="45,22 50,22 47,26" fill="#0284C7" />
      <circle cx="21" cy="34" r="5" fill="#64748B" />
      <path d="M14,48 C14,41 28,41 28,48 Z" fill="#475569" />
      <circle cx="43" cy="34" r="5" fill="#64748B" />
      <path d="M36,48 C36,41 50,41 50,48 Z" fill="#475569" />
      <circle cx="32" cy="30" r="6" fill="#B82E2E" />
      <path d="M23,48 C23,39 41,39 41,48 Z" fill="#B82E2E" />
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
  const [activeSubPage, setActiveSubPage] = useState<string>("student_account");

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

  // Notification Bell State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Document Flagged for Submission",
      message: "Parent Consent & Indemnity Form has been flagged as requiring signed submission.",
      time: "15m ago",
      read: false,
      dept: "documents",
      subPage: "indemnity_form",
      actionText: "Review Indemnity Form",
    },
    {
      id: "notif-2",
      title: "Student Account Statement Ready",
      message: "Invoice: Student Account (UP Running Fee Ledger) updated for Term 1 tuition.",
      time: "2h ago",
      read: false,
      dept: "finance",
      subPage: "student_account",
      actionText: "View Fee Ledger",
    },
    {
      id: "notif-3",
      title: "Academic Schedule Updated",
      message: "Lecture venues and weekly sessions confirmed for active curriculum modules.",
      time: "1d ago",
      read: true,
      dept: "timetable",
      subPage: "teaching_schedule",
      actionText: "Check Timetable",
    },
    {
      id: "notif-4",
      title: "Institutional Registration",
      message: "Welcome to StudyHub portal. Please verify your personal details in Profile Settings.",
      time: "2d ago",
      read: true,
      dept: "settings",
      subPage: "institution_profile",
      actionText: "Open Profile Settings",
    },
  ]);

  // Profile Form Blocks (for both Teacher and Student)
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileSurname, setProfileSurname] = useState("");
  const [profilePhone, setProfilePhone] = useState("+27 82 123 4567");
  const [profileIdNumber, setProfileIdNumber] = useState("031120 0827 088");
  const [profileCampusId, setProfileCampusId] = useState("u23489102");
  const [profileDob, setProfileDob] = useState("2003-11-20");
  const [profileAddress, setProfileAddress] = useState("Hatfield Campus, Pretoria, Gauteng, 0028");
  const [profileEmergencyName, setProfileEmergencyName] = useState("Nomsa Zuma (Parent / Guardian)");
  const [profileEmergencyPhone, setProfileEmergencyPhone] = useState("+27 83 987 6543");
  const [savingProfile, setSavingProfile] = useState(false);

  // Document Generator State
  const [docStudentId, setDocStudentId] = useState<string>("");
  const [docExtraNotes, setDocExtraNotes] = useState<string>("");

  // Invoices list state
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
      studentName: "Sarah Smith",
      studentEmail: "sarah.smith@example.com",
      description: "Physical Sciences Grade 12 - Term 1 Tuition",
      amount: 2500,
      date: "2026-09-01",
      dueDate: "2026-09-15",
      status: "pending",
    },
  ]);

  // Invoice creation form state
  const [invStudentId, setInvStudentId] = useState("");
  const [invDescription, setInvDescription] = useState("");
  const [invAmount, setInvAmount] = useState<number>(1500);
  const [invDueDate, setInvDueDate] = useState("2026-10-01");

  // Single student form
  const [singleName, setSingleName] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [singleParentEmail, setSingleParentEmail] = useState("");
  const [singleError, setSingleError] = useState("");

  // Bulk student import
  const [spreadsheetText, setSpreadsheetText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importingBulk, setImportingBulk] = useState(false);

  // Bulletproof print using hidden iframe to bypass popup blockers
  const printDocument = (htmlToPrint: string) => {
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
            <title>StudyHub Official Document</title>
            <base href="${window.location.origin}/" />
            <style>
              body { margin: 0; padding: 15mm; font-family: Arial, Helvetica, sans-serif; }
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
  const downloadDocument = (htmlToDownload: string, fileName = "StudyHub_Document.html") => {
    if (!htmlToDownload) return;

    const fullHtml = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>StudyHub Official Document</title>
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

  // Helper to generate document HTML for any type and student
  const getDocHtml = useCallback(
    (type: DocumentType, targetStudent?: Partial<StudentDocData>, notes?: string) => {
      const student: StudentDocData = {
        name: targetStudent?.name || profile?.full_name || "John Doe",
        studentId: targetStudent?.studentId || "u23489102",
        email: targetStudent?.email || profile?.email || "student@up.ac.za",
        programme: targetStudent?.programme || "12134002  BSc in Computer Science",
        address: targetStudent?.address || "Hatfield Campus, Pretoria, Gauteng, 0028",
        enrolledModules: targetStudent?.enrolledModules || ["Mathematics Grade 12", "Physical Sciences Grade 12"],
        monthlyFee: targetStudent?.monthlyFee || 1500,
        totalDebt: targetStudent?.totalDebt || 12000,
        paidAmount: targetStudent?.paidAmount || 11010,
      };

      const institution: InstitutionDocData = {
        institutionName: "StudyHub Education",
        educatorName: profile?.full_name || "Academic Administration",
        contactEmail: "ssc@studyhub.logtraq.co.za",
        website: "www.studyhub.logtraq.co.za",
        logoUrl: "/assets/logo.png",
      };

      return generateDocumentHtml(type, student, institution, notes || docExtraNotes);
    },
    [profile, docExtraNotes]
  );

  // Fetch session & profile
  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/home");
          return;
        }

        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profErr || !prof) {
          router.replace("/home");
          return;
        }

        setProfile(prof as Profile);
        if (prof.full_name) {
          const parts = (prof.full_name as string).trim().split(" ");
          setProfileFirstName(parts[0] || "");
          setProfileSurname(parts.slice(1).join(" ") || "");
        }

        if (prof.role === "teacher") {
          const { data: invData } = await supabase
            .from("student_invites")
            .select("*")
            .order("created_at", { ascending: false });

          if (invData) {
            setInvites(invData);
            if (invData.length > 0) {
              setDocStudentId(invData[0].id);
              setInvStudentId(invData[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const isTeacher = profile?.role === "teacher";

  // --- Department Navigation Definitions (UCT Inspired) ---
  const TEACHER_TILES = [
    { id: "students", title: "Students", icon: StudentsIllustrativeIcon, subtitle: "Roster, enrolments & import" },
    { id: "finance", title: "Finance", icon: FinanceIllustrativeIcon, subtitle: "Fee ledger, billing & Paystack" },
    { id: "documents", title: "Documents", icon: DocumentsIllustrativeIcon, subtitle: "Indemnity forms, conduct & letters" },
    { id: "timetable", title: "Timetable", icon: TimetableIllustrativeIcon, subtitle: "Schedules, sessions & venues" },
    { id: "academic-overview", title: "Academic Overview", icon: ModulesIllustrativeIcon, subtitle: "Curriculum, marks & Moodle" },
    { id: "announcements", title: "Announcements", icon: AnnouncementsIllustrativeIcon, subtitle: "Broadcast circulars & notices" },
    { id: "settings", title: "Settings", icon: SettingsIllustrativeIcon, subtitle: "Capacity, academy profile & security" },
  ];

  const STUDENT_TILES = [
    { id: "finance", title: "Finances", icon: FinanceIllustrativeIcon, subtitle: "Student Account, payments & fee ledger" },
    { id: "modules", title: "My Modules", icon: ModulesIllustrativeIcon, subtitle: "Course syllabus & Moodle classroom" },
    { id: "student-life", title: "Student Life", icon: StudentLifeIllustrativeIcon, subtitle: "Digital student ID & conduct pledge" },
    { id: "timetable", title: "Timetable", icon: TimetableIllustrativeIcon, subtitle: "Lecture schedules & exam venues" },
    { id: "announcements", title: "Announcements", icon: AnnouncementsIllustrativeIcon, subtitle: "Circulars & administrative dates" },
    { id: "settings", title: "Settings", icon: SettingsIllustrativeIcon, subtitle: "Profile & account preferences" },
  ];

  // Sub-Navigation Menus INSIDE Each Tile (NOT the other dashboard tiles!)
  const TEACHER_MENUS: Record<string, { id: string; label: string }[]> = {
    students: [
      { id: "roster", label: "Student Directory & Roster" },
      { id: "bulk_import", label: "Bulk Spreadsheet Import" },
      { id: "single_enroll", label: "Single Student Registration" },
    ],
    finance: [
      { id: "ledger_overview", label: "Fee Ledger & Accounts" },
      { id: "issue_invoice", label: "Issue Student Invoice" },
      { id: "all_invoices", label: "All Issued Invoices" },
      { id: "paystack_settings", label: "Paystack & Settlement" },
    ],
    documents: [
      { id: "indemnity_form", label: "Parent Indemnity Form" },
      { id: "conduct_pledge", label: "Student Code of Conduct" },
      { id: "enrolment_letter", label: "Proof of Enrolment Letter" },
      { id: "progress_report", label: "Academic Progress Report" },
      { id: "student_account", label: "Invoice: Student Account" },
    ],
    timetable: [
      { id: "teaching_schedule", label: "Teaching Schedule" },
      { id: "schedule_session", label: "Schedule Virtual Session" },
      { id: "venues", label: "Lecture Venues & Rooms" },
    ],
    "academic-overview": [
      { id: "curriculum", label: "Curriculum Modules" },
      { id: "moodle_bridge", label: "Manage in Moodle" },
      { id: "marks", label: "Assessment Marks & Stats" },
    ],
    announcements: [
      { id: "broadcast", label: "Broadcast New Notice" },
      { id: "archive", label: "Notice History & Archive" },
    ],
    settings: [
      { id: "institution_profile", label: "Profile Details" },
      { id: "capacity", label: "Enrolment Capacity" },
      { id: "security", label: "Password & Security" },
    ],
  };

  const STUDENT_MENUS: Record<string, { id: string; label: string }[]> = {
    finance: [
      { id: "student_account", label: "Student Account (Invoice)" },
      { id: "make_payment", label: "Make Payment (Paystack / EFT)" },
      { id: "payment_history", label: "Payment History & Receipts" },
      { id: "fee_structure", label: "Fee Structure & Quotation" },
    ],
    modules: [
      { id: "registered_modules", label: "Registered Modules" },
      { id: "moodle_classroom", label: "Open Classroom in Moodle" },
      { id: "study_materials", label: "Study Materials & Past Papers" },
      { id: "progress_report", label: "Academic Progress Report" },
    ],
    "student-life": [
      { id: "digital_card", label: "Digital Student ID Card" },
      { id: "code_of_conduct", label: "Student Code of Conduct" },
      { id: "campus_services", label: "Campus Services & Support" },
    ],
    timetable: [
      { id: "weekly_schedule", label: "Weekly Lecture Schedule" },
      { id: "virtual_sessions", label: "Virtual Classroom Links" },
      { id: "exam_dates", label: "Exam Timetable & Venues" },
    ],
    announcements: [
      { id: "all_notices", label: "All Institutional Notices" },
      { id: "academic_circulars", label: "Academic Circulars" },
      { id: "financial_notices", label: "Financial Notices" },
    ],
    settings: [
      { id: "account_profile", label: "Profile Details" },
      { id: "security", label: "Password & Security" },
    ],
  };

  const currentTiles = isTeacher ? TEACHER_TILES : STUDENT_TILES;
  const currentMenus = isTeacher ? TEACHER_MENUS : STUDENT_MENUS;
  const activeSubMenuItems = currentMenus[activeDepartment] || [];

  // When clicking a dashboard tile, enter that department and set its first sub-page
  const handleOpenDepartment = (deptId: string) => {
    setActiveDepartment(deptId);
    const firstSub = currentMenus[deptId]?.[0]?.id || "overview";
    setActiveSubPage(firstSub);
    setStatusMessage(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/home");
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationSelect = (n: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );
    setShowNotifications(false);
    if (n.dept) {
      setActiveDepartment(n.dept);
      if (n.subPage) {
        setActiveSubPage(n.subPage);
      }
    }
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const updatedFullName = `${profileFirstName.trim()} ${profileSurname.trim()}`.trim();

    try {
      if (profile?.id) {
        await supabase
          .from("profiles")
          .update({ full_name: updatedFullName })
          .eq("id", profile.id);
      }
      setProfile((prev) => (prev ? { ...prev, full_name: updatedFullName } : null));
      setStatusMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch {
      setProfile((prev) => (prev ? { ...prev, full_name: updatedFullName } : null));
      setStatusMessage({ type: "success", text: "Profile details updated locally." });
    } finally {
      setSavingProfile(false);
    }
  };

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
      description: invDescription || "Tuition Fee Installment",
      amount: invAmount,
      date: new Date().toISOString().slice(0, 10),
      dueDate: invDueDate,
      status: "pending",
    };

    setInvoices([newInv, ...invoices]);
    setActiveSubPage("all_invoices");
    setStatusMessage({ type: "success", text: `Invoice ${newInv.invoiceNo} issued for ${targetStudent.student_name}` });
  };

  const handleSingleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError("");
    if (!singleName || !singleEmail) {
      setSingleError("Name and email are required.");
      return;
    }

    const newStudent: StudentInvite = {
      id: `stu-${Date.now()}`,
      student_name: singleName,
      student_email: singleEmail,
      invite_code: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
      temp_password: `Pass${Math.floor(1000 + Math.random() * 9000)}!`,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    setInvites([newStudent, ...invites]);
    setSingleName("");
    setSingleEmail("");
    setActiveSubPage("roster");
    setStatusMessage({ type: "success", text: `${newStudent.student_name} enrolled with ID ${newStudent.invite_code}` });
  };

  const handleSpreadsheetTextChange = (text: string) => {
    setSpreadsheetText(text);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }
    const res = parseSpreadsheetText(text);
    setParsedRows(res);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const res = await parseExcelFile(file);
      setParsedRows(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteBulkImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setImportingBulk(true);
    const newInvites: StudentInvite[] = validRows.map((r, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      student_name: r.name,
      student_email: r.email,
      invite_code: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
      temp_password: `Pass${Math.floor(1000 + Math.random() * 9000)}!`,
      status: "pending",
      created_at: new Date().toISOString(),
    }));

    setInvites([...newInvites, ...invites]);
    setParsedRows([]);
    setSpreadsheetText("");
    setImportingBulk(false);
    setActiveSubPage("roster");
    setStatusMessage({ type: "success", text: `Successfully registered ${validRows.length} students` });
  };

  const getInitials = (name: string) => {
    return (name || "SH")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedTeacherStudent = invites.find((i) => i.id === docStudentId) || {
    student_name: "Selected Scholar",
    invite_code: "u23489102",
    student_email: "student@up.ac.za",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b82e2e]"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div
      className="min-h-screen text-slate-900 flex flex-col font-sans relative"
      style={{
        backgroundColor: "#f1f5f9",
        backgroundImage: "radial-gradient(#cbd5e1 0.75px, transparent 0.75px)",
        backgroundSize: "22px 22px",
      }}
    >
      {/* Universal Top Header: Clean Executive White Banner */}
      <header className="w-full border-b border-slate-200 bg-white px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs relative">
        {/* Left: Authentic a+ Logo + LogTraq */}
        <div
          onClick={() => {
            setActiveDepartment("dashboard");
            setStatusMessage(null);
            setShowNotifications(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none"
          title="Return to Dashboard Launchpad"
        >
          <Image
            src="/assets/logo-square.png"
            alt="a+"
            width={34}
            height={34}
            className="object-contain"
            priority
          />
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            LogTraq
          </span>
        </div>

        {/* Center: Authoritative Portal Title in Top Banner */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none px-4">
          <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            {isTeacher ? "Educator Operational Portal" : "Student Self-Service Portal"}
          </h1>
        </div>

        {/* Right Header: Active Notification Bell + Interactive Profile Avatar */}
        <div className="flex items-center gap-3 relative">
          {/* Notification Bell with Badge and Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className={`p-2 rounded-full transition-colors relative cursor-pointer ${
                showNotifications ? "bg-red-50 text-[#b82e2e]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#b82e2e] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Institutional Notifications</span>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-[#b82e2e] text-[10px] font-extrabold rounded-full">
                        {notifications.filter((n) => !n.read).length} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-[11px] font-semibold text-[#b82e2e] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationSelect(n)}
                      className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                        n.read ? "opacity-75" : "bg-red-50/40"
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#b82e2e] ring-2 ring-red-100" style={{ opacity: n.read ? 0.2 : 1 }}></div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-xs">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                        {n.actionText && (
                          <span className="inline-block text-[10px] font-bold text-[#b82e2e] hover:underline pt-0.5">
                            {n.actionText} &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">StudyHub Real-Time Notifications</p>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          {/* Clickable Profile Avatar: Goes straight to Profile Settings */}
          <div
            onClick={() => {
              setActiveDepartment("settings");
              setActiveSubPage(isTeacher ? "institution_profile" : "account_profile");
              setShowNotifications(false);
              setStatusMessage(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition-colors select-none"
            title="Open Profile Settings"
          >
            <div className="w-9 h-9 rounded-full bg-[#b82e2e] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-red-100 hover:ring-[#b82e2e] transition-all">
              {getInitials(profile.full_name)}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-900 hover:text-[#b82e2e] transition-colors">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{profile.role} &bull; Profile</p>
            </div>
          </div>
        </div>
      </header>

      {/* Decorative African / University Geometric Motif Banner */}
      <AfricanPatternBanner />

      {/* ========================================================================= */}
      {/* STAGE 1: FULL-WIDTH DASHBOARD LAUNCHPAD (NO SIDEBAR) */}
      {/* ========================================================================= */}
      {activeDepartment === "dashboard" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-6xl mx-auto w-full">
          {/* Grid of Executive Tiles with Emoji on Top & Title Below */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl">
            {currentTiles.map((tile) => {
              const IconComp = tile.icon;
              return (
                <button
                  key={tile.id}
                  onClick={() => {
                    handleOpenDepartment(tile.id);
                    setShowNotifications(false);
                  }}
                  className="group bg-white border border-[#d6e0ea] hover:border-[#b82e2e] hover:shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer min-h-[170px] shadow-sm hover:-translate-y-0.5"
                >
                  {/* The Emoji / Illustrative Graphic in center */}
                  <div className="w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 mb-3">
                    <IconComp className="w-16 h-16" />
                  </div>

                  {/* Tile Title Directly Below the Emoji */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#b82e2e] transition-colors">
                    {tile.title}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* STAGE 2: INSIDE A DEPARTMENT (LEFT SIDEBAR ACTIVATED)                     */
        /* The sidebar shows ONLY sub-options of this department (NOT the whole board)*/
        /* ========================================================================= */
        <div className="flex-1 flex w-full">
          {/* Department-Specific Left Sidebar */}
          <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-57px)]">
            <div className="space-y-4">
              {/* Return to Launchpad button */}
              <button
                onClick={() => setActiveDepartment("dashboard")}
                className="flex items-center gap-2 px-3 py-2 w-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <span>&larr;</span>
                <span>Dashboard Launchpad</span>
              </button>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-black text-[#b82e2e] uppercase tracking-wider px-3 mb-2">
                  {activeDepartment.replace("-", " ")}
                </p>

                {/* ONLY Sub-Options of THIS Department */}
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
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          isActive
                            ? "bg-red-50 text-[#b82e2e] font-bold border-l-4 border-[#b82e2e]"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-slate-100 pt-3 space-y-1">
              <p className="text-[11px] text-slate-400 px-3 truncate">{profile.email}</p>
              <button
                onClick={() => setShowPasswordChangeModal(true)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 w-full text-left font-medium block cursor-pointer rounded hover:bg-slate-50"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-800 px-3 py-1.5 w-full text-left font-medium block cursor-pointer rounded hover:bg-red-50"
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
                &times; Close to Launchpad
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
                <button onClick={() => setStatusMessage(null)} className="font-bold cursor-pointer ml-2">
                  &times;
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STUDENT WORKSPACE VIEWS                                                   */}
            {/* ========================================================================= */}

            {/* --- STUDENT: FINANCES --- */}
            {!isTeacher && activeDepartment === "finance" && (
              <div className="space-y-6">
                {/* 1. Student Account (Invoice) & UP Running Ledger */}
                {activeSubPage === "student_account" && (
                  <div className="space-y-5">
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
                          onClick={() => setActiveSubPage("make_payment")}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Pay R 990.00 via Paystack</span>
                        </button>
                        <button
                          onClick={() => printDocument(getDocHtml("student_invoice"))}
                          className="px-4 py-2 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Print / Save as PDF</span>
                        </button>
                        <button
                          onClick={() => downloadDocument(getDocHtml("student_invoice"), "Invoice_Student_Account.html")}
                          className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Download Statement (.html)
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-8 shadow-md overflow-x-auto">
                      <div className="min-w-[700px]" dangerouslySetInnerHTML={{ __html: getDocHtml("student_invoice") }} />
                    </div>
                  </div>
                )}

                {/* 2. Make Payment (Paystack / EFT) */}
                {activeSubPage === "make_payment" && (
                  <div className="space-y-6 max-w-xl">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900">Instant Online Tuition Settlement (Paystack)</h3>
                      <p className="text-xs text-slate-500">
                        Settle your tuition fees instantly via Debit Card, Credit Card, or Capitec Pay. Real-time reconciliation.
                      </p>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between font-medium">
                          <span>Immediate Balance Due:</span>
                          <span className="font-bold text-[#b82e2e]">R 990.00</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Student Reference:</span>
                          <span className="font-mono font-bold text-slate-800">u23489102</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setStatusMessage({
                            type: "success",
                            text: "Paystack Gateway active: Payment of R 990.00 cleared & logged on student ledger.",
                          });
                        }}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Proceed to Pay R 990.00 via Paystack
                      </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm text-xs">
                      <h3 className="text-sm font-bold text-slate-900">Direct Bank Remittance (EFT)</h3>
                      <p className="text-slate-500">For electronic funds transfers, please utilize the official institutional account details:</p>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                        <p><strong>Bank:</strong> First National Bank (FNB) / ABSA Bank</p>
                        <p><strong>Account Name:</strong> StudyHub Education (Pty) Ltd</p>
                        <p><strong>Account Number:</strong> 62849201948</p>
                        <p><strong>Branch Code:</strong> 250655</p>
                        <p><strong>Beneficiary Reference:</strong> <span className="font-mono font-bold text-[#b82e2e]">u23489102</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Payment History & Receipts */}
                {activeSubPage === "payment_history" && (
                  <div className="space-y-4">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Credited Payment Receipts</h3>
                        <span className="text-xs text-slate-500">Verified institutional receipts</span>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="py-2.5 px-4">Receipt Date</th>
                            <th className="py-2.5 px-4">Method / Channel</th>
                            <th className="py-2.5 px-4">Bank Reference</th>
                            <th className="py-2.5 px-4 text-right">Amount Credited</th>
                            <th className="py-2.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-3 px-4">2026/01/09</td>
                            <td className="py-3 px-4 font-medium text-slate-900">ABSA Bank Electronic Transfer</td>
                            <td className="py-3 px-4 font-mono text-slate-500">BANK STMT SEQ 2338467</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">R 29,000.00</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => printDocument(getDocHtml("student_invoice"))}
                                className="px-2.5 py-1 border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px] font-bold rounded cursor-pointer"
                              >
                                Print Statement
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4">2026/04/23</td>
                            <td className="py-3 px-4 font-medium text-slate-900">Direct EFT Tuition Settlement</td>
                            <td className="py-3 px-4 font-mono text-slate-500">BANK STMT SEQ 2378897</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">R 5,700.00</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => printDocument(getDocHtml("student_invoice"))}
                                className="px-2.5 py-1 border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px] font-bold rounded cursor-pointer"
                              >
                                Print Statement
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4">2026/07/24</td>
                            <td className="py-3 px-4 font-medium text-slate-900">Paystack Instant Card Clearing</td>
                            <td className="py-3 px-4 font-mono text-slate-500">BANK STMT SEQ 2407178</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">R 30,000.00</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => printDocument(getDocHtml("student_invoice"))}
                                className="px-2.5 py-1 border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px] font-bold rounded cursor-pointer"
                              >
                                Print Statement
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Fee Structure & Quotation */}
                {activeSubPage === "fee_structure" && (
                  <div className="space-y-4 max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">2026 Academic Tuition Fee Structure</h3>
                        <p className="text-slate-500">Approved fee schedule per registered module and calendar term.</p>
                      </div>
                      <button
                        onClick={() => printDocument(getDocHtml("enrolment_confirmation"))}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg cursor-pointer"
                      >
                        Print Proof of Enrolment
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span>Mathematics Grade 12 (Curriculum & Tutorial)</span>
                        <strong className="text-slate-900">R 4,050.00 / term</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span>Physical Sciences Grade 12 (Theory & Practical)</span>
                        <strong className="text-slate-900">R 3,660.00 / term</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span>E-Learning Portal License & Past Papers Pack</span>
                        <strong className="text-slate-900">R 452.00 / annum</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span>Technology Infrastructure & LMS Access</span>
                        <strong className="text-slate-900">R 390.00 / annum</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- STUDENT: MY MODULES --- */}
            {!isTeacher && activeDepartment === "modules" && (
              <div className="space-y-6">
                {activeSubPage === "registered_modules" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">MAT 114</span>
                        <span className="text-xs text-emerald-700 font-bold">Active &bull; 78%</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Mathematics Grade 12</h3>
                      <p className="text-xs text-slate-500">Calculus, Functions, Analytical Geometry &amp; Trigonometry.</p>
                      <a
                        href="https://moodle.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <span>Open in Moodle</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">PHY 114</span>
                        <span className="text-xs text-emerald-700 font-bold">Active &bull; 72%</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Physical Sciences Grade 12</h3>
                      <p className="text-xs text-slate-500">Newtonian Mechanics, Organic Chemistry, Doppler Effect.</p>
                      <a
                        href="https://moodle.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <span>Open in Moodle</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {activeSubPage === "study_materials" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm text-xs">
                    <h3 className="text-sm font-bold text-slate-900">Past Exam Packs &amp; Study Resources</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span>Mathematics Paper 1 (Calculus &amp; Algebra) &ndash; 2025 Final Exam</span>
                        <button
                          onClick={() => downloadDocument(getDocHtml("academic_progress"), "Math_P1_PastPaper.html")}
                          className="px-3 py-1 bg-slate-900 text-white font-bold rounded text-xs cursor-pointer"
                        >
                          Download Pack
                        </button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span>Physical Sciences Paper 1 (Physics Mechanics Revision Pack)</span>
                        <button
                          onClick={() => downloadDocument(getDocHtml("academic_progress"), "Physics_Revision_Pack.html")}
                          className="px-3 py-1 bg-slate-900 text-white font-bold rounded text-xs cursor-pointer"
                        >
                          Download Pack
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubPage === "progress_report" && (
                  <div className="space-y-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => printDocument(getDocHtml("academic_progress"))}
                        className="px-4 py-2 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Print / Save as PDF
                      </button>
                      <button
                        onClick={() => downloadDocument(getDocHtml("academic_progress"), "Academic_Progress_Report.html")}
                        className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Download (.html)
                      </button>
                    </div>
                    <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-md overflow-x-auto">
                      <div dangerouslySetInnerHTML={{ __html: getDocHtml("academic_progress") }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- STUDENT: STUDENT LIFE --- */}
            {!isTeacher && activeDepartment === "student-life" && (
              <div className="space-y-6">
                {activeSubPage === "digital_card" && (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white max-w-sm space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <Image src="/assets/logo.png" alt="StudyHub" width={85} height={28} className="object-contain" />
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                        CLEARED 2026
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#b82e2e] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {getInitials(profile.full_name)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{profile.full_name}</h3>
                        <p className="text-xs text-slate-500 font-mono font-bold text-[#b82e2e]">u23489102</p>
                        <p className="text-[11px] text-slate-400">Grade 12 STEM Academic</p>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>VERIFIED ID</span>
                      <span>VALID: DEC 2026</span>
                    </div>
                    <button
                      onClick={() => printDocument(getDocHtml("enrolment_confirmation"))}
                      className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Print Official Student Credential
                    </button>
                  </div>
                )}

                {activeSubPage === "code_of_conduct" && (
                  <div className="space-y-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => printDocument(getDocHtml("student_consent"))}
                        className="px-4 py-2 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Print / Save as PDF
                      </button>
                      <button
                        onClick={() => downloadDocument(getDocHtml("student_consent"), "Student_Code_Of_Conduct.html")}
                        className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Download (.html)
                      </button>
                    </div>
                    <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-md overflow-x-auto">
                      <div dangerouslySetInnerHTML={{ __html: getDocHtml("student_consent") }} />
                    </div>
                  </div>
                )}

                {activeSubPage === "campus_services" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm text-xs">
                    <h3 className="text-sm font-bold text-slate-900">Student Academic Support Services</h3>
                    <p className="text-slate-500">Contact educational counselors, topic tutors, and the admissions desk:</p>
                    <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                      <p><strong>Student Support Centre (SSC):</strong> ssc@studyhub.logtraq.co.za</p>
                      <p><strong>Helpline:</strong> +27 (0)12 420 3111</p>
                      <p><strong>Operating Hours:</strong> Mon &ndash; Fri: 08:00 &ndash; 16:30</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- STUDENT: TIMETABLE --- */}
            {!isTeacher && activeDepartment === "timetable" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Weekly Lecture &amp; Tutorial Schedule</h3>
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-3">Day</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Venue / Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-medium">Monday</td>
                      <td className="p-3">15:30 &ndash; 17:00</td>
                      <td className="p-3 font-bold text-[#b82e2e]">Mathematics Grade 12</td>
                      <td className="p-3 font-mono text-slate-600">Lecture Hall A / Zoom Live</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Wednesday</td>
                      <td className="p-3">15:30 &ndash; 17:00</td>
                      <td className="p-3 font-bold text-[#b82e2e]">Physical Sciences Grade 12</td>
                      <td className="p-3 font-mono text-slate-600">Science Lab 2 / Zoom Live</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* --- STUDENT: ANNOUNCEMENTS --- */}
            {!isTeacher && activeDepartment === "announcements" && (
              <div className="space-y-3 max-w-xl">
                <div className="border-l-4 border-[#b82e2e] bg-white border border-slate-200 rounded-r-xl p-5 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-[#b82e2e] uppercase tracking-wider">Academic Notice</span>
                  <h3 className="text-sm font-bold text-slate-900">Term 3 Revision Sessions Schedule</h3>
                  <p className="text-xs text-slate-600">All Grade 12 candidates are required to attend the mock exam workshop this Saturday.</p>
                  <p className="text-[10px] text-slate-400 mt-2">Posted by Lead Educator &bull; 2 days ago</p>
                </div>
              </div>
            )}



            {/* ========================================================================= */}
            {/* TEACHER WORKSPACE VIEWS                                                   */}
            {/* ========================================================================= */}

            {/* --- TEACHER: STUDENTS --- */}
            {isTeacher && activeDepartment === "students" && (
              <div className="space-y-6">
                {activeSubPage === "roster" && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Student Directory ({invites.length})</h3>
                      <button
                        onClick={() => setActiveSubPage("bulk_import")}
                        className="px-3 py-1.5 bg-[#b82e2e] text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        + Import Spreadsheet
                      </button>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                        <tr>
                          <th className="py-2.5 px-4">Student Name</th>
                          <th className="py-2.5 px-4">Student Number</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invites.map((inv) => (
                          <tr key={inv.id}>
                            <td className="py-3 px-4 font-bold text-slate-900">{inv.student_name}</td>
                            <td className="py-3 px-4 font-mono text-[#b82e2e] font-bold">{inv.invite_code}</td>
                            <td className="py-3 px-4 text-slate-600">{inv.student_email}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ACTIVE
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setDocStudentId(inv.id);
                                  setActiveDepartment("documents");
                                  setActiveSubPage("indemnity_form");
                                }}
                                className="px-2 py-1 border border-slate-200 hover:border-slate-400 rounded text-slate-700 font-medium cursor-pointer"
                              >
                                View Docs
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeSubPage === "bulk_import" && (
                  <div className="space-y-4 max-w-xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Bulk Spreadsheet Enrolment</h3>
                    <p className="text-xs text-slate-500">Paste student names and emails or upload an Excel / CSV sheet.</p>
                    <textarea
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono"
                      placeholder="John Doe, john@example.com&#10;Sarah Smith, sarah@example.com"
                      value={spreadsheetText}
                      onChange={(e) => handleSpreadsheetTextChange(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <button
                        onClick={downloadSampleCsvTemplate}
                        className="text-xs text-[#b82e2e] hover:underline font-bold cursor-pointer"
                      >
                        Download Sample Template
                      </button>
                      <button
                        onClick={handleExecuteBulkImport}
                        disabled={parsedRows.length === 0}
                        className="px-4 py-2 bg-slate-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Register {parsedRows.length} Students
                      </button>
                    </div>
                  </div>
                )}

                {activeSubPage === "single_enroll" && (
                  <div className="max-w-md bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Single Student Registration</h3>
                    {singleError && <p className="text-xs text-red-600">{singleError}</p>}
                    <form onSubmit={handleSingleEnroll} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-medium mb-1">Student Full Name *</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded p-2 text-xs"
                          value={singleName}
                          onChange={(e) => setSingleName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Student / Parent Email *</label>
                        <input
                          type="email"
                          className="w-full border border-slate-300 rounded p-2 text-xs"
                          value={singleEmail}
                          onChange={(e) => setSingleEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#b82e2e] text-white font-bold rounded-lg cursor-pointer"
                      >
                        Register Student
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* --- TEACHER: FINANCE --- */}
            {isTeacher && activeDepartment === "finance" && (
              <div className="space-y-6">
                {activeSubPage === "ledger_overview" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Total Fees Invoiced</p>
                        <p className="text-2xl font-black text-slate-900">R 50,000.00</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Collections Cleared</p>
                        <p className="text-2xl font-black text-emerald-700">R 41,500.00</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-sm">
                        <p className="text-xs font-semibold text-[#b82e2e] uppercase">Outstanding Arrears</p>
                        <p className="text-2xl font-black text-[#b82e2e]">R 8,500.00</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubPage === "issue_invoice" && (
                  <div className="max-w-xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Issue Student Tuition Invoice</h3>
                    <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-medium mb-1">Select Student *</label>
                        <select
                          className="w-full border border-slate-300 rounded p-2 text-xs"
                          value={invStudentId}
                          onChange={(e) => setInvStudentId(e.target.value)}
                        >
                          {invites.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.student_name} ({inv.invite_code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Description *</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded p-2 text-xs"
                          placeholder="e.g. Mathematics Grade 12 - Term 3 Tuition"
                          value={invDescription}
                          onChange={(e) => setInvDescription(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Amount (ZAR) *</label>
                          <input
                            type="number"
                            className="w-full border border-slate-300 rounded p-2 text-xs"
                            value={invAmount}
                            onChange={(e) => setInvAmount(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Due Date *</label>
                          <input
                            type="date"
                            className="w-full border border-slate-300 rounded p-2 text-xs"
                            value={invDueDate}
                            onChange={(e) => setInvDueDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2.5 bg-[#b82e2e] text-white font-bold rounded-lg cursor-pointer">
                        Issue Invoice &bull; Notify Student
                      </button>
                    </form>
                  </div>
                )}

                {activeSubPage === "all_invoices" && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">All Issued Invoices</h3>
                      <button
                        onClick={() => setActiveSubPage("issue_invoice")}
                        className="px-3 py-1.5 bg-[#b82e2e] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        + Issue Invoice
                      </button>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                        <tr>
                          <th className="p-3">Invoice #</th>
                          <th className="p-3">Student</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Due Date</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td className="p-3 font-mono font-bold">{inv.invoiceNo}</td>
                            <td className="p-3 font-medium">{inv.studentName}</td>
                            <td className="p-3 text-slate-500">{inv.description}</td>
                            <td className="p-3">{inv.dueDate}</td>
                            <td className="p-3 font-bold">R {inv.amount.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                                {inv.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => printDocument(getDocHtml("student_invoice", { name: inv.studentName, email: inv.studentEmail }))}
                                  className="px-2.5 py-1 border border-slate-200 rounded font-bold hover:bg-slate-50 cursor-pointer"
                                >
                                  Print
                                </button>
                                <button
                                  onClick={() => downloadDocument(getDocHtml("student_invoice", { name: inv.studentName, email: inv.studentEmail }), `${inv.invoiceNo}.html`)}
                                  className="px-2.5 py-1 border border-slate-200 rounded font-bold hover:bg-slate-50 cursor-pointer"
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
                )}
              </div>
            )}

            {/* --- TEACHER: DOCUMENTS (REAL OFFICIAL DOCUMENT GENERATORS) --- */}
            {isTeacher && activeDepartment === "documents" && (
              <div className="space-y-6">
                {/* Student Selector Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Target Student:</span>
                    <select
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const typeMap: Record<string, DocumentType> = {
                          indemnity_form: "parent_consent",
                          conduct_pledge: "student_consent",
                          enrolment_letter: "enrolment_confirmation",
                          progress_report: "academic_progress",
                          student_account: "student_invoice",
                        };
                        const dt = typeMap[activeSubPage] || "parent_consent";
                        printDocument(getDocHtml(dt, { name: selectedTeacherStudent.student_name, studentId: selectedTeacherStudent.invite_code, email: selectedTeacherStudent.student_email }));
                      }}
                      className="px-4 py-2 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Print / Save as PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        const typeMap: Record<string, DocumentType> = {
                          indemnity_form: "parent_consent",
                          conduct_pledge: "student_consent",
                          enrolment_letter: "enrolment_confirmation",
                          progress_report: "academic_progress",
                          student_account: "student_invoice",
                        };
                        const dt = typeMap[activeSubPage] || "parent_consent";
                        downloadDocument(
                          getDocHtml(dt, { name: selectedTeacherStudent.student_name, studentId: selectedTeacherStudent.invite_code, email: selectedTeacherStudent.student_email }),
                          `${selectedTeacherStudent.student_name}_${activeSubPage}.html`
                        );
                      }}
                      className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Download (.html)
                    </button>
                  </div>
                </div>

                {/* The Embedded Sheet for the Selected Sub-Option */}
                <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-8 shadow-md overflow-x-auto">
                  <div
                    className="min-w-[700px]"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        const typeMap: Record<string, DocumentType> = {
                          indemnity_form: "parent_consent",
                          conduct_pledge: "student_consent",
                          enrolment_letter: "enrolment_confirmation",
                          progress_report: "academic_progress",
                          student_account: "student_invoice",
                        };
                        const dt = typeMap[activeSubPage] || "parent_consent";
                        return getDocHtml(dt, {
                          name: selectedTeacherStudent.student_name,
                          studentId: selectedTeacherStudent.invite_code,
                          email: selectedTeacherStudent.student_email,
                        });
                      })(),
                    }}
                  />
                </div>
              </div>
            )}

            {/* --- TEACHER: TIMETABLE --- */}
            {isTeacher && activeDepartment === "timetable" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Teaching Calendar &amp; Virtual Lectures</h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <p><strong>Upcoming Live Class:</strong> Mathematics Grade 12 (Calculus Past Paper Review)</p>
                  <p><strong>Date &amp; Time:</strong> Monday, 15:30 &ndash; 17:00</p>
                  <a
                    href="https://meet.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3.5 py-1.5 bg-[#b82e2e] text-white font-bold rounded-lg"
                  >
                    Start Google Meet Session &rarr;
                  </a>
                </div>
              </div>
            )}

            {/* --- TEACHER: ACADEMIC OVERVIEW --- */}
            {isTeacher && activeDepartment === "academic-overview" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Moodle Learning Management System</h3>
                    <p className="text-xs text-slate-500">Manage online curriculum materials, quizzes, and gradebooks.</p>
                  </div>
                  <a
                    href="https://moodle.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Manage in Moodle</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* --- TEACHER: ANNOUNCEMENTS --- */}
            {isTeacher && activeDepartment === "announcements" && (
              <div className="max-w-xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Broadcast Institutional Circular</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStatusMessage({ type: "success", text: "Announcement broadcast to all registered students." });
                  }}
                  className="space-y-3 text-xs"
                >
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                    placeholder="Notice Title (e.g. Saturday Revision Workshop)"
                    required
                  />
                  <textarea
                    rows={4}
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                    placeholder="Notice message and instructions..."
                    required
                  />
                  <button type="submit" className="px-4 py-2 bg-[#b82e2e] text-white font-bold rounded-lg cursor-pointer">
                    Publish Circular
                  </button>
                </form>
              </div>
            )}

            {/* --- SETTINGS: PROFILE DETAILS BLOCKS (FOR BOTH TEACHERS & STUDENTS) --- */}
            {activeDepartment === "settings" && (activeSubPage === "institution_profile" || activeSubPage === "account_profile") && (
              <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Profile Details</h3>
                    <p className="text-xs text-slate-500">View and update your personal identification and contact information.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-50 text-[#b82e2e] border border-red-100 rounded-lg text-xs font-bold capitalize">
                    {profile.role} Account
                  </span>
                </div>

                <form onSubmit={handleSaveProfileDetails} className="space-y-4 text-xs">
                  {/* Grid of Profile Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">First Name</label>
                      <input
                        type="text"
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                        required
                      />
                    </div>

                    {/* Surname Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Surname</label>
                      <input
                        type="text"
                        value={profileSurname}
                        onChange={(e) => setProfileSurname(e.target.value)}
                        placeholder="Surname"
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                        required
                      />
                    </div>

                    {/* Email Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl p-3 text-xs cursor-not-allowed"
                      />
                    </div>

                    {/* Mobile Phone Number Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Mobile Phone Number</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+27 82 123 4567"
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                      />
                    </div>

                    {/* Student / Staff ID Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">{isTeacher ? "Educator / Staff ID" : "Student Campus ID"}</label>
                      <input
                        type="text"
                        value={profileCampusId}
                        onChange={(e) => setProfileCampusId(e.target.value)}
                        placeholder="u23489102"
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                      />
                    </div>

                    {/* National ID / Passport Number Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">National ID / Passport Number</label>
                      <input
                        type="text"
                        value={profileIdNumber}
                        onChange={(e) => setProfileIdNumber(e.target.value)}
                        placeholder="031120 0827 088"
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                      />
                    </div>

                    {/* Date of Birth Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Date of Birth</label>
                      <input
                        type="date"
                        value={profileDob}
                        onChange={(e) => setProfileDob(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                      />
                    </div>

                    {/* Account Type Block */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">System Permission</label>
                      <input
                        type="text"
                        value={isTeacher ? "Lead Educator • Administrator" : "Registered Scholar"}
                        disabled
                        className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl p-3 text-xs cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Physical Address Block (Full Width) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Residential / Campus Address</label>
                    <textarea
                      rows={2}
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Street, Campus / Suburb, City, Postal Code"
                      className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                    />
                  </div>

                  {/* Emergency Contact Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={profileEmergencyName}
                        onChange={(e) => setProfileEmergencyName(e.target.value)}
                        placeholder="Next of Kin / Guardian"
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        value={profileEmergencyPhone}
                        onChange={(e) => setProfileEmergencyPhone(e.target.value)}
                        placeholder="+27 83 987 6543"
                        className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#b82e2e]"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-[#b82e2e] hover:bg-[#a02626] disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
                    >
                      {savingProfile ? "Saving..." : "Save Profile Details"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasswordChangeModal(true)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- SETTINGS: STUDENT ENROLMENT CAPACITY (MOVED FROM DASHBOARD) --- */}
            {isTeacher && activeDepartment === "settings" && activeSubPage === "capacity" && (
              <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">Student Enrolment Capacity</h3>
                  <p className="text-xs text-slate-500">Monitor academy student intake limits, registered active seats, and available slots.</p>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Total Tutoring Limit:</span>
                    <span className="text-lg font-black text-slate-900">{profile.student_capacity} Students</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Currently Enrolled:</span>
                    <span className="text-sm font-bold text-[#b82e2e]">{invites.length} Scholars</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#b82e2e] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((invites.length / profile.student_capacity) * 100))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{profile.student_capacity - invites.length} Available Seats</span>
                    <span>{Math.min(100, Math.round((invites.length / profile.student_capacity) * 100))}% Capacity Used</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveDepartment("students");
                      setActiveSubPage("single_enroll");
                    }}
                    className="px-4 py-2.5 bg-[#b82e2e] hover:bg-[#a02626] text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    + Register Single Student
                  </button>
                  <button
                    onClick={() => {
                      setActiveDepartment("students");
                      setActiveSubPage("bulk_import");
                    }}
                    className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Bulk Spreadsheet Import
                  </button>
                </div>
              </div>
            )}

            {/* --- SETTINGS: PASSWORD & SECURITY --- */}
            {activeDepartment === "settings" && activeSubPage === "security" && (
              <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Password &amp; Account Security</h3>
                  <p className="text-xs text-slate-500">Manage credentials and authentication preferences.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <p><strong>Login Email:</strong> {profile.email}</p>
                  <p><strong>Session Status:</strong> Active &bull; Authenticated via Supabase</p>
                </div>

                <button
                  onClick={() => setShowPasswordChangeModal(true)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Change Account Password &rarr;
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
              &times;
            </button>
            <ForcePasswordChange
              theme="light"
              userEmail={profile.email}
              onSuccess={() => {
                setShowPasswordChangeModal(false);
                setStatusMessage({ type: "success", text: "Password updated successfully!" });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}