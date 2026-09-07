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

interface StudentDocumentItem {
  id: string;
  name: string;
  type: DocumentType | string;
  status: "Verified" | "Pending" | "Generated";
  date: string;
}

interface StudentInvite {
  id: string;
  student_name: string;
  student_email: string;
  invite_code: string;
  temp_password: string;
  status: string;
  created_at: string;
  preferred_name?: string;
  dob?: string;
  gender?: string;
  id_number?: string;
  nationality?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_phone?: string;
  guardian_email?: string;
  emergency_contact?: string;
  campus_id?: string;
  faculty?: string;
  enrolled_modules?: string[];
  enrolment_date?: string;
  academic_year?: string;
  documents?: StudentDocumentItem[];
  parent_consent?: "Signed" | "Pending";
  conduct_consent?: "Signed" | "Pending";
  popia_consent?: "Signed" | "Pending";
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

// Available Academic Modules for Curriculum Assignment
const AVAILABLE_MODULES = [
  { code: "MTH101", name: "Mathematics Grade 12 (Caps)", credits: "16 Credits", faculty: "Natural & Agricultural Sciences" },
  { code: "PHY101", name: "Physical Sciences (Physics & Chemistry)", credits: "16 Credits", faculty: "Engineering & Technology" },
  { code: "LIF101", name: "Life Sciences / Biology", credits: "14 Credits", faculty: "Health Sciences" },
  { code: "ENG101", name: "English Home Language & Literature", credits: "12 Credits", faculty: "Humanities & Languages" },
  { code: "CSC101", name: "Computer Applications & Python", credits: "16 Credits", faculty: "Informatics & Computing" },
  { code: "ACC101", name: "Financial Accounting & Business", credits: "14 Credits", faculty: "Economic & Management Sciences" },
];

// Rich Sample Data for Institutional Student Profiles
const DEFAULT_STUDENTS: StudentInvite[] = [
  {
    id: "stu-001",
    student_name: "Lesedi Kgosi",
    student_email: "lesedi.kgosi@up.ac.za",
    invite_code: "u23489102",
    temp_password: "Pass489102!",
    status: "active",
    created_at: "2026-01-15T08:00:00.000Z",
    preferred_name: "Lesedi",
    dob: "2006-05-14",
    gender: "Female",
    id_number: "0605145123088",
    nationality: "South African",
    phone: "+27 82 459 1029",
    whatsapp: "+27 82 459 1029",
    address: "14 Rosebank Road, Rondebosch, Cape Town, 7700",
    guardian_name: "Dr. Peter Kgosi",
    guardian_relationship: "Father",
    guardian_phone: "+27 83 902 4411",
    guardian_email: "peter.kgosi@gmail.com",
    emergency_contact: "+27 83 902 4411 (Dr. Peter Kgosi)",
    campus_id: "UP-HAT-2026",
    faculty: "Faculty of Engineering & Built Environment",
    enrolled_modules: ["MTH101", "PHY101", "CSC101"],
    enrolment_date: "15 Jan 2026",
    academic_year: "2026",
    documents: [
      { id: "doc-1", name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Verified", date: "16 Jan 2026" },
      { id: "doc-2", name: "Student Code of Conduct Pledge", type: "conduct_pledge", status: "Verified", date: "16 Jan 2026" },
      { id: "doc-3", name: "Proof of Enrolment & Registration", type: "enrolment_letter", status: "Generated", date: "17 Jan 2026" },
      { id: "doc-4", name: "Certified ID Document / Passport", type: "id_copy", status: "Verified", date: "15 Jan 2026" },
    ],
    parent_consent: "Signed",
    conduct_consent: "Signed",
    popia_consent: "Signed",
  },
  {
    id: "stu-002",
    student_name: "Sarah van der Merwe",
    student_email: "sarah.vdm@up.ac.za",
    invite_code: "u23881903",
    temp_password: "Pass881903!",
    status: "active",
    created_at: "2026-01-18T09:30:00.000Z",
    preferred_name: "Sarah",
    dob: "2006-09-22",
    gender: "Female",
    id_number: "0609220088081",
    nationality: "South African",
    phone: "+27 71 332 9011",
    whatsapp: "+27 71 332 9011",
    address: "42 Hatfield Crescent, Pretoria, Gauteng, 0028",
    guardian_name: "Annatjie van der Merwe",
    guardian_relationship: "Mother",
    guardian_phone: "+27 82 555 1928",
    guardian_email: "annatjie@vdm.co.za",
    emergency_contact: "+27 82 555 1928 (Annatjie v/d Merwe)",
    campus_id: "UP-HAT-2026",
    faculty: "Faculty of Natural & Agricultural Sciences",
    enrolled_modules: ["MTH101", "LIF101", "ENG101"],
    enrolment_date: "18 Jan 2026",
    academic_year: "2026",
    documents: [
      { id: "doc-5", name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Verified", date: "19 Jan 2026" },
      { id: "doc-6", name: "Student Code of Conduct Pledge", type: "conduct_pledge", status: "Verified", date: "19 Jan 2026" },
      { id: "doc-7", name: "Academic Progress Report", type: "progress_report", status: "Generated", date: "20 Jan 2026" },
    ],
    parent_consent: "Signed",
    conduct_consent: "Signed",
    popia_consent: "Signed",
  },
  {
    id: "stu-003",
    student_name: "David Sithole",
    student_email: "david.sithole@up.ac.za",
    invite_code: "u24019284",
    temp_password: "Pass019284!",
    status: "pending",
    created_at: "2026-02-01T11:15:00.000Z",
    preferred_name: "Dave",
    dob: "2007-01-10",
    gender: "Male",
    id_number: "0701105928084",
    nationality: "South African",
    phone: "+27 60 412 8871",
    whatsapp: "+27 60 412 8871",
    address: "88 Jorissen Street, Braamfontein, Johannesburg, 2001",
    guardian_name: "Bongani Sithole",
    guardian_relationship: "Father",
    guardian_phone: "+27 81 229 0041",
    guardian_email: "b.sithole@telkomsa.net",
    emergency_contact: "+27 81 229 0041 (Bongani Sithole)",
    campus_id: "UP-HAT-2026",
    faculty: "Faculty of Engineering",
    enrolled_modules: ["MTH101", "PHY101"],
    enrolment_date: "01 Feb 2026",
    academic_year: "2026",
    documents: [
      { id: "doc-8", name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Pending", date: "01 Feb 2026" },
      { id: "doc-9", name: "Student Code of Conduct Pledge", type: "conduct_pledge", status: "Verified", date: "02 Feb 2026" },
    ],
    parent_consent: "Pending",
    conduct_consent: "Signed",
    popia_consent: "Pending",
  },
  {
    id: "stu-004",
    student_name: "Nthabiseng Dlamini",
    student_email: "nthabi.d@up.ac.za",
    invite_code: "u23901124",
    temp_password: "Pass901124!",
    status: "pending",
    created_at: "2026-02-05T14:20:00.000Z",
    preferred_name: "Nthabi",
    dob: "2006-11-03",
    gender: "Female",
    id_number: "0611030192087",
    nationality: "South African",
    phone: "+27 79 123 4567",
    whatsapp: "+27 79 123 4567",
    address: "12 Lynnwood Road, Brooklyn, Pretoria, 0181",
    guardian_name: "Grace Dlamini",
    guardian_relationship: "Mother",
    guardian_phone: "+27 82 991 2233",
    guardian_email: "grace.d@vodamail.co.za",
    emergency_contact: "+27 82 991 2233 (Grace Dlamini)",
    campus_id: "UP-HAT-2026",
    faculty: "Faculty of Economic & Management Sciences",
    enrolled_modules: ["ENG101", "ACC101"],
    enrolment_date: "05 Feb 2026",
    academic_year: "2026",
    documents: [
      { id: "doc-10", name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Pending", date: "05 Feb 2026" },
    ],
    parent_consent: "Pending",
    conduct_consent: "Pending",
    popia_consent: "Signed",
  },
  {
    id: "stu-005",
    student_name: "Michael Naidoo",
    student_email: "michael.naidoo@up.ac.za",
    invite_code: "u22109843",
    temp_password: "Pass109843!",
    status: "completed",
    created_at: "2025-01-10T10:00:00.000Z",
    preferred_name: "Mike",
    dob: "2005-03-18",
    gender: "Male",
    id_number: "0503185291089",
    nationality: "South African",
    phone: "+27 84 901 8832",
    whatsapp: "+27 84 901 8832",
    address: "25 Musgrave Road, Durban, KwaZulu-Natal, 4001",
    guardian_name: "Devan Naidoo",
    guardian_relationship: "Father",
    guardian_phone: "+27 83 441 9900",
    guardian_email: "dnaidoo@gmail.com",
    emergency_contact: "+27 83 441 9900 (Devan Naidoo)",
    campus_id: "UP-HAT-2025",
    faculty: "Faculty of Informatics & Computing",
    enrolled_modules: ["MTH101", "PHY101", "CSC101", "ACC101"],
    enrolment_date: "10 Jan 2025",
    academic_year: "2025",
    documents: [
      { id: "doc-11", name: "Parent Indemnity Agreement (2025)", type: "indemnity_form", status: "Verified", date: "11 Jan 2025" },
      { id: "doc-12", name: "Academic Progress Report - Final", type: "progress_report", status: "Generated", date: "15 Dec 2025" },
    ],
    parent_consent: "Signed",
    conduct_consent: "Signed",
    popia_consent: "Signed",
  },
];

// --- Department Navigation Definitions (Static Module-Level) ---
const TEACHER_TILES = [
  { id: "students", title: "Students", icon: StudentsIllustrativeIcon, subtitle: "Enrolments, modules & student profiles" },
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

// Sub-Navigation Menus INSIDE Each Tile
const TEACHER_MENUS: Record<string, { id: string; label: string }[]> = {
  students: [
    { id: "enrolments", label: "1. Enrolments" },
    { id: "new_enrolment", label: "â†³ New Enrolments" },
    { id: "pending_enrolments", label: "â†³ Pending Enrolments" },
    { id: "active_enrolments", label: "â†³ Active Enrolments" },
    { id: "inactive_enrolments", label: "â†³ Completed / Inactive" },
    { id: "assign_modules", label: "â†³ Assign to Module/Course" },
    { id: "student_profiles", label: "3. Student Profiles" },
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

  // Single student registration form fields
  const [singleName, setSingleName] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [singleStudentNumber, setSingleStudentNumber] = useState("");
  const [singlePhone, setSinglePhone] = useState("+27 82 000 0000");
  const [singleDob, setSingleDob] = useState("2007-03-15");
  const [singleGender, setSingleGender] = useState("Female");
  const [singleIdNumber, setSingleIdNumber] = useState("0703155123089");
  const [singleAddress, setSingleAddress] = useState("Hatfield, Pretoria, Gauteng, 0028");
  const [singleGuardianName, setSingleGuardianName] = useState("");
  const [singleGuardianRelationship, setSingleGuardianRelationship] = useState("Parent / Guardian");
  const [singleGuardianPhone, setSingleGuardianPhone] = useState("+27 83 000 0000");
  const [singleGuardianEmail, setSingleGuardianEmail] = useState("");
  const [singleSelectedModules, setSingleSelectedModules] = useState<string[]>(["MTH101", "PHY101"]);
  const [singleError, setSingleError] = useState("");

  // Student Profiles & Enrolments active state
  const [selectedProfileStudentId, setSelectedProfileStudentId] = useState<string>("stu-001");
  const [enrolmentSearchQuery, setEnrolmentSearchQuery] = useState("");
  const [profileSearchQuery, setProfileSearchQuery] = useState("");
  const [enrolmentFilterTab, setEnrolmentFilterTab] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [moduleAssignStudentId, setModuleAssignStudentId] = useState<string>("stu-001");
  const [moduleAssignSelected, setModuleAssignSelected] = useState<string[]>(["MTH101", "PHY101", "CSC101"]);
  const [newEnrolTab, setNewEnrolTab] = useState<"single" | "bulk">("single");

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

          if (invData && invData.length > 0) {
            const merged: StudentInvite[] = invData.map((inv: any) => {
              const matchingDefault = DEFAULT_STUDENTS.find(
                (d) => d.student_email === inv.student_email || d.invite_code === inv.invite_code
              );
              return {
                ...matchingDefault,
                ...inv,
                enrolled_modules: inv.enrolled_modules || matchingDefault?.enrolled_modules || ["MTH101", "PHY101"],
                status: inv.status || matchingDefault?.status || "active",
                documents: matchingDefault?.documents || [
                  { id: `doc-${inv.id}-1`, name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Verified", date: "16 Jan 2026" },
                  { id: `doc-${inv.id}-2`, name: "Student Code of Conduct Pledge", type: "conduct_pledge", status: "Verified", date: "16 Jan 2026" },
                  { id: `doc-${inv.id}-3`, name: "Proof of Enrolment & Registration", type: "enrolment_letter", status: "Generated", date: "17 Jan 2026" },
                ],
                parent_consent: matchingDefault?.parent_consent || "Signed",
                conduct_consent: matchingDefault?.conduct_consent || "Signed",
                popia_consent: matchingDefault?.popia_consent || "Signed",
              };
            });
            const existingEmails = new Set(merged.map((m) => m.student_email));
            const extraDefaults = DEFAULT_STUDENTS.filter((d) => !existingEmails.has(d.student_email));
            const fullList = [...merged, ...extraDefaults];
            setInvites(fullList);
            if (fullList.length > 0) {
              setDocStudentId(fullList[0].id);
              setInvStudentId(fullList[0].id);
              setSelectedProfileStudentId(fullList[0].id);
              setModuleAssignStudentId(fullList[0].id);
              setModuleAssignSelected(fullList[0].enrolled_modules || ["MTH101", "PHY101"]);
            }
          } else {
            setInvites(DEFAULT_STUDENTS);
            setDocStudentId(DEFAULT_STUDENTS[0].id);
            setInvStudentId(DEFAULT_STUDENTS[0].id);
            setSelectedProfileStudentId(DEFAULT_STUDENTS[0].id);
            setModuleAssignStudentId(DEFAULT_STUDENTS[0].id);
            setModuleAssignSelected(DEFAULT_STUDENTS[0].enrolled_modules || ["MTH101", "PHY101", "CSC101"]);
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

  const handleSingleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError("");
    if (!singleName || !singleEmail) {
      setSingleError("Student Name and Primary Email are required.");
      return;
    }

    const generatedNum = singleStudentNumber.trim() || `STU-${Math.floor(100000 + Math.random() * 900000)}`;
    const newStudent: StudentInvite = {
      id: `stu-${Date.now()}`,
      student_name: singleName,
      student_email: singleEmail,
      invite_code: generatedNum,
      temp_password: `Pass${Math.floor(1000 + Math.random() * 9000)}!`,
      status: "pending",
      created_at: new Date().toISOString(),
      preferred_name: singleName.split(" ")[0] || singleName,
      dob: singleDob || "2007-03-15",
      gender: singleGender || "Female",
      id_number: singleIdNumber || "Pending Verification",
      nationality: "South African",
      phone: singlePhone || "+27 82 000 0000",
      whatsapp: singlePhone || "+27 82 000 0000",
      address: singleAddress || "Gauteng, South Africa",
      guardian_name: singleGuardianName || "Primary Guardian",
      guardian_relationship: singleGuardianRelationship || "Parent / Guardian",
      guardian_phone: singleGuardianPhone || "+27 83 000 0000",
      guardian_email: singleGuardianEmail || singleEmail,
      emergency_contact: `${singleGuardianPhone || "+27 83 000 0000"} (${singleGuardianName || "Guardian"})`,
      campus_id: "UP-HAT-2026",
      faculty: "Faculty of Natural & Applied Sciences",
      enrolled_modules: singleSelectedModules.length > 0 ? singleSelectedModules : ["MTH101", "PHY101"],
      enrolment_date: new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }),
      academic_year: "2026",
      documents: [
        { id: `doc-${Date.now()}-1`, name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Pending", date: new Date().toLocaleDateString("en-ZA") },
        { id: `doc-${Date.now()}-2`, name: "Student Code of Conduct Pledge", type: "conduct_pledge", status: "Pending", date: new Date().toLocaleDateString("en-ZA") },
        { id: `doc-${Date.now()}-3`, name: "Proof of Enrolment & Registration", type: "enrolment_letter", status: "Generated", date: new Date().toLocaleDateString("en-ZA") },
      ],
      parent_consent: "Pending",
      conduct_consent: "Pending",
      popia_consent: "Signed",
    };

    setInvites([newStudent, ...invites]);
    setSelectedProfileStudentId(newStudent.id);
    setSingleName("");
    setSingleEmail("");
    setSingleStudentNumber("");
    navigateTo("students", "enrolments");
    setStatusMessage({ type: "success", text: `${newStudent.student_name} registered under Student No ${newStudent.invite_code}` });
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
      preferred_name: r.name.split(" ")[0] || r.name,
      dob: "2007-01-01",
      gender: "Unspecified",
      id_number: "Pending Submission",
      nationality: "South African",
      phone: "+27 82 000 0000",
      whatsapp: "+27 82 000 0000",
      address: "Pretoria, South Africa",
      guardian_name: "Parent / Guardian",
      guardian_relationship: "Parent",
      guardian_phone: "+27 83 000 0000",
      guardian_email: r.email,
      emergency_contact: "+27 83 000 0000",
      campus_id: "UP-HAT-2026",
      faculty: "Department of Science & Technology",
      enrolled_modules: ["MTH101", "PHY101"],
      enrolment_date: new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }),
      academic_year: "2026",
      documents: [
        { id: `doc-bulk-${idx}-1`, name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Pending", date: new Date().toLocaleDateString("en-ZA") },
        { id: `doc-bulk-${idx}-2`, name: "Student Code of Conduct Pledge", type: "conduct_pledge", status: "Pending", date: new Date().toLocaleDateString("en-ZA") },
      ],
      parent_consent: "Pending",
      conduct_consent: "Pending",
      popia_consent: "Signed",
    }));

    setInvites([...newInvites, ...invites]);
    setParsedRows([]);
    setSpreadsheetText("");
    setImportingBulk(false);
    navigateTo("students", "enrolments");
    setStatusMessage({ type: "success", text: `Successfully registered ${validRows.length} students into Enrolments Hub` });
  };

  // Quick Action: Update Enrolment Status
  const handleUpdateStudentStatus = (studentId: string, newStatus: string) => {
    setInvites((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
    setStatusMessage({ type: "success", text: `Student enrolment status updated to ${newStatus.toUpperCase()}` });
  };

  // Quick Action: Save Assigned Modules for Student
  const handleSaveModuleAssignment = () => {
    setInvites((prev) =>
      prev.map((s) => (s.id === moduleAssignStudentId ? { ...s, enrolled_modules: moduleAssignSelected } : s))
    );
    setStatusMessage({ type: "success", text: `Curriculum modules updated (${moduleAssignSelected.length} assigned)` });
  };

  // Quick Action: Toggle Module in Assignment Tool
  const handleToggleModuleAssign = (code: string) => {
    setModuleAssignSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Direct Document Access from Profile
  const handleOpenStudentDocument = (studentId: string, docType: string) => {
    setDocStudentId(studentId);
    navigateTo("documents", docType);
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
                          onClick={() => navigateTo("finance", "make_payment")}
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

            {/* --- TEACHER: STUDENTS (1. ENROLMENTS & 3. STUDENT PROFILES) --- */}
            {isTeacher && activeDepartment === "students" && (() => {
              const activeCount = invites.filter((i) => i.status === "active").length;
              const pendingCount = invites.filter((i) => i.status === "pending").length;
              const inactiveCount = invites.filter((i) => i.status === "completed" || i.status === "inactive").length;
              
              const filteredEnrolments = invites.filter((inv) => {
                const matchesSearch =
                  !enrolmentSearchQuery.trim() ||
                  inv.student_name.toLowerCase().includes(enrolmentSearchQuery.toLowerCase()) ||
                  inv.invite_code.toLowerCase().includes(enrolmentSearchQuery.toLowerCase()) ||
                  inv.student_email.toLowerCase().includes(enrolmentSearchQuery.toLowerCase());
                
                if (!matchesSearch) return false;
                if (enrolmentFilterTab === "active") return inv.status === "active";
                if (enrolmentFilterTab === "pending") return inv.status === "pending";
                if (enrolmentFilterTab === "inactive") return inv.status === "completed" || inv.status === "inactive";
                return true;
              });

              const selectedProfileStudent =
                invites.find((i) => i.id === selectedProfileStudentId) || invites[0] || DEFAULT_STUDENTS[0];

              const moduleAssignTarget =
                invites.find((i) => i.id === moduleAssignStudentId) || selectedProfileStudent;

              return (
                <div className="space-y-6">
                  {/* Department Top Banner & Quick Sub-Nav Tabs */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-50 text-[#b82e2e] border border-red-200">
                          {activeSubPage === "student_profiles" ? "3. Student Profiles" : "1. Enrolments"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">&bull; Institutional Scholar Directory</span>
                      </div>
                      <h2 className="text-lg font-black text-slate-900 mt-1">
                        {activeSubPage === "student_profiles"
                          ? "Individual Student Profiles & Legal Records"
                          : activeSubPage === "new_enrolment"
                          ? "New Student Enrolment & Registration"
                          : activeSubPage === "assign_modules"
                          ? "Assign Students to Modules & Courses"
                          : activeSubPage === "pending_enrolments"
                          ? "Pending Enrolments & Document Approval"
                          : activeSubPage === "active_enrolments"
                          ? "Active Student Enrolments Roster"
                          : activeSubPage === "inactive_enrolments"
                          ? "Completed & Inactive Enrolments"
                          : "1. Enrolments Command Hub"}
                      </h2>
                    </div>

                    {/* Quick Switch Buttons */}
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        onClick={() => navigateTo("students", "enrolments")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeSubPage === "enrolments" || activeSubPage === "roster"
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        1. Enrolments
                      </button>
                      <button
                        onClick={() => navigateTo("students", "new_enrolment")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeSubPage === "new_enrolment"
                            ? "bg-[#b82e2e] text-white shadow-sm"
                            : "bg-red-50 text-[#b82e2e] hover:bg-red-100 border border-red-200"
                        }`}
                      >
                        + New Enrolment
                      </button>
                      <button
                        onClick={() => navigateTo("students", "assign_modules")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeSubPage === "assign_modules"
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Assign Modules
                      </button>
                      <button
                        onClick={() => navigateTo("students", "student_profiles")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeSubPage === "student_profiles"
                            ? "bg-[#b82e2e] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        3. Student Profiles
                      </button>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* VIEW 1: ENROLMENTS COMMAND HUB (or roster)                                */}
                  {/* ========================================================================= */}
                  {(activeSubPage === "enrolments" || activeSubPage === "roster") && (
                    <div className="space-y-6">
                      {/* KPI Summary Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div
                          onClick={() => setEnrolmentFilterTab("all")}
                          className={`bg-white border rounded-2xl p-4.5 cursor-pointer transition-all shadow-xs ${
                            enrolmentFilterTab === "all" ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                          </div>
                          <p className="text-2xl font-black text-slate-900 mt-2">{invites.length}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">All registered scholars</p>
                        </div>

                        <div
                          onClick={() => {
                            setEnrolmentFilterTab("active");
                            navigateTo("students", "active_enrolments");
                          }}
                          className={`bg-white border rounded-2xl p-4.5 cursor-pointer transition-all shadow-xs ${
                            enrolmentFilterTab === "active" ? "border-emerald-600 ring-2 ring-emerald-500/10" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active Enrolments</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          </div>
                          <p className="text-2xl font-black text-emerald-700 mt-2">{activeCount}</p>
                          <p className="text-[11px] text-emerald-600 mt-0.5">Cleared & participating</p>
                        </div>

                        <div
                          onClick={() => {
                            setEnrolmentFilterTab("pending");
                            navigateTo("students", "pending_enrolments");
                          }}
                          className={`bg-white border rounded-2xl p-4.5 cursor-pointer transition-all shadow-xs ${
                            enrolmentFilterTab === "pending" ? "border-amber-500 ring-2 ring-amber-500/10" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Review</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          </div>
                          <p className="text-2xl font-black text-amber-700 mt-2">{pendingCount}</p>
                          <p className="text-[11px] text-amber-600 mt-0.5">Awaiting docs / consent</p>
                        </div>

                        <div
                          onClick={() => {
                            setEnrolmentFilterTab("inactive");
                            navigateTo("students", "inactive_enrolments");
                          }}
                          className={`bg-white border rounded-2xl p-4.5 cursor-pointer transition-all shadow-xs ${
                            enrolmentFilterTab === "inactive" ? "border-slate-600 ring-2 ring-slate-500/10" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Completed / Inactive</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                          </div>
                          <p className="text-2xl font-black text-slate-700 mt-2">{inactiveCount}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Alumni & withdrawn</p>
                        </div>
                      </div>

                      {/* 6 Inner Launchpad Action Cards (Inside the Tile) */}
                      <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Enrolment Management Hub & Workflows
                          </h3>
                          <span className="text-xs text-slate-400">Select an action or manage master records below</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Tile 1: New Enrolments */}
                          <div
                            onClick={() => navigateTo("students", "new_enrolment")}
                            className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-[#b82e2e] hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b82e2e] flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition-transform">
                              âž•
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#b82e2e] transition-colors">
                              New Enrolments
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Register single students or bulk-import via CSV/Excel spreadsheets.
                            </p>
                            <span className="inline-block mt-3 text-xs font-bold text-[#b82e2e]">
                              Open Registration Form &rarr;
                            </span>
                          </div>

                          {/* Tile 2: Pending Enrolments */}
                          <div
                            onClick={() => navigateTo("students", "pending_enrolments")}
                            className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                                â³
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                                {pendingCount} Pending
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                              Pending Enrolments
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Review admissions awaiting ID verification, indemnity forms, or payment.
                            </p>
                            <span className="inline-block mt-3 text-xs font-bold text-amber-700">
                              Review Pending &rarr;
                            </span>
                          </div>

                          {/* Tile 3: Active Enrolments */}
                          <div
                            onClick={() => navigateTo("students", "active_enrolments")}
                            className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                                ðŸŽ“
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                {activeCount} Active
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              Active Enrolments
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Manage active registered students, attendances, and academic standings.
                            </p>
                            <span className="inline-block mt-3 text-xs font-bold text-emerald-700">
                              View Active Roster &rarr;
                            </span>
                          </div>

                          {/* Tile 4: Completed / Inactive */}
                          <div
                            onClick={() => navigateTo("students", "inactive_enrolments")}
                            className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                                ðŸ“
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                                {inactiveCount} Inactive
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                              Completed / Inactive
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Historical records for graduated alumni and withdrawn enrolments.
                            </p>
                            <span className="inline-block mt-3 text-xs font-bold text-slate-600">
                              Access Archives &rarr;
                            </span>
                          </div>

                          {/* Tile 5: Assign student to module/course */}
                          <div
                            onClick={() => navigateTo("students", "assign_modules")}
                            className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition-transform">
                              ðŸ“š
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              Assign to Module / Course
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Allocate curriculum modules, timetable groups, and subject credits.
                            </p>
                            <span className="inline-block mt-3 text-xs font-bold text-blue-700">
                              Open Module Assigner &rarr;
                            </span>
                          </div>

                          {/* Tile 6: 3. Student Profiles */}
                          <div
                            onClick={() => navigateTo("students", "student_profiles")}
                            className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-[#b82e2e] hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b82e2e] flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition-transform">
                              ðŸªª
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#b82e2e] transition-colors">
                              3. Student Profiles
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              View individual profiles: personal, contact, guardian, docs & consent status.
                            </p>
                            <span className="inline-block mt-3 text-xs font-bold text-[#b82e2e]">
                              Inspect Student Profiles &rarr;
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Master Enrolments Roster Table */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              Enrolments Directory ({filteredEnrolments.length} Scholars)
                            </h3>
                            <p className="text-xs text-slate-500">Live institutional enrolment ledger with quick actions</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Search by name, student no, or email..."
                              value={enrolmentSearchQuery}
                              onChange={(e) => setEnrolmentSearchQuery(e.target.value)}
                              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs w-56 sm:w-64 focus:outline-none focus:border-[#b82e2e]"
                            />
                            <button
                              onClick={() => navigateTo("students", "new_enrolment")}
                              className="px-3 py-1.5 bg-[#b82e2e] text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors cursor-pointer shadow-xs shrink-0"
                            >
                              + Enrol Student
                            </button>
                          </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-slate-100 text-xs">
                          <span className="text-slate-400 font-semibold mr-1">Filter:</span>
                          <button
                            onClick={() => setEnrolmentFilterTab("all")}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              enrolmentFilterTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            All ({invites.length})
                          </button>
                          <button
                            onClick={() => setEnrolmentFilterTab("active")}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              enrolmentFilterTab === "active" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            Active ({activeCount})
                          </button>
                          <button
                            onClick={() => setEnrolmentFilterTab("pending")}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              enrolmentFilterTab === "pending" ? "bg-amber-600 text-white" : "text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            Pending ({pendingCount})
                          </button>
                          <button
                            onClick={() => setEnrolmentFilterTab("inactive")}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              enrolmentFilterTab === "inactive" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            Completed/Inactive ({inactiveCount})
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                              <tr>
                                <th className="py-3 px-4">Student & Campus ID</th>
                                <th className="py-3 px-4">Contact Details</th>
                                <th className="py-3 px-4">Enrolled Modules</th>
                                <th className="py-3 px-4">Enrolment Status</th>
                                <th className="py-3 px-4">Consent Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredEnrolments.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0">
                                        {getInitials(inv.student_name)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900 hover:text-[#b82e2e] cursor-pointer"
                                          onClick={() => {
                                            setSelectedProfileStudentId(inv.id);
                                            navigateTo("students", "student_profiles");
                                          }}
                                        >
                                          {inv.student_name}
                                        </p>
                                        <p className="font-mono text-[#b82e2e] font-bold text-[11px]">{inv.invite_code}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-slate-600">
                                    <p className="font-medium">{inv.student_email}</p>
                                    <p className="text-[11px] text-slate-400">{inv.phone || "+27 82 000 0000"}</p>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-1">
                                      {(inv.enrolled_modules && inv.enrolled_modules.length > 0
                                        ? inv.enrolled_modules
                                        : ["MTH101", "PHY101"]
                                      ).map((mod) => (
                                        <span key={mod} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                                          {mod}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {inv.status === "active" ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        ACTIVE
                                      </span>
                                    ) : inv.status === "pending" ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                        PENDING
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                                        COMPLETED
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                      <span className={`w-2 h-2 rounded-full ${inv.parent_consent === "Signed" ? "bg-emerald-500" : "bg-amber-400"}`}></span>
                                      <span className="text-slate-600 font-medium">
                                        Parent: {inv.parent_consent || "Signed"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => {
                                        setSelectedProfileStudentId(inv.id);
                                        navigateTo("students", "student_profiles");
                                      }}
                                      className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#b82e2e] hover:text-[#b82e2e] rounded-lg text-slate-700 font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                                    >
                                      View Profile &rarr;
                                    </button>
                                    <button
                                      onClick={() => {
                                        setModuleAssignStudentId(inv.id);
                                        setModuleAssignSelected(inv.enrolled_modules || ["MTH101", "PHY101"]);
                                        navigateTo("students", "assign_modules");
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium text-xs cursor-pointer transition-colors"
                                      title="Assign Modules"
                                    >
                                      Modules
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 2: NEW ENROLMENTS (Single & Bulk)                                    */}
                  {/* ========================================================================= */}
                  {activeSubPage === "new_enrolment" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-3xl">
                      {/* Tabs */}
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setNewEnrolTab("single")}
                          className={`py-3 px-5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                            newEnrolTab === "single"
                              ? "border-[#b82e2e] text-[#b82e2e]"
                              : "border-transparent text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Single Student Registration
                        </button>
                        <button
                          onClick={() => setNewEnrolTab("bulk")}
                          className={`py-3 px-5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                            newEnrolTab === "bulk"
                              ? "border-[#b82e2e] text-[#b82e2e]"
                              : "border-transparent text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Bulk Spreadsheet Import
                        </button>
                      </div>

                      {newEnrolTab === "single" && (
                        <form onSubmit={handleSingleEnroll} className="space-y-5 text-xs">
                          {singleError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold">
                              {singleError}
                            </div>
                          )}

                          {/* Section A: Student Personal Details */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                              A. Personal & Academic Identification
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="e.g. Sipho Ndlovu"
                                  value={singleName}
                                  onChange={(e) => setSingleName(e.target.value)}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Student Number (or Leave Auto)</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-[#b82e2e] font-bold focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="e.g. u23984102"
                                  value={singleStudentNumber}
                                  onChange={(e) => setSingleStudentNumber(e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Student Email Address *</label>
                                <input
                                  type="email"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="e.g. sipho.n@up.ac.za"
                                  value={singleEmail}
                                  onChange={(e) => setSingleEmail(e.target.value)}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Mobile Contact / WhatsApp</label>
                                <input
                                  type="tel"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="+27 82 000 0000"
                                  value={singlePhone}
                                  onChange={(e) => setSinglePhone(e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                                <input
                                  type="date"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  value={singleDob}
                                  onChange={(e) => setSingleDob(e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">National ID / Passport Number</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="0604125192083"
                                  value={singleIdNumber}
                                  onChange={(e) => setSingleIdNumber(e.target.value)}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Residential Physical Address</label>
                              <input
                                type="text"
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                placeholder="Street, Suburb, City, Postal Code"
                                value={singleAddress}
                                onChange={(e) => setSingleAddress(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Section B: Parent / Guardian Details */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                              B. Parent / Guardian Emergency Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Guardian Full Name</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="e.g. Mrs. Thandi Ndlovu"
                                  value={singleGuardianName}
                                  onChange={(e) => setSingleGuardianName(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                                <select
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  value={singleGuardianRelationship}
                                  onChange={(e) => setSingleGuardianRelationship(e.target.value)}
                                >
                                  <option value="Mother">Mother</option>
                                  <option value="Father">Father</option>
                                  <option value="Legal Guardian">Legal Guardian</option>
                                  <option value="Sponsor">Sponsor</option>
                                </select>
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Guardian Phone Number</label>
                                <input
                                  type="tel"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="+27 83 000 0000"
                                  value={singleGuardianPhone}
                                  onChange={(e) => setSingleGuardianPhone(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Guardian Email</label>
                                <input
                                  type="email"
                                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#b82e2e]"
                                  placeholder="guardian@example.com"
                                  value={singleGuardianEmail}
                                  onChange={(e) => setSingleGuardianEmail(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Section C: Initial Module Allocation */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                              C. Initial Module / Course Enrolment
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {AVAILABLE_MODULES.map((m) => {
                                const isChecked = singleSelectedModules.includes(m.code);
                                return (
                                  <label
                                    key={m.code}
                                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                                      isChecked ? "bg-red-50/60 border-[#b82e2e]" : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        setSingleSelectedModules((prev) =>
                                          prev.includes(m.code) ? prev.filter((c) => c !== m.code) : [...prev, m.code]
                                        );
                                      }}
                                    />
                                    <div>
                                      <p className="font-mono font-bold text-[#b82e2e] text-[11px]">{m.code}</p>
                                      <p className="text-[10px] text-slate-600 truncate">{m.name}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="pt-4 flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-[#b82e2e] text-white font-bold rounded-xl cursor-pointer hover:bg-red-700 shadow-sm text-xs transition-colors"
                            >
                              Register & Enrol Student &rarr;
                            </button>
                          </div>
                        </form>
                      )}

                      {newEnrolTab === "bulk" && (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-600">
                            Paste student names and email addresses, or upload a formatted Excel / CSV file.
                          </p>
                          <textarea
                            rows={6}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#b82e2e]"
                            placeholder="John Doe, john@example.com&#10;Sarah Smith, sarah@example.com"
                            value={spreadsheetText}
                            onChange={(e) => handleSpreadsheetTextChange(e.target.value)}
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <button
                              onClick={downloadSampleCsvTemplate}
                              className="text-xs text-[#b82e2e] hover:underline font-bold cursor-pointer"
                            >
                              ðŸ“¥ Download Sample Template (.CSV)
                            </button>
                            <button
                              onClick={handleExecuteBulkImport}
                              disabled={parsedRows.length === 0 || importingBulk}
                              className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
                            >
                              Register {parsedRows.length} Students
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 3: PENDING ENROLMENTS                                                */}
                  {/* ========================================================================= */}
                  {activeSubPage === "pending_enrolments" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Pending Enrolments ({pendingCount})</h3>
                          <p className="text-xs text-slate-500">Learners awaiting admission document signoff or fee clearing</p>
                        </div>
                        <button
                          onClick={() => navigateTo("students", "new_enrolment")}
                          className="px-3 py-1.5 bg-[#b82e2e] text-white text-xs font-bold rounded-xl"
                        >
                          + New Enrolment
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {invites
                          .filter((i) => i.status === "pending")
                          .map((inv) => (
                            <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{inv.student_name}</p>
                                <p className="font-mono text-[#b82e2e] font-bold text-xs">{inv.invite_code} &bull; {inv.student_email}</p>
                                <p className="text-xs text-amber-700 mt-1">
                                  âš ï¸ Parent Indemnity: {inv.parent_consent || "Pending"} | Conduct Pledge: {inv.conduct_consent || "Pending"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateStudentStatus(inv.id, "active")}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                                >
                                  âœ“ Approve & Activate
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedProfileStudentId(inv.id);
                                    navigateTo("students", "student_profiles");
                                  }}
                                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          ))}
                        {pendingCount === 0 && (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No pending enrolments. All student applications are cleared and active.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 4: ACTIVE ENROLMENTS                                                 */}
                  {/* ========================================================================= */}
                  {activeSubPage === "active_enrolments" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Active Student Enrolments ({activeCount})</h3>
                          <p className="text-xs text-slate-500">Currently enrolled learners in good academic standing</p>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {invites
                          .filter((i) => i.status === "active")
                          .map((inv) => (
                            <div key={inv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{inv.student_name}</p>
                                <p className="font-mono text-[#b82e2e] font-bold text-xs">{inv.invite_code} &bull; {inv.student_email}</p>
                                <div className="flex gap-1 mt-1">
                                  {(inv.enrolled_modules || ["MTH101", "PHY101"]).map((m) => (
                                    <span key={m} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedProfileStudentId(inv.id);
                                    navigateTo("students", "student_profiles");
                                  }}
                                  className="px-3 py-1.5 bg-[#b82e2e] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                                >
                                  View Full Profile &rarr;
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 5: COMPLETED / INACTIVE ENROLMENTS                                   */}
                  {/* ========================================================================= */}
                  {activeSubPage === "inactive_enrolments" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Completed & Inactive Enrolments ({inactiveCount})</h3>
                          <p className="text-xs text-slate-500">Alumni, completed scholars, or withdrawn student records</p>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {invites
                          .filter((i) => i.status === "completed" || i.status === "inactive")
                          .map((inv) => (
                            <div key={inv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{inv.student_name}</p>
                                <p className="font-mono text-slate-500 font-bold text-xs">{inv.invite_code} &bull; {inv.student_email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                                  {inv.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateStudentStatus(inv.id, "active")}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                                >
                                  Reactivate Enrolment
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedProfileStudentId(inv.id);
                                    navigateTo("students", "student_profiles");
                                  }}
                                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          ))}
                        {inactiveCount === 0 && (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No inactive or completed enrolments recorded.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 6: ASSIGN STUDENT TO MODULE/COURSE                                   */}
                  {/* ========================================================================= */}
                  {activeSubPage === "assign_modules" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-3xl">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Assign Student to Modules / Courses</h3>
                        <p className="text-xs text-slate-500">Allocate curriculum modules and manage subject enrolments</p>
                      </div>

                      {/* Select Student */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Select Scholar / Student
                        </label>
                        <select
                          value={moduleAssignStudentId}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setModuleAssignStudentId(newId);
                            const found = invites.find((i) => i.id === newId);
                            if (found) {
                              setModuleAssignSelected(found.enrolled_modules || ["MTH101", "PHY101"]);
                            }
                          }}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#b82e2e]"
                        >
                          {invites.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.student_name} ({s.invite_code}) - {s.status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Checkbox of Modules */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">
                            Select Academic Modules for {moduleAssignTarget.student_name}:
                          </label>
                          <span className="text-[11px] font-bold text-[#b82e2e]">
                            {moduleAssignSelected.length} Modules Selected
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {AVAILABLE_MODULES.map((mod) => {
                            const isSelected = moduleAssignSelected.includes(mod.code);
                            return (
                              <div
                                key={mod.code}
                                onClick={() => handleToggleModuleAssign(mod.code)}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                  isSelected ? "bg-red-50/70 border-[#b82e2e] shadow-2xs" : "border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="mt-1"
                                />
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-[#b82e2e] text-xs">{mod.code}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                      {mod.credits}
                                    </span>
                                  </div>
                                  <p className="font-bold text-slate-900 text-xs">{mod.name}</p>
                                  <p className="text-[10px] text-slate-500">{mod.faculty}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          Changes take effect immediately across student documents, Moodle bridges & rosters.
                        </p>
                        <button
                          onClick={handleSaveModuleAssignment}
                          className="px-6 py-2.5 bg-[#b82e2e] text-white font-bold rounded-xl cursor-pointer hover:bg-red-700 text-xs shadow-xs transition-colors"
                        >
                          Save Module Allocation &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 7: 3. STUDENT PROFILES (The Complete 8-Section Inspector)           */}
                  {/* ========================================================================= */}
                  {activeSubPage === "student_profiles" && (
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      {/* Left: Student Selector & Directory List */}
                      <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 shrink-0">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                            Select Scholar
                          </h4>
                          <span className="text-xs text-slate-400 font-bold">{invites.length} Records</span>
                        </div>

                        <input
                          type="text"
                          placeholder="Search scholars..."
                          value={profileSearchQuery}
                          onChange={(e) => setProfileSearchQuery(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#b82e2e]"
                        />

                        <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1 divide-y divide-slate-50">
                          {invites
                            .filter(
                              (s) =>
                                !profileSearchQuery.trim() ||
                                s.student_name.toLowerCase().includes(profileSearchQuery.toLowerCase()) ||
                                s.invite_code.toLowerCase().includes(profileSearchQuery.toLowerCase())
                            )
                            .map((s) => {
                              const isSelected = s.id === selectedProfileStudent.id;
                              return (
                                <div
                                  key={s.id}
                                  onClick={() => setSelectedProfileStudentId(s.id)}
                                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                                    isSelected
                                      ? "bg-[#1e293b] text-white shadow-xs"
                                      : "hover:bg-slate-50 text-slate-900"
                                  }`}
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                      isSelected ? "bg-[#b82e2e] text-white" : "bg-slate-200 text-slate-800"
                                    }`}
                                  >
                                    {getInitials(s.student_name)}
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="font-bold text-xs truncate">{s.student_name}</p>
                                    <p className={`font-mono text-[11px] font-bold ${isSelected ? "text-red-300" : "text-[#b82e2e]"}`}>
                                      {s.invite_code}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Right: The Complete 8-Section Individual Student Profile */}
                      <div className="flex-1 w-full space-y-6">
                        {/* Profile Header Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#b82e2e] text-white font-black text-xl flex items-center justify-center shadow-sm ring-4 ring-red-50 shrink-0">
                              {getInitials(selectedProfileStudent.student_name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-slate-900">
                                  {selectedProfileStudent.student_name}
                                </h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  selectedProfileStudent.status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : selectedProfileStudent.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {selectedProfileStudent.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                Student ID: <span className="text-[#b82e2e] font-bold font-mono">{selectedProfileStudent.invite_code}</span> &bull; {selectedProfileStudent.faculty || "Faculty of Natural & Applied Sciences"}
                              </p>
                            </div>
                          </div>

                          {/* Quick Profile Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                setModuleAssignStudentId(selectedProfileStudent.id);
                                setModuleAssignSelected(selectedProfileStudent.enrolled_modules || ["MTH101", "PHY101"]);
                                navigateTo("students", "assign_modules");
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                            >
                              Assign Modules
                            </button>
                            <button
                              onClick={() => {
                                setDocStudentId(selectedProfileStudent.id);
                                navigateTo("documents", "enrolment_letter");
                              }}
                              className="px-3 py-1.5 bg-[#b82e2e] hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-xs"
                            >
                              Generate Proof of Enrolment
                            </button>
                          </div>
                        </div>

                        {/* Structured Sections 1 to 4: Personal, Contact, Guardian, Academic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 1. Personal Details */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                              <span className="text-sm">ðŸ‘¤</span>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                1. Personal Details
                              </h4>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Legal Full Name:</span>
                                <span className="font-bold text-slate-900">{selectedProfileStudent.student_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Preferred Name:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.preferred_name || selectedProfileStudent.student_name.split(" ")[0]}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Date of Birth:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.dob || "2006-05-14"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Gender:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.gender || "Female"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">National ID / Passport:</span>
                                <span className="font-mono font-bold text-slate-800">{selectedProfileStudent.id_number || "0605145123088"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Nationality:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.nationality || "South African"}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. Contact Details */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                              <span className="text-sm">ðŸ“ž</span>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                2. Contact Details
                              </h4>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Primary Email:</span>
                                <span className="font-bold text-slate-900">{selectedProfileStudent.student_email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Mobile Phone:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.phone || "+27 82 459 1029"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">WhatsApp Direct:</span>
                                <span className="font-semibold text-emerald-700">{selectedProfileStudent.whatsapp || "+27 82 459 1029"}</span>
                              </div>
                              <div className="flex justify-between items-start pt-1">
                                <span className="text-slate-500 shrink-0 mr-2">Residential Address:</span>
                                <span className="font-semibold text-slate-800 text-right">
                                  {selectedProfileStudent.address || "14 Rosebank Road, Rondebosch, Cape Town, 7700"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 3. Parent / Guardian Details */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                              <span className="text-sm">ðŸ‘¨â€ðŸ‘©â€ðŸ‘§</span>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                3. Parent / Guardian Details
                              </h4>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Primary Guardian:</span>
                                <span className="font-bold text-slate-900">{selectedProfileStudent.guardian_name || "Dr. Peter Kgosi"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Relationship:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.guardian_relationship || "Father"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Guardian Contact No:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.guardian_phone || "+27 83 902 4411"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Guardian Email:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.guardian_email || "peter.kgosi@gmail.com"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Emergency Phone:</span>
                                <span className="font-mono font-bold text-[#b82e2e]">{selectedProfileStudent.emergency_contact || "+27 83 902 4411"}</span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Student Number & Identity */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                              <span className="text-sm">ðŸŽ“</span>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                4. Student Number & Institutional Info
                              </h4>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Institutional Student No:</span>
                                <span className="font-mono font-black text-[#b82e2e] text-sm">{selectedProfileStudent.invite_code}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Campus ID:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.campus_id || "UP-HAT-2026"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Enrolment Date:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.enrolment_date || "15 Jan 2026"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Academic Year:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.academic_year || "2026"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Faculty:</span>
                                <span className="font-semibold text-slate-800">{selectedProfileStudent.faculty || "Faculty of Engineering"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 5. Enrolled Modules */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">ðŸ“š</span>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                5. Enrolled Modules & Curriculum
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                setModuleAssignStudentId(selectedProfileStudent.id);
                                setModuleAssignSelected(selectedProfileStudent.enrolled_modules || ["MTH101", "PHY101"]);
                                navigateTo("students", "assign_modules");
                              }}
                              className="text-xs font-bold text-[#b82e2e] hover:underline cursor-pointer"
                            >
                              + Manage Modules
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(selectedProfileStudent.enrolled_modules && selectedProfileStudent.enrolled_modules.length > 0
                              ? selectedProfileStudent.enrolled_modules
                              : ["MTH101", "PHY101", "CSC101"]
                            ).map((code) => {
                              const modInfo = AVAILABLE_MODULES.find((m) => m.code === code) || {
                                code,
                                name: "Registered Academic Module",
                                credits: "16 Credits",
                              };
                              return (
                                <div key={code} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-[#b82e2e] text-xs">{modInfo.code}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      Active
                                    </span>
                                  </div>
                                  <p className="font-bold text-slate-900 text-xs">{modInfo.name}</p>
                                  <p className="text-[10px] text-slate-400">{modInfo.credits}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 6. Enrolment Status & Status Switcher */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">ðŸ·ï¸</span>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                6. Enrolment Status & Standing
                              </h4>
                            </div>
                            <span className="text-xs text-slate-400">Click below to change standing</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleUpdateStudentStatus(selectedProfileStudent.id, "active")}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                selectedProfileStudent.status === "active"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              }`}
                            >
                              âœ“ Set Active Enrolment
                            </button>
                            <button
                              onClick={() => handleUpdateStudentStatus(selectedProfileStudent.id, "pending")}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                selectedProfileStudent.status === "pending"
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                              }`}
                            >
                              â³ Set Pending Review
                            </button>
                            <button
                              onClick={() => handleUpdateStudentStatus(selectedProfileStudent.id, "completed")}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                selectedProfileStudent.status === "completed"
                                  ? "bg-slate-700 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                              }`}
                            >
                              ðŸŽ“ Set Completed / Alumni
                            </button>
                            <button
                              onClick={() => handleUpdateStudentStatus(selectedProfileStudent.id, "inactive")}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                selectedProfileStudent.status === "inactive"
                                  ? "bg-red-700 text-white shadow-xs"
                                  : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              }`}
                            >
                              âœ• Set Inactive / Withdrawn
                            </button>
                          </div>
                        </div>

                        {/* 7. Documents */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">ðŸ“„</span>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                7. Official Documents
                              </h4>
                            </div>
                            <span className="text-xs text-slate-400">Interactive document generation & verification</span>
                          </div>

                          <div className="divide-y divide-slate-100 text-xs">
                            {[
                              { name: "Parent Indemnity Agreement (2026)", type: "indemnity_form", status: "Verified", date: "16 Jan 2026" },
                              { name: "Student Code of Conduct Pledge", type: "conduct_pledge", status: "Verified", date: "16 Jan 2026" },
                              { name: "Proof of Enrolment & Registration", type: "enrolment_letter", status: "Generated", date: "17 Jan 2026" },
                              { name: "Academic Progress Report", type: "progress_report", status: "Generated", date: "20 Jan 2026" },
                            ].map((doc, idx) => (
                              <div key={idx} className="py-2.5 flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-slate-900">{doc.name}</p>
                                  <p className="text-[11px] text-slate-400">Date recorded: {doc.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {doc.status}
                                  </span>
                                  <button
                                    onClick={() => handleOpenStudentDocument(selectedProfileStudent.id, doc.type)}
                                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#b82e2e] hover:text-[#b82e2e] rounded-lg font-bold text-xs cursor-pointer transition-colors"
                                  >
                                    View / Print &rarr;
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 8. Consent Status */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="text-sm">ðŸ›¡ï¸</span>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              8. Legal Consent Status & Compliance
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-900">Parental Indemnity Consent</p>
                                <p className="text-[11px] text-emerald-700">Legally signed by guardian</p>
                              </div>
                              <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-200 text-emerald-900">
                                {selectedProfileStudent.parent_consent || "Signed"}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-900">Student Code of Conduct</p>
                                <p className="text-[11px] text-emerald-700">Digital signature logged</p>
                              </div>
                              <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-200 text-emerald-900">
                                {selectedProfileStudent.conduct_consent || "Signed"}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-900">POPIA Act Data Privacy Consent</p>
                                <p className="text-[11px] text-emerald-700">Protection of Personal Info consented</p>
                              </div>
                              <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-200 text-emerald-900">
                                {selectedProfileStudent.popia_consent || "Signed"}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-900">Media & Photography Permission</p>
                                <p className="text-[11px] text-emerald-700">Authorized for institution circulars</p>
                              </div>
                              <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-200 text-emerald-900">
                                Granted
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
                        onClick={() => navigateTo("finance", "issue_invoice")}
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
                        value={isTeacher ? "Lead Educator â€¢ Administrator" : "Registered Scholar"}
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