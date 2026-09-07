"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import ForcePasswordChange from "@/components/ForcePasswordChange";
import {
  parseSpreadsheetText,
  downloadSampleCsvTemplate,
  ParsedStudentRow,
} from "@/lib/csvParser";
import {
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
  temp_password?: string;
  status: string;
  created_at: string;
  phone?: string;
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

function LogoutIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// --- Department Navigation Definitions (Static Module-Level) ---
const TEACHER_TILES = [
  { id: "students", title: "Students", icon: StudentsIllustrativeIcon, subtitle: "Roster, enrollments & student directory" },
  { id: "finance", title: "Finance", icon: FinanceIllustrativeIcon, subtitle: "Fee ledger, billing & Paystack" },
  { id: "documents", title: "Documents", icon: DocumentsIllustrativeIcon, subtitle: "Indemnity forms, conduct & letters" },
  { id: "timetable", title: "Timetable", icon: TimetableIllustrativeIcon, subtitle: "Schedules, sessions & venues" },
  { id: "academic-overview", title: "Academic Overview", icon: ModulesIllustrativeIcon, subtitle: "Curriculum, marks & Moodle" },
  { id: "announcements", title: "Announcements", icon: AnnouncementsIllustrativeIcon, subtitle: "Broadcast circulars & notices" },
  { id: "settings", title: "Settings", icon: SettingsIllustrativeIcon, subtitle: "Capacity, academy profile & security" },
];

const STUDENT_TILES = [
  { id: "modules", title: "Learning Hub", icon: ModulesIllustrativeIcon, subtitle: "High school subjects, video lesson & mastery quiz" },
  { id: "timetable", title: "Live Timetable", icon: TimetableIllustrativeIcon, subtitle: "Upcoming classes & virtual meeting links" },
  { id: "finance", title: "Tuition & Fees", icon: FinanceIllustrativeIcon, subtitle: "Account statement, receipts & online payment" },
  { id: "announcements", title: "Announcements", icon: AnnouncementsIllustrativeIcon, subtitle: "Tutor updates, revision schedules & alerts" },
  { id: "student-life", title: "Learner Card", icon: StudentLifeIllustrativeIcon, subtitle: "Digital student ID & conduct pledge" },
  { id: "settings", title: "Settings", icon: SettingsIllustrativeIcon, subtitle: "Profile & account preferences" },
];

// Sub-Navigation Menus INSIDE Each Tile
const TEACHER_MENUS: Record<string, { id: string; label: string }[]> = {
  students: [
    { id: "enrollments", label: "Enrolled Students" },
  ],
  finance: [
    { id: "ledger_overview", label: "Financial Records" },
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
    { id: "venues", label: "Venues & Rooms" },
  ],
  "academic-overview": [
    { id: "curriculum", label: "Curriculum Modules" },
    { id: "marks", label: "Assessment Marks & Stats" },
    { id: "studyhub_demo", label: "Study Hub Demo" },
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
  modules: [
    { id: "registered_modules", label: "My Subjects" },
    { id: "studyhub_demo", label: "Video Lesson & Mastery Quiz" },
    { id: "study_materials", label: "Past Papers & Exam Packs" },
    { id: "progress_report", label: "Academic Progress Report" },
  ],
  timetable: [
    { id: "weekly_schedule", label: "Live Teaching Schedule" },
  ],
  finance: [
    { id: "student_account", label: "Tuition Statement & Invoice" },
    { id: "make_payment", label: "Settle Fees (Paystack / EFT)" },
    { id: "payment_history", label: "Receipts & History" },
    { id: "fee_structure", label: "Fee Structure" },
  ],
  announcements: [
    { id: "all_notices", label: "Tutor Circulars & Notices" },
  ],
  "student-life": [
    { id: "digital_card", label: "Digital Student ID Card" },
    { id: "code_of_conduct", label: "Learner Code of Conduct" },
    { id: "campus_services", label: "Learner Support Desk" },
  ],
  settings: [
    { id: "account_profile", label: "Profile Details" },
    { id: "security", label: "Password & Security" },
  ],
};

// =========================================================================
// High School Tutoring Domain Data & Structures
// =========================================================================

interface EnrolledHighSchoolStudent {
  num: number;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  grade: string;
  subjectsCount: number;
  billed: number;
  paid: number;
  status: "paid" | "owing";
}

const HIGH_SCHOOL_STUDENTS: EnrolledHighSchoolStudent[] = [
  {
    num: 1,
    name: "Olwethuthando Zuma",
    studentId: "STU-829104",
    email: "olezuma@gmail.com",
    phone: "+27 82 891 0023",
    grade: "Grade 12 (DBE/IEB)",
    subjectsCount: 7,
    billed: 4900.00,
    paid: 4900.00,
    status: "paid",
  },
  {
    num: 2,
    name: "Nontobeko Mbawu",
    studentId: "STU-294012",
    email: "nontobeko.mbawu@gmail.com",
    phone: "+27 71 392 4891",
    grade: "Grade 12 (DBE/IEB)",
    subjectsCount: 7,
    billed: 4900.00,
    paid: 4900.00,
    status: "paid",
  },
  {
    num: 3,
    name: "Sipho Dlamini",
    studentId: "STU-382910",
    email: "sipho.dlamini@outlook.com",
    phone: "+27 83 490 1289",
    grade: "Grade 12 (DBE/IEB)",
    subjectsCount: 7,
    billed: 4900.00,
    paid: 3400.00,
    status: "owing",
  },
  {
    num: 4,
    name: "Keisha Patel",
    studentId: "STU-471029",
    email: "keisha.patel@gmail.com",
    phone: "+27 84 928 3710",
    grade: "Grade 12 (DBE/IEB)",
    subjectsCount: 7,
    billed: 4900.00,
    paid: 4900.00,
    status: "paid",
  },
  {
    num: 5,
    name: "Liam Van Der Merwe",
    studentId: "STU-592810",
    email: "liam.vandermerwe@gmail.com",
    phone: "+27 72 819 0293",
    grade: "Grade 12 (DBE/IEB)",
    subjectsCount: 7,
    billed: 4900.00,
    paid: 2900.00,
    status: "owing",
  },
];

interface CalendarSlot {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  time: string;
  topic: string;
  provider: "Google Meet" | "Zoom" | "Other";
  link: string;
}

const INITIAL_TEACHING_SLOTS: CalendarSlot[] = [
  {
    id: "slot-1",
    date: "2026-09-08",
    dayName: "Tuesday",
    time: "15:30 - 17:00",
    topic: "Grade 12 Mathematics: Advanced Exponential Relations & Algebraic Proofs",
    provider: "Google Meet",
    link: "https://meet.google.com/zuma-maths-live",
  },
  {
    id: "slot-2",
    date: "2026-09-10",
    dayName: "Thursday",
    time: "16:00 - 17:30",
    topic: "Grade 12 Physical Sciences: Newton's Laws & Impulse Momentum Review",
    provider: "Zoom",
    link: "https://zoom.us/j/8291047712",
  },
  {
    id: "slot-3",
    date: "2026-10-11",
    dayName: "Sunday",
    time: "10:00 - 12:00",
    topic: "Matric Exam Masterclass: DBE & IEB Paper 1 Intensive Problem Workshop",
    provider: "Google Meet",
    link: "https://meet.google.com/matric-paper1-masterclass",
  },
];

interface VenueEvent {
  id: string;
  day: string;
  hour: string;
  venue: string;
  title: string;
}

const INITIAL_VENUE_EVENTS: VenueEvent[] = [
  { id: "ve-1", day: "Monday", hour: "15:00", venue: "Room A", title: "Grade 12 Mathematics Tutorial" },
  { id: "ve-2", day: "Tuesday", hour: "16:00", venue: "Online Studio 1", title: "Live Exponential Proofs Masterclass" },
  { id: "ve-3", day: "Wednesday", hour: "15:00", venue: "Room B", title: "Physical Sciences Problem Session" },
  { id: "ve-4", day: "Thursday", hour: "16:00", venue: "Online Studio 2", title: "Mechanics & Chemical Equilibrium" },
  { id: "ve-5", day: "Friday", hour: "14:00", venue: "Study Hall", title: "Guided Past-Paper Drills" },
  { id: "ve-6", day: "Saturday", hour: "10:00", venue: "Main Auditorium", title: "Matric Exam Prep Intensive" },
];

interface QuizItem {
  intensity: "Low" | "Medium" | "High";
  marks: number;
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation: string;
}

const EXPONENTIAL_QUIZ_DATA: QuizItem[] = [
  {
    intensity: "Low",
    marks: 2,
    question: "Simplify: x^a · x^b · x^c",
    options: [
      "A) x^(a · b · c)",
      "B) x^(a + b + c)",
      "C) (3x)^(a + b + c)",
      "D) x^((a + b) / c)"
    ],
    correctAnswers: [1],
    explanation: "x^(a+b+c) (Product law: when multiplying powers with the same base, add all exponents together)."
  },
  {
    intensity: "Low",
    marks: 2,
    question: "Solve for n: 2^n · 2^3 = 2^10",
    options: [
      "A) n = 30",
      "B) n = 13",
      "C) n = 7",
      "D) n = 3.33"
    ],
    correctAnswers: [2],
    explanation: "n = 7 (Applying the product law: 2^(n+3) = 2^10. Since the bases are equal, n + 3 = 10 ⟹ n = 7)."
  },
  {
    intensity: "Medium",
    marks: 3,
    question: "Find the single integer value: If 5^(1/x) = 2 and 5^(1/y) = 3, express 5^(1/x + 1/y) as a single integer.",
    options: [
      "A) 5",
      "B) 6",
      "C) 9",
      "D) 25"
    ],
    correctAnswers: [1],
    explanation: "6 (By the product law: 5^(1/x + 1/y) = 5^(1/x) · 5^(1/y) = 2 × 3 = 6)."
  },
  {
    intensity: "Medium",
    marks: 4,
    question: "Given: k^(1/x) = 5 and k^(1/y) = 2. If k^(1/w) = 10, which expression correctly gives w in terms of x and y?",
    options: [
      "A) w = (x + y) / (xy)",
      "B) w = (xy) / (x + y)",
      "C) w = 10(x + y)",
      "D) w = xy"
    ],
    correctAnswers: [1],
    explanation: "Proof: Since 5 × 2 = 10, substitute: k^(1/x) · k^(1/y) = k^(1/w) ⟹ k^(1/x + 1/y) = k^(1/w) ⟹ 1/x + 1/y = 1/w ⟹ (x + y)/(xy) = 1/w ⟹ w = (xy)/(x + y)."
  },
  {
    intensity: "Medium",
    marks: 4,
    question: "Division Case: If k^(1/x) = 20, k^(1/y) = 4, and k^(1/w) = 5, find the relationship between w, x, and y.",
    options: [
      "A) w = (xy) / (y - x)",
      "B) w = (xy) / (x - y)",
      "C) w = (x - y) / (xy)",
      "D) w = 5(x - y)"
    ],
    correctAnswers: [0],
    explanation: "w = (xy) / (y - x) (Since 20 ÷ 4 = 5, k^(1/x) ÷ k^(1/y) = k^(1/w) ⟹ 1/x - 1/y = 1/w ⟹ (y - x)/(xy) = 1/w ⟹ w = (xy)/(y - x))."
  },
  {
    intensity: "High",
    marks: 5,
    question: "Harder Proof: If a^x = b^y = (ab)^z, prove the expression for z in terms of x and y.",
    options: [
      "A) z = (x + y) / 2",
      "B) z = (xy) / (x + y)",
      "C) z = √(xy)",
      "D) z = (x + y) / (xy)"
    ],
    correctAnswers: [1],
    explanation: "Proof: Let a^x = b^y = (ab)^z = K. Then a = K^(1/x), b = K^(1/y), ab = K^(1/z). Since a · b = ab, K^(1/x) · K^(1/y) = K^(1/z) ⟹ 1/x + 1/y = 1/z ⟹ z = (xy)/(x + y)."
  },
  {
    intensity: "High",
    marks: 5,
    question: "Reciprocals: If 3^a = 5^b = 15^c, show the exact relationship between a, b, and c.",
    options: [
      "A) c = a + b",
      "B) 1/c = 1/a + 1/b",
      "C) c = (a + b) / (ab)",
      "D) 15c = 3a · 5b"
    ],
    correctAnswers: [1],
    explanation: "Proof: Let 3^a = 5^b = 15^c = k. Then 3 = k^(1/a), 5 = k^(1/b), 15 = k^(1/c). Since 3 × 5 = 15, k^(1/a) · k^(1/b) = k^(1/c) ⟹ 1/c = 1/a + 1/b."
  },
  {
    intensity: "High",
    marks: 6,
    question: "Triple Variable: If k^(1/x) = 2, k^(1/y) = 3, and k^(1/z) = 5, find T in terms of x, y, and z if k^(1/T) = 30.",
    options: [
      "A) T = x + y + z",
      "B) T = (xyz) / (x + y + z)",
      "C) T = (xyz) / (xy + yz + zx)",
      "D) T = (xy + yz + zx) / (xyz)"
    ],
    correctAnswers: [2],
    explanation: "T = (xyz) / (xy + yz + zx) (Since 2 × 3 × 5 = 30, k^(1/x) · k^(1/y) · k^(1/z) = k^(1/T) ⟹ 1/x + 1/y + 1/z = 1/T ⟹ (yz + xz + xy)/(xyz) = 1/T ⟹ T = (xyz)/(xy + yz + zx))."
  },
  {
    intensity: "Medium",
    marks: 4,
    question: "Substitution: Solve for x if 3^x + 3^(x+1) = 36.",
    options: [
      "A) x = 3",
      "B) x = 2",
      "C) x = 1",
      "D) x = 4"
    ],
    correctAnswers: [1],
    explanation: "x = 2 (Factor out 3^x: 3^x(1 + 3) = 36 ⟹ 3^x(4) = 36 ⟹ 3^x = 9 ⟹ x = 2)."
  },
  {
    intensity: "High",
    marks: 7,
    question: "Challenge: If x = k^(1/(a-b)), y = k^(1/(b-c)), and z = k^(1/(c-a)), prove the value of x · y · z.",
    options: [
      "A) k",
      "B) 0",
      "C) 1",
      "D) k^(abc)"
    ],
    correctAnswers: [2],
    explanation: "Proof: x · y · z = k^(1/(a-b) + 1/(b-c) + 1/(c-a)). Using a common denominator, the numerator simplifies to (b-c)(c-a) + (a-b)(c-a) + (a-b)(b-c) = 0. Since k^0 = 1, x · y · z = 1."
  }
];

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  date: string;
  recipients: string;
  channel: string;
  status: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-1",
    title: "Saturday Matric Mathematics Revision Workshop",
    message: "Mandatory past-paper drill on Exponential Relations, Functions and Differential Calculus scheduled for 10:00 AM.",
    date: "07 Sep 2026, 14:00",
    recipients: "5 Enrolled Learners (Olwethuthando Zuma, Nontobeko Mbawu, Sipho Dlamini, Keisha Patel, Liam Van Der Merwe)",
    channel: "StudyHub Student Portal + Instant Email Alert",
    status: "Delivered (5 / 5 Delivered)",
  },
  {
    id: "ann-2",
    title: "Term 1 Tuition Statement & SBA Assessment Packs",
    message: "Updated official tuition statements and SBA assessment packs have been released to student profiles.",
    date: "01 Sep 2026, 09:30",
    recipients: "5 Enrolled Learners (Olwethuthando Zuma, Nontobeko Mbawu, Sipho Dlamini, Keisha Patel, Liam Van Der Merwe)",
    channel: "StudyHub Student Portal + Instant Email Alert",
    status: "Delivered (5 / 5 Delivered)",
  },
];

export default function Dashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<StudentInvite[]>([]);

  // Navigation State
  const [activeDepartment, setActiveDepartment] = useState<string>("dashboard");
  const [activeSubPage, setActiveSubPage] = useState<string>("student_account");
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
      message: "Official High School Tuition Statement updated for Term 1 tuition.",
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
  const [profileCampusId, setProfileCampusId] = useState("STU-001");
  const [profileDob, setProfileDob] = useState("2003-11-20");
  const [profileAddress, setProfileAddress] = useState("Main Campus");
  const [profileEmergencyName, setProfileEmergencyName] = useState("Nomsa Zuma (Parent / Guardian)");
  const [profileEmergencyPhone, setProfileEmergencyPhone] = useState("+27 83 987 6543");
  const [savingProfile, setSavingProfile] = useState(false);

  // Document Generator State
  const [docStudentId, setDocStudentId] = useState<string>("");
  const [docExtraNotes] = useState<string>("");

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

  // Direct Spreadsheet File Import Ref & State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [spreadsheetText, setSpreadsheetText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [importingBulk, setImportingBulk] = useState(false);

  // Student enrollments search, filter, and modals state
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"all" | "active" | "pending">("all");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<StudentInvite | null>(null);

  // Single student enrollment form state
  const [enrollFirstName, setEnrollFirstName] = useState("");
  const [enrollSurname, setEnrollSurname] = useState("");
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrollPhone, setEnrollPhone] = useState("");
  const [enrollStudentNumber, setEnrollStudentNumber] = useState("");
  const [enrollError, setEnrollError] = useState("");

  // Timetable Calendar & Slots State
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [teachingSlots, setTeachingSlots] = useState<CalendarSlot[]>(INITIAL_TEACHING_SLOTS);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState("2026-09-08");
  const [newSlotTime, setNewSlotTime] = useState("15:30 - 17:00");
  const [newSlotTopic, setNewSlotTopic] = useState("");
  const [newSlotProvider, setNewSlotProvider] = useState<"Google Meet" | "Zoom" | "Other">("Google Meet");
  const [newSlotLink, setNewSlotLink] = useState("https://meet.google.com");

  // Venues & Rooms Table State
  const [venueEvents, setVenueEvents] = useState<VenueEvent[]>(INITIAL_VENUE_EVENTS);
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [newVenueDay, setNewVenueDay] = useState("Monday");
  const [newVenueHour, setNewVenueHour] = useState("15:00");
  const [newVenueName, setNewVenueName] = useState("Room A");
  const [newVenueTitle, setNewVenueTitle] = useState("");

  // Study Hub Demo - 10-Question Mastery Quiz State
  const [activeQuizIdx, setActiveQuizIdx] = useState(0);
  const [quizStatuses, setQuizStatuses] = useState<("unanswered" | "completed" | "not-sure")[]>(
    Array(10).fill("unanswered")
  );
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<number, number[]>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Announcements Tab State
  const [broadcastNoticeTitle, setBroadcastNoticeTitle] = useState("");
  const [broadcastNoticeAudience, setBroadcastNoticeAudience] = useState("All 5 Enrolled Students (Grade 12)");
  const [broadcastNoticeMessage, setBroadcastNoticeMessage] = useState("");
  const [announcementsHistory, setAnnouncementsHistory] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);

  // Direct File Import Handler (.csv, .xlsx, .txt)
  const handleDirectFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const newImported: StudentInvite[] = [];

      for (const line of lines) {
        if (line.toLowerCase().includes("email") && line.toLowerCase().includes("name")) continue;
        const parts = line.split(/[,\t;]/).map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) {
          const name = parts[0];
          const email = parts[1];
          if (email && email.includes("@")) {
            const randomSuffix = Math.floor(100000 + Math.random() * 900000);
            const randomCode = `STU-${randomSuffix}`;
            const tempPass = `StudyHub-${Math.floor(1000 + Math.random() * 9000)}`;

            if (!isDemo) {
              try {
                await supabase.from("student_invites").insert({
                  student_name: name,
                  student_email: email,
                  invite_code: randomCode,
                  temp_password: tempPass,
                  status: "active",
                });
              } catch (supaErr) {
                console.warn("Supabase direct insert:", supaErr);
              }
            }

            newImported.push({
              id: `imp-${Date.now()}-${randomSuffix}`,
              student_name: name,
              student_email: email,
              invite_code: randomCode,
              temp_password: tempPass,
              status: "active",
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      if (newImported.length > 0) {
        setInvites((prev) => [...newImported, ...prev]);
        setStatusMessage({
          type: "success",
          text: isDemo
            ? `🔒 Client Showcase Sandbox: Simulated ${newImported.length} students in preview memory. Live database records remain protected.`
            : `Successfully imported ${newImported.length} students! Random signup codes generated and invitation credentials dispatched.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: "No valid students detected. Ensure the spreadsheet or CSV contains: Student Name, Email Address",
        });
      }
    } catch (err) {
      console.error("Direct spreadsheet read error:", err);
      setStatusMessage({ type: "error", text: "Failed to read spreadsheet file." });
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // Timetable Handlers
  const handleAddTeachingSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTopic.trim()) return;

    const newSlot: CalendarSlot = {
      id: `slot-${Date.now()}`,
      date: newSlotDate,
      dayName: new Date(newSlotDate + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "long" }),
      time: newSlotTime,
      topic: newSlotTopic,
      provider: newSlotProvider,
      link: newSlotLink.trim() || "https://meet.google.com",
    };

    setTeachingSlots((prev) => [newSlot, ...prev]);
    setShowAddSlotModal(false);
    setNewSlotTopic("");
    setStatusMessage({
      type: "success",
      text: `Scheduled "${newSlot.topic}" on ${newSlot.date}. Meeting link activated!`,
    });
  };

  // Venues Handlers
  const handleAddVenueEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueTitle.trim()) return;

    const newEv: VenueEvent = {
      id: `ve-${Date.now()}`,
      day: newVenueDay,
      hour: newVenueHour,
      venue: newVenueName,
      title: newVenueTitle,
    };

    setVenueEvents((prev) => [...prev, newEv]);
    setShowAddVenueModal(false);
    setNewVenueTitle("");
    setStatusMessage({
      type: "success",
      text: `Added ${newEv.venue} slot for ${newEv.day} at ${newEv.hour}!`,
    });
  };

  // Quiz Handlers
  const handleQuizSelectOption = (qIdx: number, optIdx: number) => {
    if (isQuizSubmitted) return;
    setQuizSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: [optIdx],
    }));

    const nextStatuses = [...quizStatuses];
    if (nextStatuses[qIdx] !== "not-sure") {
      nextStatuses[qIdx] = "completed";
    }
    setQuizStatuses(nextStatuses);
  };

  const handleQuizMarkNotSure = () => {
    if (isQuizSubmitted) return;
    const nextStatuses = [...quizStatuses];
    nextStatuses[activeQuizIdx] = "not-sure";
    setQuizStatuses(nextStatuses);
    if (activeQuizIdx < EXPONENTIAL_QUIZ_DATA.length - 1) {
      setActiveQuizIdx(activeQuizIdx + 1);
    }
  };

  const handleQuizSubmit = () => {
    let calculated = 0;
    EXPONENTIAL_QUIZ_DATA.forEach((q, idx) => {
      const selected = quizSelectedAnswers[idx] || [];
      if (selected.length === 1 && selected[0] === q.correctAnswers[0]) {
        calculated += q.marks;
      }
    });
    setQuizScore(calculated);
    setIsQuizSubmitted(true);
  };

  const handleQuizRetake = () => {
    setIsQuizSubmitted(false);
    setQuizScore(0);
    setQuizSelectedAnswers({});
    setQuizStatuses(Array(10).fill("unanswered"));
    setActiveQuizIdx(0);
  };

  // Announcements Broadcast Handler
  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastNoticeTitle.trim() || !broadcastNoticeMessage.trim()) return;

    const newNotice: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: broadcastNoticeTitle.trim(),
      message: broadcastNoticeMessage.trim(),
      date: new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) +
        ", " +
        new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
      recipients: "5 Enrolled Learners (Olwethuthando Zuma, Nontobeko Mbawu, Sipho Dlamini, Keisha Patel, Liam Van Der Merwe)",
      channel: "StudyHub Student Portal + Instant Email Alert",
      status: "Delivered (5 / 5 Delivered)",
    };

    setAnnouncementsHistory((prev) => [newNotice, ...prev]);
    setBroadcastNoticeTitle("");
    setBroadcastNoticeMessage("");
    setStatusMessage({
      type: "success",
      text: "Announcement broadcast successfully! Delivered to 5 student portals.",
    });
  };

  // Bulletproof print using hidden iframe to bypass popup blockers
  // Extracted reusable Study Hub Demo component for both Teacher and Learner views
  const renderStudyHubDemo = () => {
                  const currentQ = EXPONENTIAL_QUIZ_DATA[activeQuizIdx];
                  const totalQuizMarks = EXPONENTIAL_QUIZ_DATA.reduce((acc, q) => acc + q.marks, 0);

                  const getQuizSidebarColor = (idx: number, status: string, isActive: boolean) => {
                    let base = "bg-white text-slate-700 hover:bg-slate-50 border-slate-200";
                    if (isQuizSubmitted) {
                      const sel = quizSelectedAnswers[idx] || [];
                      const isCorrect = sel.length === 1 && sel[0] === EXPONENTIAL_QUIZ_DATA[idx].correctAnswers[0];
                      base = isCorrect
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                        : "bg-red-100 text-red-800 border-red-300 font-bold";
                    } else {
                      if (status === "completed") {
                        base = "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold";
                      } else if (status === "not-sure") {
                        base = "bg-amber-50 text-amber-800 border-amber-300 font-bold";
                      }
                    }

                    if (isActive) {
                      return `${base} ring-2 ring-[#b82e2e] ring-offset-1 font-black`;
                    }
                    return base;
                  };

                  return (
                    <div className="space-y-6">
                      {/* Top Classroom Header Banner */}
                      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e293b] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                              Study Hub Demo Mode
                            </span>
                            <span className="text-xs text-slate-400">Grade 12 Mathematics (DBE / IEB Paper 1)</span>
                          </div>
                          <h2 className="text-xl font-black tracking-tight text-white">
                            Advanced Exponential Relations
                          </h2>
                          <p className="text-xs text-slate-300 max-w-2xl">
                            Topic: Exponential Proofs and Variable Manipulation. Video masterclass, comprehensive theory notes, logic diagrams, and 10-question mastery assessment.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold">
                            Active Interactive Module
                          </span>
                        </div>
                      </div>

                      {/* Main Two-Column Layout: Left Syllabus Topics, Right Active Lesson Content */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left: Grade 12 Syllabus Topic Roster */}
                        <div className="lg:col-span-4 space-y-4">
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                              Grade 12 Mathematics Syllabus
                            </h3>

                            <div className="space-y-2 text-xs">
                              {/* Active Topic */}
                              <div className="p-3 bg-red-50 border-2 border-[#b82e2e] rounded-xl space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-[#b82e2e] text-[11px] uppercase">
                                    Topic 1 &bull; Active
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                    AVAILABLE
                                  </span>
                                </div>
                                <p className="font-bold text-slate-900 text-xs">
                                  Advanced Exponential Relations (Proofs &amp; Manipulation)
                                </p>
                                <p className="text-[10px] text-slate-500">Video Masterclass &bull; Mastery Quiz (10 Qs)</p>
                              </div>

                              {/* Locked Syllabus Topics */}
                              {[
                                "Functions & Inverse Functions (Hyperbola, Parabola, Exponential)",
                                "Differential Calculus & Polynomial Factor Theorem",
                                "Sequences & Series (Arithmetic, Geometric, Sigma)",
                                "Financial Mathematics (Annuities, Sinking Funds)",
                                "Analytical Geometry & Circles (DBE Paper 2)",
                                "Trigonometry (Compound & Double Angles, Identities)",
                                "Euclidean Geometry & Proportionality Theorem",
                                "Statistics & Bivariate Regression Analysis",
                                "Probability & Fundamental Counting Principles",
                              ].map((lockedTopic, i) => (
                                <div
                                  key={i}
                                  className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl opacity-60 flex items-center justify-between cursor-not-allowed"
                                >
                                  <div className="space-y-0.5 pr-2">
                                    <p className="font-semibold text-slate-700 text-[11px]">{lockedTopic}</p>
                                    <p className="text-[9.5px] text-slate-400">DBE &amp; IEB Core Syllabus</p>
                                  </div>
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                                    DEMO LOCKED
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Active Lesson Video, Notes & Mastery Quiz */}
                        <div className="lg:col-span-8 space-y-6">
                          {/* Video Masterclass Player */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-slate-900">
                                Video Masterclass: Exponential Proofs &amp; Variable Manipulation
                              </h3>
                              <span className="text-[11px] text-slate-500 font-mono">DBE Paper 1 Grade 12</span>
                            </div>

                            <div className="rounded-xl overflow-hidden bg-black shadow-inner">
                              <video
                                controls
                                className="w-full max-h-[420px] object-contain"
                                src="/assets/exponential-relations-lesson.mp4"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <p className="text-xs text-slate-500">
                              Watch the step-by-step breakdown of exponential laws applied in reverse to isolate variables and prove non-standard equations.
                            </p>
                          </div>

                          {/* Comprehensive Course Notes */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs text-slate-700">
                            <div>
                              <h3 className="text-base font-black text-slate-900 tracking-tight">
                                Course Notes: Advanced Exponential Relations
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Topic: Exponential Proofs and Variable Manipulation (Grade 12 CAPS / IEB)
                              </p>
                            </div>

                            {/* 1. Fundamentals & Laws */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#b82e2e]">
                                1. Fundamentals &amp; Laws
                              </h4>
                              <p>
                                Before we tackle complex proofs, we must master the foundational rules of exponents. In Grade 12, we often use these laws &quot;backward&quot; or to link different variables together.
                              </p>

                              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div>
                                  <strong className="text-slate-900">&bull; Base:</strong> The number being multiplied (e.g., in <span className="font-mono">k^x</span>, <span className="font-mono">k</span> is the base).
                                </div>
                                <div>
                                  <strong className="text-slate-900">&bull; Exponent (Index):</strong> The power to which the base is raised (e.g., in <span className="font-mono">k^x</span>, <span className="font-mono">x</span> is the exponent).
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                                  <thead className="bg-slate-50 text-slate-900 font-bold">
                                    <tr>
                                      <th className="p-2.5 border border-slate-200">Law Name</th>
                                      <th className="p-2.5 border border-slate-200 font-mono">Formula</th>
                                      <th className="p-2.5 border border-slate-200">Verbal Rule</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="p-2.5 border border-slate-200 font-bold">Product Law</td>
                                      <td className="p-2.5 border border-slate-200 font-mono text-[#b82e2e]">a^m · a^n = a^(m+n)</td>
                                      <td className="p-2.5 border border-slate-200">When multiplying the same bases, <strong>add</strong> the exponents.</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2.5 border border-slate-200 font-bold">Quotient Law</td>
                                      <td className="p-2.5 border border-slate-200 font-mono text-[#b82e2e]">a^m ÷ a^n = a^(m-n)</td>
                                      <td className="p-2.5 border border-slate-200">When dividing the same bases, <strong>subtract</strong> the exponents.</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2.5 border border-slate-200 font-bold">Power Law</td>
                                      <td className="p-2.5 border border-slate-200 font-mono text-[#b82e2e]">(a^m)^n = a^(m · n)</td>
                                      <td className="p-2.5 border border-slate-200">A power raised to another power means <strong>multiply</strong> exponents.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* 2. Concept Logic Diagram */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#b82e2e]">
                                2. Concept Logic Diagram
                              </h4>
                              <p>
                                This diagram illustrates the &quot;bridge&quot; between different variables using a common base (k):
                              </p>

                              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-center">
                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="font-bold text-blue-900 text-xs">Branch X (Given)</p>
                                    <p className="font-mono text-[#b82e2e] font-bold text-xs mt-1">k^(1/x) = 3</p>
                                  </div>
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="font-bold text-emerald-900 text-xs">Branch Y (Given)</p>
                                    <p className="font-mono text-[#b82e2e] font-bold text-xs mt-1">k^(1/y) = 4</p>
                                  </div>
                                </div>

                                <div className="text-slate-400 text-base">&darr;</div>

                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto">
                                  <p className="font-bold text-amber-900 text-xs">The &quot;Same-Base&quot; Law</p>
                                  <p className="font-mono text-slate-800 font-bold text-xs mt-1">
                                    k^(1/x) · k^(1/y) = k^(1/x + 1/y)
                                  </p>
                                </div>

                                <div className="text-slate-400 text-base">&darr;</div>

                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl max-w-md mx-auto">
                                  <p className="font-bold text-purple-900 text-xs">Substitution &amp; Final Result</p>
                                  <p className="font-mono text-slate-800 text-xs mt-1">
                                    3 · 4 = 12 &bull; Since 12 = k^(1/w) ⟹ 1/w = 1/x + 1/y
                                  </p>
                                  <p className="font-mono text-[#b82e2e] font-extrabold text-sm mt-1">
                                    w = (xy) / (x + y)
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* 3. Worked Example Proof */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#b82e2e]">
                                3. Worked Example (The Proof)
                              </h4>
                              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 font-mono text-xs">
                                <p className="text-amber-300 font-bold">
                                  Problem: Given k^(1/x) = 3, k^(1/y) = 4, and k^(1/w) = 12. Prove that w = (xy)/(x+y).
                                </p>
                                <div className="space-y-1 text-slate-200 pt-1">
                                  <p><strong>Step 1:</strong> Identify numerical relationship: 3 × 4 = 12</p>
                                  <p><strong>Step 2:</strong> Substitute exponential forms: k^(1/x) · k^(1/y) = k^(1/w)</p>
                                  <p><strong>Step 3:</strong> Apply Product Law: k^(1/x + 1/y) = k^(1/w)</p>
                                  <p><strong>Step 4:</strong> Drop the bases: 1/x + 1/y = 1/w</p>
                                  <p><strong>Step 5:</strong> Find common denominator: (y + x)/(xy) = 1/w ⟹ <strong>w = (xy)/(x+y) (Q.E.D.)</strong></p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 4. Mastery Quiz (Exact Architecture from src/archive/quiz/page.tsx) */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                              <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">
                                  4. Mastery Quiz: 10 Questions
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Test your understanding from basic exponential laws to complex matric proofs.
                                </p>
                              </div>
                              {isQuizSubmitted ? (
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200">
                                    Score: {quizScore} / {totalQuizMarks} marks ({Math.round((quizScore / totalQuizMarks) * 100)}%)
                                  </span>
                                  <button
                                    onClick={handleQuizRetake}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                  >
                                    Retake Quiz
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={handleQuizSubmit}
                                  className="px-4 py-2 bg-[#b82e2e] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  Submit Quiz Assessment
                                </button>
                              )}
                            </div>

                            {/* Top Stepper Button Pills (1 to 10) */}
                            <div className="flex flex-wrap gap-1.5 pb-2">
                              {EXPONENTIAL_QUIZ_DATA.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveQuizIdx(idx)}
                                  className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${getQuizSidebarColor(
                                    idx,
                                    quizStatuses[idx],
                                    activeQuizIdx === idx
                                  )}`}
                                >
                                  {idx + 1}
                                </button>
                              ))}
                            </div>

                            {/* Active Question Display Card */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200 text-slate-700">
                                    Question {activeQuizIdx + 1} of 10
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                    {currentQ.intensity} Intensity
                                  </span>
                                </div>
                                <span className="font-extrabold text-xs text-[#b82e2e]">
                                  {currentQ.marks} Marks
                                </span>
                              </div>

                              <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                {currentQ.question}
                              </p>

                              {/* Options */}
                              <div className="space-y-2.5 pt-1">
                                {currentQ.options.map((opt, oIdx) => {
                                  const isSelected = (quizSelectedAnswers[activeQuizIdx] || []).includes(oIdx);
                                  const isCorrect = currentQ.correctAnswers.includes(oIdx);

                                  let optColor = "bg-white border-slate-200 text-slate-800 hover:border-slate-300";
                                  if (isQuizSubmitted) {
                                    if (isCorrect) {
                                      optColor = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                                    } else if (isSelected && !isCorrect) {
                                      optColor = "bg-red-50 border-red-300 text-red-900";
                                    }
                                  } else if (isSelected) {
                                    optColor = "bg-red-50 border-[#b82e2e] text-[#b82e2e] font-bold";
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => handleQuizSelectOption(activeQuizIdx, oIdx)}
                                      disabled={isQuizSubmitted}
                                      className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center gap-3 transition-colors cursor-pointer ${optColor}`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                                          isSelected
                                            ? "border-[#b82e2e] bg-[#b82e2e] text-white"
                                            : "border-slate-300"
                                        }`}
                                      >
                                        {isSelected ? "✓" : ""}
                                      </div>
                                      <span className="font-medium">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Actions Bar */}
                              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                                <button
                                  onClick={() => setActiveQuizIdx(Math.max(0, activeQuizIdx - 1))}
                                  disabled={activeQuizIdx === 0}
                                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer font-bold"
                                >
                                  &larr; Previous
                                </button>

                                {!isQuizSubmitted && (
                                  <button
                                    onClick={handleQuizMarkNotSure}
                                    className="px-3 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg font-bold cursor-pointer"
                                  >
                                    Mark as Not Sure
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    setActiveQuizIdx(
                                      Math.min(EXPONENTIAL_QUIZ_DATA.length - 1, activeQuizIdx + 1)
                                    )
                                  }
                                  disabled={activeQuizIdx === EXPONENTIAL_QUIZ_DATA.length - 1}
                                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-black disabled:opacity-30 cursor-pointer font-bold"
                                >
                                  Next &rarr;
                                </button>
                              </div>

                              {/* Explanations Accordion (Shows in review mode or upon submission) */}
                              {isQuizSubmitted && (
                                <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                    <span>Explanation &amp; Mathematical Proof:</span>
                                  </div>
                                  <p className="text-emerald-950 font-sans leading-relaxed">
                                    {currentQ.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
  };

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
        name: targetStudent?.name || profile?.full_name || "Olwethuthando Zuma",
        studentId: targetStudent?.studentId || (profile?.role === "student" ? "STU-001" : "STU-001"),
        email: targetStudent?.email || profile?.email || "olwethu.zuma@gmail.com",
        programme: targetStudent?.programme || "Grade 12 (DBE / IEB Senior FET Phase)",
        address: targetStudent?.address || "14 Bergzicht Avenue, Constantia, Cape Town, 7806",
        enrolledModules: targetStudent?.enrolledModules || [
          "Mathematics Grade 12 (NSC Senior Phase)",
          "Physical Sciences Grade 12 (NSC Senior Phase)",
          "Life Sciences Grade 12",
          "English Home Language Grade 12",
          "First Additional Language (FAL)",
          "Life Orientation (LO)",
          "Accounting / Geography Elective",
        ],
        monthlyFee: targetStudent?.monthlyFee || 3500,
        totalDebt: targetStudent?.totalDebt || 3500,
        paidAmount: targetStudent?.paidAmount || 3500,
      };

      const institution: InstitutionDocData = {
        institutionName: "LogTraq Tutoring Academy",
        educatorName: profile?.role === "teacher" ? profile.full_name : "Lead Educator (Mathematics & Science)",
        contactEmail: "support@logtraq.co.za",
        website: "www.studyhub.logtraq.co.za",
        logoUrl: "/assets/logtraq-logo-clean.png",
      };

      return generateDocumentHtml(type, student, institution, notes || docExtraNotes);
    },
    [profile, docExtraNotes]
  );

  // Fetch session & profile
  useEffect(() => {
    async function loadData() {
      try {
        let currentProf: Profile | null = null;
        let isDemoActive = false;

        if (typeof window !== "undefined") {
          const demoRaw = localStorage.getItem("studyhub_demo_session");
          if (demoRaw) {
            try {
              const parsed = JSON.parse(demoRaw);
              if (parsed?.role) {
                isDemoActive = true;
                currentProf = {
                  id: parsed.role === "teacher" ? "demo-teacher-01" : "STU-001",
                  email: parsed.email || (parsed.role === "teacher" ? "demo.teacher@studyhub.co.za" : "olwethu.zuma@gmail.com"),
                  role: parsed.role,
                  full_name: parsed.full_name || (parsed.role === "teacher" ? "Demo Lead Educator" : "Olwethuthando Zuma"),
                  must_change_password: false,
                  student_capacity: 50,
                };
              }
            } catch (e) {
              localStorage.removeItem("studyhub_demo_session");
            }
          }
        }

        if (!currentProf) {
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
          currentProf = prof as Profile;
        }

        setProfile(currentProf);
        setIsDemo(isDemoActive);

        if (currentProf.full_name) {
          const parts = (currentProf.full_name as string).trim().split(" ");
          setProfileFirstName(parts[0] || "");
          setProfileSurname(parts.slice(1).join(" ") || "");
        }

        const defaultInvites: StudentInvite[] = HIGH_SCHOOL_STUDENTS.map((hs) => ({
          id: hs.studentId,
          student_name: hs.name,
          student_email: hs.email,
          invite_code: hs.studentId,
          temp_password: `StudyHub-${hs.studentId.replace("STU-", "")}`,
          status: "active",
          created_at: new Date(Date.now() - hs.num * 86400000).toISOString(),
          phone: hs.phone,
        }));

        if (currentProf.role === "teacher") {
          if (!isDemoActive) {
            const { data: invData } = await supabase
              .from("student_invites")
              .select("*")
              .order("created_at", { ascending: false });

            if (invData && invData.length >= 5) {
              setInvites(invData);
              setDocStudentId(invData[0].id);
              setInvStudentId(invData[0].id);
            } else {
              const existingEmails = new Set((invData || []).map((i) => (i.student_email || "").toLowerCase()));
              const merged = [...(invData || [])];
              for (const std of defaultInvites) {
                if (!existingEmails.has(std.student_email.toLowerCase())) {
                  merged.push(std);
                }
              }
              const finalFive = merged.slice(0, 5);
              setInvites(finalFive);
              if (finalFive.length > 0) {
                setDocStudentId(finalFive[0].id);
                setInvStudentId(finalFive[0].id);
              }
            }
          } else {
            setInvites(defaultInvites);
            setDocStudentId(defaultInvites[0].id);
            setInvStudentId(defaultInvites[0].id);
          }
        } else {
          // Learner role
          setDocStudentId("STU-001");
          setInvStudentId("STU-001");
          setActiveDepartment("modules");
          setActiveSubPage("registered_modules");
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
  const currentTiles = isTeacher ? TEACHER_TILES : STUDENT_TILES;
  const currentMenus = isTeacher ? TEACHER_MENUS : STUDENT_MENUS;
  const activeSubMenuItems = currentMenus[activeDepartment] || [];

  // Centralized navigation handler syncing React state and browser history
  const navigateTo = useCallback(
    (deptId: string, subPageId?: string) => {
      const menus = isTeacher ? TEACHER_MENUS : STUDENT_MENUS;
      let resolvedSub = subPageId;
      if (!resolvedSub) {
        if (deptId === "dashboard") {
          resolvedSub = "";
        } else {
          resolvedSub = menus[deptId]?.[0]?.id || "overview";
        }
      }

      setActiveDepartment(deptId);
      setActiveSubPage(resolvedSub);
      setStatusMessage(null);
      setShowNotifications(false);

      try {
        if (typeof window !== "undefined") {
          let targetUrl = "/dashboard";
          if (deptId !== "dashboard") {
            targetUrl = `/dashboard?dept=${encodeURIComponent(deptId)}&tab=${encodeURIComponent(resolvedSub)}`;
          }
          window.history.pushState({ dept: deptId, subPage: resolvedSub }, "", targetUrl);
        }
      } catch (err) {
        console.warn("History push error:", err);
      }
    },
    [isTeacher]
  );

  // Initialize history on mount and listen to Chrome Back / Forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if initial URL on page load has a department query (?dept=...&tab=...)
    const params = new URLSearchParams(window.location.search);
    const urlDept = params.get("dept");
    const urlTab = params.get("tab");

    if (urlDept && urlDept !== "dashboard") {
      setActiveDepartment(urlDept);
      if (urlTab) {
        setActiveSubPage(urlTab);
      }
      window.history.replaceState(
        { dept: urlDept, subPage: urlTab || "" },
        "",
        window.location.href
      );
    } else {
      window.history.replaceState({ dept: "dashboard", subPage: "" }, "", "/dashboard");
    }

    // Chrome Back / Forward handler
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.dept) {
        setActiveDepartment(state.dept);
        setActiveSubPage(state.subPage || "");
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        const dept = searchParams.get("dept") || "dashboard";
        const tab = searchParams.get("tab") || "";
        setActiveDepartment(dept);
        setActiveSubPage(tab);
      }

      setStatusMessage(null);
      setShowNotifications(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // When clicking a dashboard tile, enter that department and set its first sub-page
  const handleOpenDepartment = (deptId: string) => {
    navigateTo(deptId);
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("studyhub_demo_session");
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    if (typeof window !== "undefined") {
      window.location.replace("/home");
    }
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
      navigateTo(n.dept, n.subPage);
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
    navigateTo("finance", "all_invoices");
    setStatusMessage({ type: "success", text: `Invoice ${newInv.invoiceNo} issued for ${targetStudent.student_name}` });
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError("");
    if (!enrollFirstName.trim() || !enrollSurname.trim() || !enrollEmail.trim()) {
      setEnrollError("First name, surname, and student email are required.");
      return;
    }

    const fullName = `${enrollFirstName.trim()} ${enrollSurname.trim()}`;
    const generatedCode = enrollStudentNumber.trim() || `STU-${Date.now().toString().slice(-6)}`;
    const tempPassword = `Pass!${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: StudentInvite = {
      id: `stu-${Date.now()}`,
      student_name: fullName,
      student_email: enrollEmail.trim(),
      invite_code: generatedCode,
      temp_password: tempPassword,
      status: "pending",
      created_at: new Date().toISOString(),
      phone: enrollPhone.trim() || undefined,
    };

    if (!isDemo) {
      try {
        if (profile?.id) {
          await supabase.from("student_invites").insert({
            teacher_id: profile.id,
            student_name: fullName,
            student_email: enrollEmail.trim(),
            invite_code: generatedCode,
            temp_password: tempPassword,
            status: "pending",
          });
        }
      } catch (err) {
        console.warn("Could not insert invite into Supabase:", err);
      }
    }

    setInvites([newStudent, ...invites]);
    setEnrollFirstName("");
    setEnrollSurname("");
    setEnrollEmail("");
    setEnrollPhone("");
    setEnrollStudentNumber("");
    setShowEnrollModal(false);
    setStatusMessage({
      type: "success",
      text: isDemo
        ? `🔒 Client Sandbox: Simulated enrollment for ${fullName} (${generatedCode}) in memory. Live database records remain protected.`
        : `${fullName} enrolled successfully (Student No: ${generatedCode})`,
    });
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

  const handleExecuteBulkImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setImportingBulk(true);
    const newInvites: StudentInvite[] = validRows.map((r, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      student_name: r.name,
      student_email: r.email,
      invite_code: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
      temp_password: `Pass!${Math.floor(1000 + Math.random() * 9000)}`,
      status: "pending",
      created_at: new Date().toISOString(),
    }));

    setInvites([...newInvites, ...invites]);
    setParsedRows([]);
    setSpreadsheetText("");
    setImportingBulk(false);
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
    invite_code: "STU-001",
    student_email: "student@example.com",
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
      {/* Sandbox Top Warning Pill Banner for Client Demonstrations */}
      {isDemo && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2 relative z-50">
          <span>🔒</span>
          <span>
            <strong>Client Demonstration Sandbox</strong> &bull; Read-only preview mode. Live student records &amp; credentials protected.
          </span>
          <button
            onClick={handleLogout}
            className="ml-3 px-2 py-0.5 bg-amber-800 text-white rounded text-[11px] font-bold hover:bg-amber-900 cursor-pointer"
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* Universal Top Header: Clean Executive White Banner */}
      <header className="w-full border-b border-slate-200 bg-white px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs relative">
        {/* Left: Authentic a+ Logo + LogTraq with Back Arrow when inside a department */}
        <div className="flex items-center gap-2 select-none">
          {activeDepartment !== "dashboard" && (
            <button
              onClick={() => navigateTo("dashboard")}
              aria-label="Back to Dashboard"
              title="Return to Dashboard Launchpad"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <div className="h-4 w-[1px] bg-slate-300 ml-1"></div>
            </button>
          )}

          <div
            onClick={() => {
              navigateTo("dashboard");
            }}
            className="flex items-center gap-2.5 cursor-pointer"
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

          {/* Log Out Action Button */}
          <button
            onClick={handleLogout}
            aria-label="Log Out"
            className="p-2 rounded-full transition-colors relative cursor-pointer text-slate-600 hover:text-[#b82e2e] hover:bg-red-50"
            title="Log Out"
          >
            <LogoutIcon className="w-5 h-5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          {/* Clickable Profile Avatar: Goes straight to Profile Settings */}
          <div
            onClick={() => {
              navigateTo("settings", isTeacher ? "institution_profile" : "account_profile");
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
          {/* Department-Specific Left Sidebar: Slate Theme */}
          <aside className="w-64 border-r border-slate-700/60 bg-[#1e293b] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-57px)] text-white shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-wider px-3 mb-2">
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
                          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
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
                          navigateTo(activeDepartment, item.id);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isActive
                            ? "bg-[#b82e2e] text-white font-bold shadow-sm"
                            : "text-slate-300 hover:text-white hover:bg-white/5 font-medium"
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
            <div className="border-t border-white/10 pt-3 space-y-1">
              <p className="text-[11px] text-slate-400 px-3 truncate">{profile.email}</p>
              <button
                onClick={() => setShowPasswordChangeModal(true)}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 w-full text-left font-medium block cursor-pointer rounded-lg hover:bg-white/5 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 w-full text-left font-medium block cursor-pointer rounded-lg hover:bg-red-950/40 transition-colors"
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
                  <button onClick={() => navigateTo("dashboard")} className="hover:text-slate-700 underline cursor-pointer">
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
                onClick={() => navigateTo("dashboard")}
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
                {/* 1. Student Account (Invoice) & High School Tuition Statement */}
                {activeSubPage === "student_account" && (
                  <div className="space-y-5">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">Official Tuition Statement &amp; Invoice</h2>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            R 0.00 Outstanding &bull; Account Paid in Full
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Official statement of account &amp; fee ledger &bull; LogTraq High School STEM Tutoring.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => printDocument(getDocHtml("student_invoice"))}
                          className="px-4 py-2 bg-[#b82e2e] hover:bg-[#a02626] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Print / Save as PDF</span>
                        </button>
                        <button
                          onClick={() => downloadDocument(getDocHtml("student_invoice"), "LogTraq_Tuition_Statement.html")}
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
                      <h3 className="text-base font-bold text-slate-900">High School Tuition Settlement (Paystack)</h3>
                      <p className="text-xs text-slate-500">
                        Settle tuition fees instantly via Debit Card, Credit Card, or Capitec Pay with immediate digital receipt generation.
                      </p>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between font-medium">
                          <span>Current Account Status:</span>
                          <span className="font-bold text-emerald-700">Paid in Full (R 0.00 Due)</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Learner Reference Number:</span>
                          <span className="font-mono font-bold text-slate-800">STU-001</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Registered Learner:</span>
                          <span className="font-bold text-slate-800">{profile?.full_name || "Olwethuthando Zuma"}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setStatusMessage({
                            type: "success",
                            text: "Account is in good standing: All Term 1 fees are fully settled with thanks.",
                          });
                        }}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Account Paid in Full &bull; View Receipt
                      </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm text-xs">
                      <h3 className="text-sm font-bold text-slate-900">Direct Bank Remittance (EFT)</h3>
                      <p className="text-slate-500">For electronic funds transfers, please utilize the official academy account details:</p>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                        <p><strong>Bank:</strong> First National Bank (FNB) / Standard Bank</p>
                        <p><strong>Account Name:</strong> LogTraq Tutoring Academy (Pty) Ltd</p>
                        <p><strong>Account Number:</strong> 62849201948</p>
                        <p><strong>Branch Code:</strong> 250655</p>
                        <p><strong>Beneficiary Reference:</strong> <span className="font-mono font-bold text-[#b82e2e]">STU-001 (Olwethuthando Zuma)</span></p>
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
                        <span className="text-xs text-slate-500">Verified official receipts</span>
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
                            <td className="py-3 px-4 font-mono">2026/01/15</td>
                            <td className="py-3 px-4 font-medium text-slate-900">Direct EFT Tuition Settlement</td>
                            <td className="py-3 px-4 font-mono text-slate-500">EFT-STU001-TERM1</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">R 3,500.00</td>
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
                            <td className="py-3 px-4 font-mono">2026/01/10</td>
                            <td className="py-3 px-4 font-medium text-slate-900">Annual Matric Study Pack &amp; Past Papers</td>
                            <td className="py-3 px-4 font-mono text-slate-500">CARD-PAY-002931</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">R 700.00</td>
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
                        <h3 className="text-sm font-bold text-slate-900">2026 High School Academic Fee Structure</h3>
                        <p className="text-slate-500">Approved termly tuition fee schedule for Grade 12 DBE/IEB NSC candidates.</p>
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
                        <span>7-Subject Senior FET Package (Maths, Physics, Life Sciences, English, FAL, LO, Elective)</span>
                        <strong className="text-slate-900">R 3,500.00 / term</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span>Interactive Video Lessons &amp; StudyHub LMS Access</span>
                        <strong className="text-emerald-700">Included</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span>Grade 12 Past Exam Papers &amp; Worked Solutions Pack</span>
                        <strong className="text-emerald-700">Included</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span>Weekly Live Virtual Tutorials (Google Meet / Zoom)</span>
                        <strong className="text-emerald-700">Included</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- STUDENT: MY MODULES / LEARNING HUB --- */}
            {!isTeacher && activeDepartment === "modules" && (
              <div className="space-y-6">
                {activeSubPage === "registered_modules" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Registered Matric Subjects</h2>
                        <p className="text-xs text-slate-500">Grade 12 Senior FET Phase (DBE / IEB Curriculum)</p>
                      </div>
                      <button
                        onClick={() => navigateTo("modules", "studyhub_demo")}
                        className="px-4 py-2 bg-[#b82e2e] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Open Study Hub Demo &amp; Quiz</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Subject 1: Mathematics */}
                      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-sm hover:border-[#b82e2e]/40 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">MATRIC STEM</span>
                          <span className="text-xs text-emerald-700 font-bold">Current Mark: 88%</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Mathematics Grade 12</h3>
                          <p className="text-xs text-slate-500 mt-1">Calculus, Functions &amp; Inverses, Analytical Geometry, Trigonometry, Exponential Relations.</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => navigateTo("modules", "studyhub_demo")}
                            className="px-3 py-1.5 bg-[#b82e2e] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Watch Video Lesson
                          </button>
                          <button
                            onClick={() => navigateTo("modules", "studyhub_demo")}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Take 10-Q Quiz
                          </button>
                        </div>
                      </div>

                      {/* Subject 2: Physical Sciences */}
                      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-sm hover:border-[#b82e2e]/40 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded">MATRIC STEM</span>
                          <span className="text-xs text-emerald-700 font-bold">Current Mark: 82%</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Physical Sciences Grade 12</h3>
                          <p className="text-xs text-slate-500 mt-1">Newtonian Mechanics, Work-Energy-Power, Organic Chemistry, Doppler Effect.</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => navigateTo("modules", "study_materials")}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Download Revision Pack
                          </button>
                        </div>
                      </div>

                      {/* Subject 3: Life Sciences */}
                      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-sm hover:border-[#b82e2e]/40 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">MATRIC BIOLOGY</span>
                          <span className="text-xs text-emerald-700 font-bold">Current Mark: 79%</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Life Sciences Grade 12</h3>
                          <p className="text-xs text-slate-500 mt-1">DNA Code of Life, Meiosis, Genetics &amp; Inheritance, Human Evolution.</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => navigateTo("modules", "study_materials")}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Download Exam Pack
                          </button>
                        </div>
                      </div>

                      {/* Subject 4: English Home Language */}
                      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-sm hover:border-[#b82e2e]/40 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">MATRIC LANGUAGE</span>
                          <span className="text-xs text-emerald-700 font-bold">Current Mark: 84%</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">English Home Language Grade 12</h3>
                          <p className="text-xs text-slate-500 mt-1">Shakespeare / Drama, Prescribed Poetry, Transactional Writing &amp; Critical Language.</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => printDocument(getDocHtml("academic_progress"))}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            View SBA Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Study Hub Demo inside Learner Portal */}
                {activeSubPage === "studyhub_demo" && (
                  <div>{renderStudyHubDemo()}</div>
                )}

                {/* Sub-tab 3: Past Papers & Exam Packs */}
                {activeSubPage === "study_materials" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-xs">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Matric DBE/IEB Past Exam Packs &amp; Solutions</h3>
                      <p className="text-slate-500 mt-0.5">Official past papers and step-by-step worked solutions for Grade 12 exam readiness.</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <strong className="text-slate-900 block">Mathematics Paper 1 (Algebra, Calculus, Sequences)</strong>
                          <span className="text-[11px] text-slate-500">2025 National Senior Certificate Final Exam with Step-by-Step Marking Guidelines</span>
                        </div>
                        <button
                          onClick={() => downloadDocument(getDocHtml("academic_progress"), "Math_P1_WorkedSolutions_2025.html")}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded text-xs cursor-pointer"
                        >
                          Download Pack
                        </button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <strong className="text-slate-900 block">Physical Sciences Paper 1 (Physics Mechanics Revision Pack)</strong>
                          <span className="text-[11px] text-slate-500">Newton&apos;s Laws, Vertical Projectile Motion &amp; Work-Energy Comprehensive Worked Examples</span>
                        </div>
                        <button
                          onClick={() => downloadDocument(getDocHtml("academic_progress"), "Physics_Mechanics_MasterPack.html")}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded text-xs cursor-pointer"
                        >
                          Download Pack
                        </button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <strong className="text-slate-900 block">Life Sciences Paper 2 (Genetics, DNA &amp; Evolution)</strong>
                          <span className="text-[11px] text-slate-500">Monohybrid crosses, sex-linked inheritance &amp; phylogenetic trees practice kit</span>
                        </div>
                        <button
                          onClick={() => downloadDocument(getDocHtml("academic_progress"), "LifeSciences_Genetics_Pack.html")}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded text-xs cursor-pointer"
                        >
                          Download Pack
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 4: Progress Report */}
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

            {/* --- STUDENT: TIMETABLE (Responsive to Tutor Portal) --- */}
            {!isTeacher && activeDepartment === "timetable" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Live Teaching Schedule</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Live tutorials, exam workshops &amp; virtual meeting links scheduled by your educator.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    {teachingSlots.length} Active Sessions
                  </span>
                </div>

                {teachingSlots.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active teaching sessions scheduled by your tutor. Check announcements for upcoming dates.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teachingSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#b82e2e]/30 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-slate-200 text-slate-800">
                              {slot.dayName}, {slot.date}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-red-50 text-[#b82e2e] border border-red-100">
                              {slot.time}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {slot.provider}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{slot.topic}</h4>
                          <p className="text-[11px] text-slate-500">Tutor: Lead Educator (Mathematics &amp; Science)</p>
                        </div>
                        <div>
                          <a
                            href={slot.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            <span>Join Live Class</span>
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- STUDENT: ANNOUNCEMENTS (Responsive to Tutor Portal) --- */}
            {!isTeacher && activeDepartment === "announcements" && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Institutional Notices &amp; Circulars</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time circulars broadcast by your Lead Educator.</p>
                </div>

                {announcementsHistory.length === 0 ? (
                  <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    No announcements published yet.
                  </div>
                ) : (
                  announcementsHistory.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-4 border-[#b82e2e] bg-white border border-slate-200 rounded-r-xl p-5 shadow-sm space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[#b82e2e] uppercase tracking-wider">
                          LogTraq Academic Notice
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Posted by Lead Educator &bull; Delivered to Learner Portal</span>
                        <span className="text-emerald-700 font-semibold">&bull; Verified</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* --- STUDENT: STUDENT LIFE --- */}
            {!isTeacher && activeDepartment === "student-life" && (
              <div className="space-y-6">
                {activeSubPage === "digital_card" && (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white max-w-sm space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <Image src="/assets/logtraq-logo-clean.png" alt="LogTraq" width={100} height={32} className="object-contain" />
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                        CLEARED 2026
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#b82e2e] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {getInitials(profile?.full_name || "Olwethuthando Zuma")}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{profile?.full_name || "Olwethuthando Zuma"}</h3>
                        <p className="text-xs font-mono font-bold text-[#b82e2e]">STU-001</p>
                        <p className="text-[11px] text-slate-500 font-medium">Grade 12 DBE/IEB Candidate</p>
                        <p className="text-[10px] text-slate-400">LogTraq STEM Tutoring Academy</p>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>VERIFIED SCHOLAR</span>
                      <span>VALID: DEC 2026</span>
                    </div>
                    <button
                      onClick={() => printDocument(getDocHtml("enrolment_confirmation"))}
                      className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
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
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm text-xs max-w-lg">
                    <h3 className="text-sm font-bold text-slate-900">Learner Academic Support Desk</h3>
                    <p className="text-slate-500">Contact educational advisors, topic tutors, and student support:</p>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <p><strong>WhatsApp &amp; Tutor Helpline:</strong> <span className="font-mono text-[#b82e2e] font-bold">+27 82 123 4567</span></p>
                      <p><strong>Academic Email Support:</strong> <span className="font-mono text-slate-800">support@logtraq.co.za</span></p>
                      <p><strong>Operating Hours:</strong> Mon &ndash; Sat: 08:00 &ndash; 18:00</p>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* ========================================================================= */}
            {/* TEACHER WORKSPACE VIEWS                                                   */}
            {/* ========================================================================= */}

                        {/* --- TEACHER: STUDENT ENROLLMENTS --- */}
            {isTeacher && activeDepartment === "students" && (() => {
              const activeCount = invites.filter((i) => i.status === "active" || i.status === "claimed").length;
              const pendingCount = invites.filter((i) => i.status === "pending").length;

              const filtered = invites.filter((inv) => {
                const q = studentSearchQuery.toLowerCase().trim();
                const matchesSearch =
                  !q ||
                  (inv.student_name || "").toLowerCase().includes(q) ||
                  (inv.invite_code || "").toLowerCase().includes(q) ||
                  (inv.student_email || "").toLowerCase().includes(q);

                if (!matchesSearch) return false;
                if (studentStatusFilter === "active") return inv.status === "active" || inv.status === "claimed";
                if (studentStatusFilter === "pending") return inv.status === "pending";
                return true;
              });

              // Helper to get first name and surname
              const getSplitName = (inv: StudentInvite) => {
                const raw = (inv.student_name || "").trim();
                if (raw.includes("@")) {
                  return { first: raw.split("@")[0], surname: "" };
                }
                const parts = raw.split(" ");
                if (parts.length > 1) {
                  return { first: parts[0], surname: parts.slice(1).join(" ") };
                }
                return { first: raw, surname: "" };
              };

              return (
                <div className="space-y-6">
                  {/* Top Header Banner */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Student Enrollments
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowEnrollModal(true);
                        }}
                        className="px-4 py-2 bg-[#b82e2e] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>+ Enrol New Student</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Import Spreadsheet</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv,.xlsx,.xls,.txt"
                        className="hidden"
                        onChange={handleDirectFileImport}
                      />
                    </div>
                  </div>

                  {/* Search, Filter Pills & Counter Bar */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search by name, surname, student no, or email..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-64 sm:w-80 focus:outline-none focus:border-[#b82e2e]"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-medium mr-1 text-[11px]">Filter:</span>
                      <button
                        onClick={() => setStudentStatusFilter("all")}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          studentStatusFilter === "all" ? "bg-slate-900 text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        All ({invites.length})
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter("active")}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          studentStatusFilter === "active" ? "bg-emerald-600 text-white shadow-2xs" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        Active ({activeCount})
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter("pending")}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          studentStatusFilter === "pending" ? "bg-amber-600 text-white shadow-2xs" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                        }`}
                      >
                        Pending ({pendingCount})
                      </button>
                    </div>
                  </div>

                  {/* Enrollments Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                          <tr>
                            <th className="py-3 px-4">Student Name &amp; Surname</th>
                            <th className="py-3 px-4">Student Number</th>
                            <th className="py-3 px-4">Student Email</th>
                            <th className="py-3 px-4">Phone / Contact</th>
                            <th className="py-3 px-4">Enrolment Date</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filtered.map((inv) => {
                            const { first, surname } = getSplitName(inv);
                            const isPending = inv.status === "pending";
                            return (
                              <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-white">
                                      {getInitials(inv.student_name)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-xs">{inv.student_name}</p>
                                      {surname ? (
                                        <p className="text-[11px] text-slate-500">
                                          Name: <span className="font-medium text-slate-700">{first}</span> &bull; Surname: <span className="font-medium text-slate-700">{surname}</span>
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-mono font-bold text-[#b82e2e] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                    {inv.invite_code}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-700 font-medium">
                                  {inv.student_email}
                                </td>
                                <td className="py-3.5 px-4 text-slate-500">
                                  {inv.phone || "-"}
                                </td>
                                <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                  {new Date(inv.created_at || Date.now()).toLocaleDateString("en-ZA", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      isPending
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    }`}
                                  >
                                    {isPending ? "Pending" : "Active"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                                  <button
                                    onClick={() => setSelectedDetailStudent(inv)}
                                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#b82e2e] hover:text-[#b82e2e] text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDocStudentId(inv.id);
                                      navigateTo("documents", "indemnity_form");
                                    }}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs cursor-pointer transition-colors"
                                  >
                                    Docs
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                          {filtered.length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                {studentSearchQuery
                                  ? `No students found matching "${studentSearchQuery}".`
                                  : "No student enrollments found. Click '+ Enrol New Student' to register your first student."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Single Enrolment Modal */}
                  {showEnrollModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">Enrol New Student</h3>
                            <p className="text-xs text-slate-500">Add student details and generate enrolment credentials</p>
                          </div>
                          <button
                            onClick={() => setShowEnrollModal(false)}
                            className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>

                        {enrollError && (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                            {enrollError}
                          </div>
                        )}

                        <form onSubmit={handleEnrollStudent} className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                              <input
                                type="text"
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                placeholder="e.g. Nontobeko"
                                value={enrollFirstName}
                                onChange={(e) => setEnrollFirstName(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Surname *</label>
                              <input
                                type="text"
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                placeholder="e.g. Mbawu"
                                value={enrollSurname}
                                onChange={(e) => setEnrollSurname(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Student Email Address *</label>
                            <input
                              type="email"
                              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                              placeholder="student@gmail.com"
                              value={enrollEmail}
                              onChange={(e) => setEnrollEmail(e.target.value)}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                              <input
                                type="tel"
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                placeholder="+27 82 123 4567"
                                value={enrollPhone}
                                onChange={(e) => setEnrollPhone(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Student Number (or Auto-Generate)</label>
                              <input
                                type="text"
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-[#b82e2e] font-bold focus:outline-none focus:border-[#b82e2e]"
                                placeholder="e.g. STU-829104"
                                value={enrollStudentNumber}
                                onChange={(e) => setEnrollStudentNumber(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowEnrollModal(false)}
                              className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-[#b82e2e] hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              Complete Enrolment
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Student Details Inspection Modal */}
                  {selectedDetailStudent && (() => {
                    const { first, surname } = getSplitName(selectedDetailStudent);
                    const isPending = selectedDetailStudent.status === "pending";
                    return (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#b82e2e] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                {getInitials(selectedDetailStudent.student_name)}
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-slate-900">{selectedDetailStudent.student_name}</h3>
                                <p className="font-mono text-[#b82e2e] font-bold text-xs">{selectedDetailStudent.invite_code}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedDetailStudent(null)}
                              className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
                            >
                              &times;
                            </button>
                          </div>

                          <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                            <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">First Name:</span>
                              <span className="font-bold text-slate-900">{first}</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Surname:</span>
                              <span className="font-bold text-slate-900">{surname || "-"}</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Student Number:</span>
                              <span className="font-mono font-bold text-[#b82e2e]">{selectedDetailStudent.invite_code}</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Email Address:</span>
                              <span className="font-bold text-slate-900">{selectedDetailStudent.student_email}</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Phone / WhatsApp:</span>
                              <span className="font-semibold text-slate-800">{selectedDetailStudent.phone || "Not Provided"}</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Enrolment Date:</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(selectedDetailStudent.created_at || Date.now()).toLocaleDateString("en-ZA", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-0.5">
                              <span className="text-slate-500 font-medium">Enrolment Status:</span>
                              <button
                                onClick={() => {
                                  const nextStatus = isPending ? "active" : "pending";
                                  setInvites((prev) =>
                                    prev.map((s) => (s.id === selectedDetailStudent.id ? { ...s, status: nextStatus } : s))
                                  );
                                  setSelectedDetailStudent({ ...selectedDetailStudent, status: nextStatus });
                                  setStatusMessage({ type: "success", text: `Status updated to ${nextStatus.toUpperCase()}` });
                                }}
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition-colors ${
                                  isPending
                                    ? "bg-amber-100 text-amber-800 hover:bg-emerald-100 hover:text-emerald-800"
                                    : "bg-emerald-100 text-emerald-800 hover:bg-amber-100 hover:text-amber-800"
                                }`}
                                title="Click to toggle status"
                              >
                                {isPending ? "Pending (Click to Activate)" : "Active (Click to Mark Pending)"}
                              </button>
                            </div>
                          </div>

                          {selectedDetailStudent.temp_password && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Temporary Password</p>
                                <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{selectedDetailStudent.temp_password}</p>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `Student No: ${selectedDetailStudent.invite_code}\nEmail: ${selectedDetailStudent.student_email}\nPassword: ${selectedDetailStudent.temp_password}\nPortal: studyhub.logtraq.co.za`
                                  );
                                  setStatusMessage({ type: "success", text: "Login credentials copied to clipboard!" });
                                }}
                                className="px-2.5 py-1 bg-white border border-red-200 text-[#b82e2e] font-bold text-xs rounded-lg hover:bg-red-100/50 cursor-pointer shadow-2xs"
                              >
                                Copy Login Info
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                              onClick={() => {
                                setDocStudentId(selectedDetailStudent.id);
                                setSelectedDetailStudent(null);
                                navigateTo("documents", "indemnity_form");
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Open Student Documents
                            </button>
                            <button
                              onClick={() => setSelectedDetailStudent(null)}
                              className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
            {/* --- TEACHER: FINANCE --- */}
            {isTeacher && activeDepartment === "finance" && (
              <div className="space-y-6">
                {activeSubPage === "ledger_overview" && (
                  <div className="space-y-6">
                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Received</p>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <p className="text-3xl font-black text-emerald-700 tracking-tight">R 21,000.00</p>
                        <p className="text-[11px] text-slate-500">Cleared electronic settlements &bull; Term 1</p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-[#b82e2e] uppercase tracking-wider">Total Outstanding</p>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#b82e2e]"></span>
                        </div>
                        <p className="text-3xl font-black text-[#b82e2e] tracking-tight">R 3,500.00</p>
                        <p className="text-[11px] text-slate-500">Arrears across 2 enrolled learners</p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Total Enrolment Billings</p>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">R 24,500.00</p>
                        <p className="text-[11px] text-slate-500">5 Learners &bull; 7 Core High School Subjects</p>
                      </div>
                    </div>

                    {/* Clean Numbered List of Enrolled Students with Payment Status & Print Invoice Button */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            Enrolled Student Fee Ledger
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            High school tuition balances, payment status, and instant official statement generation.
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg self-start sm:self-auto">
                          5 Active Accounts
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                              <th className="py-3.5 px-4 w-12 text-center">#</th>
                              <th className="py-3.5 px-4">Student &amp; Number</th>
                              <th className="py-3.5 px-4">Curriculum &amp; Subjects</th>
                              <th className="py-3.5 px-4 text-right">Billed</th>
                              <th className="py-3.5 px-4 text-right">Paid</th>
                              <th className="py-3.5 px-4 text-center">Payment Status</th>
                              <th className="py-3.5 px-4 text-right">Invoice / Statement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {HIGH_SCHOOL_STUDENTS.map((st) => {
                              const owes = st.status === "owing";
                              const balance = st.billed - st.paid;
                              return (
                                <tr key={st.num} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-4 px-4 text-center font-bold text-slate-400">
                                    {st.num}
                                  </td>
                                  <td className="py-4 px-4">
                                    <p className="font-bold text-slate-900 text-xs">{st.name}</p>
                                    <p className="font-mono text-[11px] text-[#b82e2e] font-bold">{st.studentId}</p>
                                    <p className="text-[11px] text-slate-500">{st.email}</p>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="font-semibold text-slate-800">{st.grade}</span>
                                    <p className="text-[11px] text-slate-500">7 Core Subjects (Maths, Sciences, HL, FAL, LO)</p>
                                  </td>
                                  <td className="py-4 px-4 text-right font-semibold text-slate-900 font-mono">
                                    R {st.billed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-4 px-4 text-right font-bold text-emerald-700 font-mono">
                                    R {st.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    {owes ? (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                                        Still Owing R {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Paid in Full
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        onClick={() =>
                                          printDocument(
                                            getDocHtml("student_invoice", {
                                              name: st.name,
                                              studentId: st.studentId,
                                              email: st.email,
                                              totalDebt: st.billed,
                                              paidAmount: st.paid,
                                            })
                                          )
                                        }
                                        className="px-3 py-1.5 bg-[#b82e2e] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                      >
                                        <span>Print Invoice</span>
                                      </button>
                                      <button
                                        onClick={() =>
                                          downloadDocument(
                                            getDocHtml("student_invoice", {
                                              name: st.name,
                                              studentId: st.studentId,
                                              email: st.email,
                                              totalDebt: st.billed,
                                              paidAmount: st.paid,
                                            }),
                                            `${st.studentId}_HighSchool_Invoice.html`
                                          )
                                        }
                                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                        title="Download HTML"
                                      >
                                        &darr;
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubPage === "paystack_settings" && (
                  <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        P
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Paystack Gateway &amp; Settlement</h3>
                        <p className="text-xs text-slate-500">Automated parent debit order, credit card, and instant EFT settlements.</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                      <p className="text-sm font-bold text-slate-800">
                        Coming to you after discussion and Paystack setup
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Automated clearing with South African banking rails (ABSA, FNB, Standard Bank, Capitec, Nedbank) will be enabled following gateway account verification.
                      </p>
                    </div>
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
              <div className="space-y-6">
                {activeSubPage === "teaching_schedule" && (() => {
                  const year = calendarMonth.getFullYear();
                  const month = calendarMonth.getMonth();
                  const firstDayIndex = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const monthName = calendarMonth.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

                  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);

                  const slotsForSelectedDate = selectedCalendarDate
                    ? teachingSlots.filter((s) => s.date === selectedCalendarDate)
                    : [];

                  return (
                    <div className="space-y-6">
                      {/* Interactive Calendar Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                              Teaching Schedule &bull; {monthName}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Click any date to view scheduled lessons, add teaching slots, and launch virtual sessions.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const prev = new Date(year, month - 1, 1);
                                setCalendarMonth(prev);
                              }}
                              className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors cursor-pointer"
                              title="Previous Month"
                            >
                              &lt;
                            </button>
                            <span className="font-extrabold text-xs text-slate-800 px-2 min-w-[120px] text-center">
                              {monthName}
                            </span>
                            <button
                              onClick={() => {
                                const next = new Date(year, month + 1, 1);
                                setCalendarMonth(next);
                              }}
                              className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors cursor-pointer"
                              title="Next Month"
                            >
                              &gt;
                            </button>
                            <button
                              onClick={() => setCalendarMonth(new Date(2026, 8, 1))}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer ml-2"
                            >
                              Today
                            </button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 text-center text-xs">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d} className="py-2 font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                              {d}
                            </div>
                          ))}

                          {blanks.map((b) => (
                            <div key={`blank-${b}`} className="min-h-[70px] rounded-xl bg-slate-50/50"></div>
                          ))}

                          {days.map((d) => {
                            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                            const isSelected = selectedCalendarDate === dateStr;
                            const daySlots = teachingSlots.filter((s) => s.date === dateStr);
                            const hasSlots = daySlots.length > 0;

                            return (
                              <button
                                key={d}
                                onClick={() => {
                                  setSelectedCalendarDate(dateStr);
                                  setNewSlotDate(dateStr);
                                }}
                                className={`min-h-[76px] p-2 rounded-xl text-left flex flex-col justify-between border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-red-50/80 border-[#b82e2e] shadow-xs"
                                    : hasSlots
                                    ? "bg-slate-50/80 border-slate-200 hover:border-slate-300"
                                    : "bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span
                                    className={`text-xs font-extrabold ${
                                      isSelected ? "text-[#b82e2e]" : hasSlots ? "text-slate-900" : "text-slate-600"
                                    }`}
                                  >
                                    {d}
                                  </span>
                                  {hasSlots && (
                                    <span className="w-2 h-2 rounded-full bg-[#b82e2e]"></span>
                                  )}
                                </div>
                                {hasSlots && (
                                  <div className="mt-1 space-y-1 w-full">
                                    {daySlots.slice(0, 2).map((slot) => (
                                      <div
                                        key={slot.id}
                                        className="text-[9.5px] font-bold truncate bg-red-100/70 text-[#b82e2e] px-1.5 py-0.5 rounded"
                                        title={slot.topic}
                                      >
                                        {slot.time.split("-")[0]} {slot.topic}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Day View & Modal Slot Creator */}
                      {selectedCalendarDate && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="text-base font-black text-slate-900 tracking-tight">
                                Teaching Slots for {new Date(selectedCalendarDate + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                              </h4>
                              <p className="text-xs text-slate-500">
                                Launch your scheduled virtual lecture directly with your session meeting link.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowAddSlotModal(true)}
                                className="px-4 py-2 bg-[#b82e2e] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <span>+ Add Teaching Slot</span>
                              </button>
                              <button
                                onClick={() => setSelectedCalendarDate(null)}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                              >
                                &times; Close Day
                              </button>
                            </div>
                          </div>

                          {/* Slots List for this Date */}
                          {slotsForSelectedDate.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                              <p className="text-xs font-semibold text-slate-500">
                                No teaching slots scheduled for this day yet.
                              </p>
                              <button
                                onClick={() => setShowAddSlotModal(true)}
                                className="text-xs text-[#b82e2e] font-bold hover:underline cursor-pointer"
                              >
                                + Click here to add day, time, and topic
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {slotsForSelectedDate.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                        {slot.provider}
                                      </span>
                                      <span className="font-mono text-xs font-bold text-[#b82e2e]">
                                        {slot.time}
                                      </span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">{slot.topic}</p>
                                    <p className="font-mono text-[11px] text-slate-500 truncate max-w-md">
                                      {slot.link}
                                    </p>
                                  </div>

                                  <a
                                    href={slot.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-[#b82e2e] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
                                  >
                                    <span>Launch {slot.provider} Session &rarr;</span>
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add Slot Modal */}
                      {showAddSlotModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div>
                                <h3 className="text-base font-bold text-slate-900">Add Teaching Slot</h3>
                                <p className="text-xs text-slate-500">Add day, time, topic, and session meeting link.</p>
                              </div>
                              <button
                                onClick={() => setShowAddSlotModal(false)}
                                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
                              >
                                &times;
                              </button>
                            </div>

                            <form onSubmit={handleAddTeachingSlot} className="space-y-3.5 text-xs">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Date *</label>
                                <input
                                  type="date"
                                  value={newSlotDate}
                                  onChange={(e) => setNewSlotDate(e.target.value)}
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-[#b82e2e]"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Time Range *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 15:30 - 17:00"
                                  value={newSlotTime}
                                  onChange={(e) => setNewSlotTime(e.target.value)}
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Lesson Topic &amp; Class *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Grade 12 Mathematics - Exponential Proofs"
                                  value={newSlotTopic}
                                  onChange={(e) => setNewSlotTopic(e.target.value)}
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block font-bold text-slate-700 mb-1">Meeting Platform *</label>
                                  <select
                                    value={newSlotProvider}
                                    onChange={(e) =>
                                      setNewSlotProvider(e.target.value as "Google Meet" | "Zoom" | "Other")
                                    }
                                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  >
                                    <option value="Google Meet">Google Meet</option>
                                    <option value="Zoom">Zoom</option>
                                    <option value="Other">Other Virtual Link</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block font-bold text-slate-700 mb-1">Session URL Link *</label>
                                  <input
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    value={newSlotLink}
                                    onChange={(e) => setNewSlotLink(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-[#b82e2e]"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowAddSlotModal(false)}
                                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-5 py-2 bg-[#b82e2e] hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  Save &amp; Activate Slot
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Sub-Tab 2: Venues & Rooms (Custom Hourly Events Table) */}
                {activeSubPage === "venues" && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          Venues &amp; Rooms &bull; Tutor Hourly Schedule
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Create and customize your weekly allocation across physical venues and online streaming labs.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddVenueModal(true)}
                        className="px-4 py-2 bg-[#b82e2e] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <span>+ Add Venue Slot</span>
                      </button>
                    </div>

                    {/* Hourly Grid Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse border border-slate-200">
                        <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider">
                          <tr>
                            <th className="p-3 border border-slate-200 w-20 text-center">Time</th>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                              <th key={day} className="p-3 border border-slate-200 min-w-[130px]">
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((hour) => (
                            <tr key={hour} className="hover:bg-slate-50/50">
                              <td className="p-2.5 border border-slate-200 font-mono font-bold text-center text-slate-500 bg-slate-50/70">
                                {hour}
                              </td>
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                                const evs = venueEvents.filter((v) => v.day === day && v.hour === hour);
                                return (
                                  <td key={day} className="p-2 border border-slate-200 align-top">
                                    {evs.length > 0 ? (
                                      <div className="space-y-1">
                                        {evs.map((ev) => (
                                          <div
                                            key={ev.id}
                                            className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-[#b82e2e]"
                                          >
                                            <p className="font-extrabold text-[10.5px]">{ev.venue}</p>
                                            <p className="text-[10px] text-slate-700 truncate">{ev.title}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setNewVenueDay(day);
                                          setNewVenueHour(hour);
                                          setShowAddVenueModal(true);
                                        }}
                                        className="w-full h-full min-h-[36px] flex items-center justify-center text-slate-300 hover:text-[#b82e2e] hover:bg-slate-100 rounded text-xs transition-colors cursor-pointer"
                                        title={`Add venue slot for ${day} at ${hour}`}
                                      >
                                        +
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Venue Modal */}
                    {showAddVenueModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                              <h3 className="text-base font-bold text-slate-900">Schedule Venue Slot</h3>
                              <p className="text-xs text-slate-500">Allocate day, hour, venue, and subject title.</p>
                            </div>
                            <button
                              onClick={() => setShowAddVenueModal(false)}
                              className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
                            >
                              &times;
                            </button>
                          </div>

                          <form onSubmit={handleAddVenueEvent} className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Day *</label>
                                <select
                                  value={newVenueDay}
                                  onChange={(e) => setNewVenueDay(e.target.value)}
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                >
                                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Hour *</label>
                                <select
                                  value={newVenueHour}
                                  onChange={(e) => setNewVenueHour(e.target.value)}
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-[#b82e2e]"
                                >
                                  {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Venue / Room *</label>
                              <input
                                type="text"
                                placeholder="e.g. Room A, Online Studio 1, Science Lab"
                                value={newVenueName}
                                onChange={(e) => setNewVenueName(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Class / Event Description *</label>
                              <input
                                type="text"
                                placeholder="e.g. Matric Mathematics Tutorial - Calculus"
                                value={newVenueTitle}
                                onChange={(e) => setNewVenueTitle(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                required
                              />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowAddVenueModal(false)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2 bg-[#b82e2e] hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                              >
                                Add to Table
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- TEACHER: ACADEMIC OVERVIEW --- */}
            {isTeacher && activeDepartment === "academic-overview" && (
              <div className="space-y-6">
                {/* 1. Curriculum Modules */}
                {activeSubPage === "curriculum" && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          High School Curriculum Modules (Grade 12 FET Phase)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Accredited DBE &amp; IEB syllabus alignment across 7 secondary subjects.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-50 text-[#b82e2e] text-xs font-bold rounded-lg self-start sm:self-auto">
                        7 Registered Subjects
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          code: "MTH-12",
                          name: "Mathematics (Paper 1 & 2)",
                          desc: "Differential calculus, polynomial functions, advanced trigonometry, analytical geometry & Euclidean proofs.",
                          status: "Active Term 1",
                        },
                        {
                          code: "PHY-12",
                          name: "Physical Sciences (Physics & Chemistry)",
                          desc: "Newtonian mechanics, work-energy, electrostatics, Doppler effect, organic chemistry & chemical equilibrium.",
                          status: "Active Term 1",
                        },
                        {
                          code: "LFS-12",
                          name: "Life Sciences (Biology)",
                          desc: "DNA structure, meiosis, genetics, endocrine system, homeostasis and human evolution.",
                          status: "Active Term 1",
                        },
                        {
                          code: "ENG-12",
                          name: "English Home Language (HL)",
                          desc: "Literary analysis, Shakespearean drama, prescribed poetry, comprehension and critical essay writing.",
                          status: "Active Term 1",
                        },
                        {
                          code: "FAL-12",
                          name: "First Additional Language (FAL)",
                          desc: "IsiZulu / Afrikaans language structures, literature study, oral presentations and transactional texts.",
                          status: "Active Term 1",
                        },
                        {
                          code: "LFO-12",
                          name: "Life Orientation (LO)",
                          desc: "Career pathways, tertiary study readiness, study skills and physical development.",
                          status: "Active Term 1",
                        },
                        {
                          code: "ACC-12",
                          name: "Accounting & Commercial Studies",
                          desc: "Financial statements, reconciliation, ratio analysis, internal auditing and inventory valuation.",
                          status: "Active Term 1",
                        },
                      ].map((m) => (
                        <div key={m.code} className="p-4 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
                              {m.code}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {m.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                          <p className="text-xs text-slate-500">{m.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Assessment Marks & Stats */}
                {activeSubPage === "marks" && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          Assessment Marks &amp; Academic Stats
                        </h3>
                        <p className="text-xs text-slate-500">
                          Matric continuous diagnostic test scores and SBA benchmark results.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg self-start sm:self-auto">
                        Academy Average: 81.4%
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10.5px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Student</th>
                            <th className="py-3 px-4">Student ID</th>
                            <th className="py-3 px-4 text-center">Maths P1 Drill</th>
                            <th className="py-3 px-4 text-center">Physics SBA</th>
                            <th className="py-3 px-4 text-center">Life Sciences</th>
                            <th className="py-3 px-4 text-center">English HL</th>
                            <th className="py-3 px-4 text-right">Overall Mark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { name: "Olwethuthando Zuma", id: "STU-829104", m1: "92%", m2: "88%", m3: "90%", m4: "85%", ov: "88.8%" },
                            { name: "Nontobeko Mbawu", id: "STU-294012", m1: "86%", m2: "84%", m3: "82%", m4: "88%", ov: "85.0%" },
                            { name: "Sipho Dlamini", id: "STU-382910", m1: "78%", m2: "74%", m3: "76%", m4: "80%", ov: "77.0%" },
                            { name: "Keisha Patel", id: "STU-471029", m1: "94%", m2: "90%", m3: "91%", m4: "89%", ov: "91.0%" },
                            { name: "Liam Van Der Merwe", id: "STU-592810", m1: "72%", m2: "68%", m3: "70%", m4: "71%", ov: "70.3%" },
                          ].map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                              <td className="py-3 px-4 font-mono font-bold text-[#b82e2e]">{row.id}</td>
                              <td className="py-3 px-4 text-center font-semibold">{row.m1}</td>
                              <td className="py-3 px-4 text-center font-semibold">{row.m2}</td>
                              <td className="py-3 px-4 text-center font-semibold">{row.m3}</td>
                              <td className="py-3 px-4 text-center font-semibold">{row.m4}</td>
                              <td className="py-3 px-4 text-right font-black text-emerald-700">{row.ov}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Study Hub Demo (Moodle Build Demo with Video, Syllabus, Notes, and 10-Question Quiz) */}
                {activeSubPage === "studyhub_demo" && renderStudyHubDemo()}
              </div>
            )}

            {/* --- TEACHER: ANNOUNCEMENTS --- */}
            {isTeacher && activeDepartment === "announcements" && (
              <div className="space-y-6">
                {/* 1. Broadcast New Notice Form */}
                {activeSubPage === "broadcast" && (
                  <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Broadcast Institutional Circular
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Broadcast official announcements directly to student portals and email channels.
                      </p>
                    </div>

                    <form onSubmit={handleBroadcastNotice} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                          placeholder="e.g. Saturday Matric Mathematics Revision Workshop"
                          value={broadcastNoticeTitle}
                          onChange={(e) => setBroadcastNoticeTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Target Audience *</label>
                        <select
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                          value={broadcastNoticeAudience}
                          onChange={(e) => setBroadcastNoticeAudience(e.target.value)}
                        >
                          <option value="All 5 Enrolled Students (Grade 12)">All 5 Enrolled Students (Grade 12)</option>
                          <option value="Active Students Only">Active Students Only</option>
                          <option value="Parents & Guardians">Parents &amp; Guardians</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Notice Message &amp; Instructions *</label>
                        <textarea
                          rows={4}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                          placeholder="Type circular details, revision topics, venue instructions..."
                          value={broadcastNoticeMessage}
                          onChange={(e) => setBroadcastNoticeMessage(e.target.value)}
                          required
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Dispatched via: In-App Student Portal &bull; Instant Email Alert
                        </span>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#b82e2e] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Publish Circular
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 2. Notice History & Archive */}
                {activeSubPage === "archive" && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          Notice Delivery History &amp; Archive
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Audit history of circulars published to student portals with verification status.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                        {announcementsHistory.length} Archived Notices
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {announcementsHistory.map((item) => (
                        <div key={item.id} className="p-6 space-y-2 hover:bg-slate-50/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">
                              Recipient Audience: <strong className="text-slate-900">{item.recipients}</strong>
                            </span>
                            <span>&bull;</span>
                            <span>Channel: {item.channel}</span>
                            <span>&bull;</span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                        placeholder="STU-001"
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
                        value={isTeacher ? "Lead Educator / Administrator" : "Registered Scholar"}
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
                      navigateTo("students", "single_enroll");
                    }}
                    className="px-4 py-2.5 bg-[#b82e2e] hover:bg-[#a02626] text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    + Register Single Student
                  </button>
                  <button
                    onClick={() => {
                      navigateTo("students", "bulk_import");
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
