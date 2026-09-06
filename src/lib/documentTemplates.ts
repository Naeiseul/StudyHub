/**
 * StudyHub Institutional Document Generation Templates
 * Automates generation of official institutional documents populated with student records.
 * Faithfully mirrors University of Pretoria (UP) Student Account Invoices and institutional letters.
 */

export interface StudentDocData {
  name: string;
  studentId: string;
  email: string;
  address?: string;
  programme?: string;
  parentName?: string;
  parentEmail?: string;
  enrolledModules?: string[];
  grade?: string;
  monthlyFee?: number;
  totalDebt?: number;
  paidAmount?: number;
}

export interface InstitutionDocData {
  institutionName: string;
  educatorName: string;
  contactEmail: string;
  website: string;
  logoUrl?: string;
}

export type DocumentType =
  | "parent_consent"
  | "student_consent"
  | "enrolment_confirmation"
  | "academic_progress"
  | "student_invoice";

export interface DocTemplateInfo {
  id: DocumentType;
  title: string;
  category: string;
  description: string;
}

export const DOCUMENT_TEMPLATES: DocTemplateInfo[] = [
  {
    id: "parent_consent",
    title: "Parent / Guardian Consent & Indemnity Form",
    category: "Consent Forms",
    description: "Required consent form covering online tutoring, study materials, and academic assessments.",
  },
  {
    id: "student_consent",
    title: "Student Academic Code of Conduct",
    category: "Consent Forms",
    description: "Formal agreement outlining attendance, academic honesty, and online classroom conduct.",
  },
  {
    id: "enrolment_confirmation",
    title: "Official Proof of Enrolment Letter",
    category: "Enrolment Documents",
    description: "Official confirmation of active registration for school, bursary, or administrative submission.",
  },
  {
    id: "academic_progress",
    title: "Academic Progress & Evaluation Letter",
    category: "Academic Letters",
    description: "Formal performance update detailing student attendance, tutorial participation, and assessment marks.",
  },
  {
    id: "student_invoice",
    title: "Invoice: Student Account (UP Official Style)",
    category: "Financial Documents",
    description: "Official University of Pretoria (UP) style chronological student account invoice and fee ledger.",
  },
];

/**
 * Standard Letterhead Header with Institutional Logo
 */
function renderLetterhead(
  institution: InstitutionDocData,
  departmentName: string,
  docRef: string,
  dateStr: string
): string {
  const logo = institution.logoUrl || "/assets/logo.png";
  return `
    <div style="border-bottom: 2px solid #b82e2e; padding-bottom: 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <img src="${logo}" alt="${institution.institutionName}" style="height: 52px; width: auto; max-width: 150px; object-fit: contain;" />
        <div style="border-left: 2px solid #e2e8f0; padding-left: 14px;">
          <h1 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">${institution.institutionName}</h1>
          <p style="font-size: 11px; color: #64748b; margin: 3px 0 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${departmentName}</p>
          <p style="font-size: 10px; color: #94a3b8; margin: 1px 0 0;">Official Institutional Document</p>
        </div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; flex-shrink: 0;">
        <p style="margin: 0;">Date of Issue: <strong style="color: #0f172a;">${dateStr}</strong></p>
        <p style="margin: 2px 0 0;">Document Ref: <strong style="color: #b82e2e; font-family: monospace;">${docRef}</strong></p>
        <p style="margin: 3px 0 0;"><span style="display: inline-block; background: #ecfdf5; color: #047857; font-weight: 700; font-size: 9px; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">OFFICIAL &amp; VERIFIED</span></p>
      </div>
    </div>
  `;
}

/**
 * Standard Institutional Footer
 */
function renderFooter(institution: InstitutionDocData): string {
  const squareLogo = institution.logoUrl || "/assets/logo-square.png";
  return `
    <div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="${squareLogo}" alt="Emblem" style="height: 18px; width: 18px; object-fit: contain; border-radius: 3px;" />
        <span>${institution.institutionName} &bull; Accredited Academic Portal</span>
      </div>
      <div>
        <span>${institution.website} &bull; ${institution.contactEmail}</span>
      </div>
    </div>
  `;
}

export function generateDocumentHtml(
  type: DocumentType,
  student: StudentDocData,
  institution: InstitutionDocData,
  extraNotes?: string
): string {
  const dateStr = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const accountAsAt = new Date().toISOString().slice(0, 10).replace(/-/g, "/");

  const modulesList =
    student.enrolledModules && student.enrolledModules.length > 0
      ? student.enrolledModules.join(", ")
      : "Mathematics Grade 12, Physical Sciences Grade 12";

  switch (type) {
    case "parent_consent":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 36px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          ${renderLetterhead(
            institution,
            "Department of Academic Administration &bull; Student Support",
            `DOC-CON-${student.studentId || "001"}`,
            dateStr
          )}

          <h2 style="font-size: 15px; font-weight: 800; color: #b82e2e; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px; text-align: center;">
            PARENT / GUARDIAN ACADEMIC CONSENT &amp; INDEMNITY AGREEMENT
          </h2>

          <p style="font-size: 12.5px; margin-bottom: 16px; color: #334155;">
            This document serves as formal written consent for the student indicated below to participate in academic tutoring, virtual lectures, tutorial workshops, and online learning through <strong>${institution.institutionName}</strong>.
          </p>

          <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 22px; background: #f8fafc; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; width: 35%; color: #475569;">Student Full Name:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #0f172a;">${student.name}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Student Number / ID:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 800; color: #b82e2e;">${student.studentId}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Registered Modules:</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${modulesList}</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; font-weight: 700; color: #475569;">Parent / Guardian Contact:</td>
              <td style="padding: 9px 14px; color: #0f172a;">${student.parentEmail || student.email}</td>
            </tr>
          </table>

          <h3 style="font-size: 13px; font-weight: 700; margin: 16px 0 8px; color: #0f172a;">Terms of Consent &amp; Indemnity</h3>
          <ul style="font-size: 12px; color: #334155; padding-left: 18px; margin: 0 0 20px; line-height: 1.6;">
            <li>I confirm that the student has permission to participate in all scheduled curriculum sessions, assessments, and revision workshops.</li>
            <li>I agree to adhere to the institution's tuition schedules and understand that accounts must remain in good standing for ongoing portal access.</li>
            <li>I acknowledge that learning resources and exam recordings provided by ${institution.institutionName} are copyright protected and for the enrolled student's personal study only.</li>
          </ul>

          ${
            extraNotes
              ? `<div style="padding: 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; font-size: 12px; color: #92400e; margin-bottom: 20px;"><strong>Special Notes:</strong> ${extraNotes}</div>`
              : ""
          }

          <div style="margin-top: 36px; padding-top: 18px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Parent / Guardian Signature:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 90%;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">Date: ________________________</p>
            </div>
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Educator / Institution Representative:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 90%;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">${institution.educatorName} &bull; ${institution.institutionName}</p>
            </div>
          </div>

          ${renderFooter(institution)}
        </div>
      `;

    case "student_consent":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 36px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          ${renderLetterhead(
            institution,
            "Office of Academic Integrity &bull; Student Conduct",
            `DOC-PLEDGE-${student.studentId || "001"}`,
            dateStr
          )}

          <h2 style="font-size: 15px; font-weight: 800; color: #b82e2e; text-transform: uppercase; margin: 0 0 16px; text-align: center;">
            STUDENT CODE OF CONDUCT &amp; ACADEMIC PLEDGE
          </h2>

          <p style="font-size: 12.5px; margin-bottom: 16px; color: #334155;">
            I, <strong>${student.name}</strong> (Student ID: <code style="color: #b82e2e; font-weight: bold; font-family: monospace;">${student.studentId}</code>), hereby pledge to uphold the highest standards of academic integrity, punctuality, and mutual respect while participating in StudyHub educational modules under <strong>${institution.educatorName}</strong>.
          </p>

          <div style="background: #f8fafc; border-left: 3px solid #b82e2e; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0 0 8px;"><strong>1. Punctual Attendance:</strong> I commit to attending all scheduled live lectures, tutorials, and practicals on time.</p>
            <p style="margin: 0 0 8px;"><strong>2. Authentic Scholarship:</strong> All tests, assignments, and mock examinations submitted will be my own authentic work without unauthorized assistance.</p>
            <p style="margin: 0;"><strong>3. Resource Confidentiality:</strong> I will not distribute, duplicate, or share proprietary lecture recordings or lesson packs outside the portal.</p>
          </div>

          <div style="margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Student Signature:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 90%;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">Date: ________________________</p>
            </div>
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Dean / Academic Supervisor:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 90%;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">${institution.educatorName} &bull; ${institution.institutionName}</p>
            </div>
          </div>

          ${renderFooter(institution)}
        </div>
      `;

    case "enrolment_confirmation":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 36px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          ${renderLetterhead(
            institution,
            "Office of the Registrar &bull; Student Admissions",
            `REG-${student.studentId || "2026"}`,
            dateStr
          )}

          <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0 0 20px; text-align: center; letter-spacing: 0.5px;">
            TO WHOM IT MAY CONCERN: OFFICIAL PROOF OF ACADEMIC ENROLMENT
          </h2>

          <p style="font-size: 12.5px; margin-bottom: 16px; color: #334155;">
            This letter confirms that the undermentioned candidate is an officially registered and actively enrolled scholar at <strong>${institution.institutionName}</strong> for the 2026 academic session:
          </p>

          <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; background: #ffffff;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; width: 35%; color: #475569;">Student Full Name:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #0f172a;">${student.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Student Identity Number:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #b82e2e;">${student.studentId}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Registered Modules / Courses:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${modulesList}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Enrolment Standing:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #047857; font-weight: 800;">
                <span style="display: inline-block; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">ACTIVE &bull; IN GOOD STANDING</span>
              </td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 14px; font-weight: 700; color: #475569;">Supervising Educator:</td>
              <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">${institution.educatorName}</td>
            </tr>
          </table>

          <p style="font-size: 12.5px; line-height: 1.6; margin-bottom: 24px; color: #334155;">
            The student participates in weekly academic lectures, problem-solving workshops, and assessment preparations. Please do not hesitate to contact our admissions bureau directly at <a href="mailto:${institution.contactEmail}" style="color: #b82e2e; text-decoration: underline;">${institution.contactEmail}</a> should additional verification be required.
          </p>

          <div style="margin-top: 36px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0;">${institution.educatorName}</p>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0;">Registrar &bull; ${institution.institutionName}</p>
              <p style="font-size: 11px; color: #64748b; margin: 1px 0 0;">${institution.website}</p>
            </div>
            <div style="text-align: right; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 10px 16px; font-size: 10px; color: #64748b;">
              <p style="margin: 0; font-weight: 700; text-transform: uppercase;">Official Seal / Stamp</p>
              <p style="margin: 2px 0 0; color: #94a3b8;">StudyHub Academic Records</p>
            </div>
          </div>

          ${renderFooter(institution)}
        </div>
      `;

    case "academic_progress":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 36px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          ${renderLetterhead(
            institution,
            "Academic Assessment &bull; Student Performance Bureau",
            `DOC-REP-${student.studentId || "001"}`,
            dateStr
          )}

          <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 16px; text-transform: uppercase; text-align: center;">
            STUDENT ACADEMIC PERFORMANCE EVALUATION
          </h2>

          <p style="font-size: 12.5px; margin-bottom: 14px; color: #334155;">
            Dear Parent / Guardian of <strong>${student.name}</strong> (Student ID: <code style="color: #b82e2e; font-weight: bold; font-family: monospace;">${student.studentId}</code>),
          </p>

          <p style="font-size: 12.5px; margin-bottom: 18px; color: #334155;">
            We are pleased to provide the official progress review regarding ${student.name}'s participation, tutorial performance, and topic mastery in the enrolled curriculum:
          </p>

          <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 22px; border: 1px solid #e2e8f0;">
            <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <tr>
                <th style="padding: 10px 14px; text-align: left; font-weight: 700; color: #475569;">Subject / Module</th>
                <th style="padding: 10px 14px; text-align: center; font-weight: 700; color: #475569;">Attendance</th>
                <th style="padding: 10px 14px; text-align: center; font-weight: 700; color: #475569;">Assessment Avg</th>
                <th style="padding: 10px 14px; text-align: right; font-weight: 700; color: #475569;">Academic Standing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">Mathematics Grade 12 (Calculus &amp; Trigonometry)</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;">95%</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 800; color: #b82e2e;">78%</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #047857;">Proficient</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">Physical Sciences (Mechanics &amp; Chemistry)</td>
                <td style="padding: 10px 14px; text-align: center;">90%</td>
                <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #b82e2e;">72%</td>
                <td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #047857;">Proficient</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin-bottom: 22px; font-size: 12px; color: #334155;">
            <strong style="color: #0f172a;">Tutor Commentary:</strong> ${
              extraNotes ||
              "The student demonstrates consistent analytical engagement and high problem-solving capability. Continued focus on exam past-paper drills is recommended."
            }
          </div>

          <div style="margin-top: 36px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0;">${institution.educatorName}</p>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0;">Lead Academic Tutor &bull; ${institution.contactEmail}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 11px; color: #64748b; margin: 0 0 25px;">Registrar Signature:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 160px; margin-left: auto;"></div>
            </div>
          </div>

          ${renderFooter(institution)}
        </div>
      `;

    case "student_invoice": {
      const logoSrc = institution.logoUrl || "/assets/logo.png";
      const studentProgramme = student.programme || "12134002  BSc in Computer Science";
      const studentAddr = student.address || "12 Hatfield Boulevard, Pretoria, Gauteng, 0028";

      // Ledger items modeled directly from official University of Pretoria Student Account Invoice
      const ledgerItems = [
        { date: "2026/01/01", desc: "Balance Brought Forward", ref: "", amount: null, bal: -11000.00 },
        { date: "2026/01/08", desc: "First Payment 2026", ref: "", amount: 11000.00, bal: 0.00 },
        { date: "2026/01/09", desc: "ABSA Tuition Payment", ref: "BANK STMT SEQ 2338467", amount: -29000.00, bal: -29000.00 },
        { date: "2026/01/27", desc: "WTW114 Tuition Fees", ref: "", amount: 7790.00, bal: -21210.00 },
        { date: "2026/01/27", desc: "WTW114 Copyright & Library", ref: "", amount: 116.00, bal: -21094.00 },
        { date: "2026/01/27", desc: "WTW114 E-Learning Package", ref: "", amount: 452.00, bal: -20642.00 },
        { date: "2026/01/27", desc: "WTW115 Tuition Fees", ref: "", amount: 4000.00, bal: -16642.00 },
        { date: "2026/01/27", desc: "WTW148 Tuition Fees", ref: "", amount: 4050.00, bal: -12592.00 },
        { date: "2026/01/27", desc: "WTW148 Copyright & Library", ref: "", amount: 116.00, bal: -12476.00 },
        { date: "2026/01/27", desc: "COS110 Tuition Fees", ref: "", amount: 6680.00, bal: -5796.00 },
        { date: "2026/01/27", desc: "COS110 Copyright & Library", ref: "", amount: 116.00, bal: -5680.00 },
        { date: "2026/01/27", desc: "COS110 Facility Usage", ref: "", amount: 1270.00, bal: -4410.00 },
        { date: "2026/01/27", desc: "COS110 Study Material", ref: "", amount: 50.00, bal: -4360.00 },
        { date: "2026/01/27", desc: "COS132 Tuition Fees", ref: "", amount: 6680.00, bal: 2320.00 },
        { date: "2026/01/27", desc: "COS132 Copyright & Library", ref: "", amount: 116.00, bal: 2436.00 },
        { date: "2026/01/27", desc: "COS132 Facility Usage", ref: "", amount: 1270.00, bal: 3706.00 },
        { date: "2026/01/27", desc: "COS132 Study Material", ref: "", amount: 50.00, bal: 3756.00 },
        { date: "2026/01/27", desc: "COS151 Tuition Fees", ref: "", amount: 3660.00, bal: 7416.00 },
        { date: "2026/01/27", desc: "COS151 Copyright & Library", ref: "", amount: 116.00, bal: 7532.00 },
        { date: "2026/01/27", desc: "COS151 Facility Usage", ref: "", amount: 640.00, bal: 8172.00 },
        { date: "2026/01/27", desc: "COS151 Study Material", ref: "", amount: 50.00, bal: 8222.00 },
        { date: "2026/01/27", desc: "AIM111 Tuition Fees", ref: "", amount: 5620.00, bal: 13842.00 },
        { date: "2026/01/27", desc: "Education Technology Software", ref: "", amount: 390.00, bal: 14232.00 },
        { date: "2026/01/27", desc: "Security Levy", ref: "", amount: 105.00, bal: 14337.00 },
        { date: "2026/04/23", desc: "ABSA Tuition Payment", ref: "BANK STMT SEQ 2378897", amount: -5700.00, bal: 8637.00 },
        { date: "2026/04/23", desc: "ABSA Tuition Payment", ref: "BANK STMT SEQ 2378988", amount: -7000.00, bal: 1637.00 },
        { date: "2026/07/22", desc: "WTW148 Tuition Fees", ref: "", amount: 4050.00, bal: 5687.00 },
        { date: "2026/07/24", desc: "ABSA Tuition Payment", ref: "BANK STMT SEQ 2407178", amount: -30000.00, bal: -24313.00 },
        { date: "2026/07/29", desc: "ABSA Tuition Payment", ref: "BANK STMT SEQ 2409407", amount: -25200.00, bal: -49513.00 },
        { date: "2026/08/01", desc: "Monthly Academic Assessment & Lab Fees", ref: "", amount: 50503.00, bal: 990.00 },
      ];

      const finalBalance = ledgerItems[ledgerItems.length - 1].bal;
      const finalDueStr = finalBalance >= 0 
        ? `R ${finalBalance.toFixed(2)} Due By You`
        : `R ${Math.abs(finalBalance).toFixed(2)} Credit In Your Favor`;

      return `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 820px; margin: 0 auto; color: #000000; background: #ffffff; padding: 30px 40px; box-sizing: border-box; line-height: 1.35;">
          
          <!-- Top UP Header Lockup -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #000000; line-height: 1.5; padding-top: 10px;">
              <p style="margin: 0;">Student Number: <strong>${student.studentId}</strong></p>
              <p style="margin: 2px 0 0;">Name: <strong>${student.name}</strong></p>
              <p style="margin: 2px 0 0; color: #334155;">Address: ${studentAddr}</p>
            </div>
            
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
              <img src="${logoSrc}" alt="StudyHub Logo" style="height: 58px; width: auto; max-width: 140px; object-fit: contain; margin-bottom: 6px;" />
              <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.8px; color: #000000; line-height: 1.25; text-transform: uppercase;">
                UNIVERSITEIT VAN PRETORIA<br />
                UNIVERSITY OF PRETORIA<br />
                YUNIBESITHI YA PRETORIA
              </div>
            </div>
          </div>

          <!-- Title: Invoice: Student Account -->
          <div style="text-align: center; margin: 20px 0 16px;">
            <h1 style="font-size: 17px; font-weight: 800; color: #000000; margin: 0; letter-spacing: 0.3px;">
              Invoice: Student Account
            </h1>
          </div>

          <!-- Programme & Date Details -->
          <div style="font-size: 11px; margin-bottom: 12px;">
            <div style="display: flex; padding: 3px 0;">
              <span style="width: 130px; font-weight: 600;">Programme:</span>
              <span style="font-weight: 700;">${studentProgramme}</span>
            </div>
            <div style="border-top: 1px solid #000000; margin: 5px 0;"></div>
            <div style="display: flex; padding: 3px 0;">
              <span style="width: 130px; font-weight: 600;">Account as at:</span>
              <span>${accountAsAt}</span>
            </div>
            <div style="border-top: 1px solid #000000; margin: 5px 0 10px;"></div>
          </div>

          <!-- Main Ledger Table matching UP format -->
          <table style="width: 100%; font-size: 10px; border-collapse: collapse; color: #000000;">
            <thead>
              <tr style="border-top: 1px solid #000000; border-bottom: 1px solid #000000; background: #ffffff;">
                <th style="padding: 3.5px 5px; text-align: left; font-weight: 700; width: 14%; border-right: 1px solid #cbd5e1;">Date</th>
                <th style="padding: 3.5px 5px; text-align: left; font-weight: 700; width: 44%; border-right: 1px solid #cbd5e1;">Description</th>
                <th style="padding: 3.5px 5px; text-align: left; font-weight: 700; width: 22%; border-right: 1px solid #cbd5e1;">Reference</th>
                <th style="padding: 3.5px 5px; text-align: right; font-weight: 700; width: 10%; border-right: 1px solid #cbd5e1;">Amount</th>
                <th style="padding: 3.5px 5px; text-align: right; font-weight: 700; width: 10%;">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerItems
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 2.5px 5px; border-right: 1px solid #cbd5e1; white-space: nowrap;">${item.date}</td>
                  <td style="padding: 2.5px 5px; border-right: 1px solid #cbd5e1;">${item.desc}</td>
                  <td style="padding: 2.5px 5px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px;">${item.ref || ""}</td>
                  <td style="padding: 2.5px 5px; text-align: right; border-right: 1px solid #cbd5e1; font-variant-numeric: tabular-nums;">
                    ${item.amount !== null ? item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                  </td>
                  <td style="padding: 2.5px 5px; text-align: right; font-variant-numeric: tabular-nums;">
                    ${item.bal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <!-- Bottom Highlight: R 990.00 Due By You -->
          <div style="text-align: right; margin: 18px 0 16px; font-size: 13px; font-weight: 800; color: #000000; letter-spacing: 0.3px;">
            ${finalDueStr}
          </div>

          <!-- System Note -->
          <p style="font-size: 9.5px; color: #000000; margin: 10px 0 6px; font-style: normal;">
            Please note: the account provided is based on the current information available on our system, and is subject to change
          </p>

          <!-- Banking Details Block -->
          <div style="font-size: 9.5px; color: #000000; line-height: 1.45; margin-bottom: 18px;">
            <strong>Bank Account Details:</strong> ABSA Bank / First National Bank, Account Name: StudyHub Education (Pty) Ltd,<br />
            Branch code: 632005, Account No: 2140000054 Swift Code: ABSAZAJJ (use Student number as reference)
          </div>

          <!-- Institutional Bottom 3-Column Footer -->
          <div style="border-top: 1px solid #000000; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8.5px; color: #000000; line-height: 1.35;">
            <div>
              StudyHub Education &bull; University Partner Portal<br />
              Private Bag X20<br />
              Hatfield<br />
              0028
            </div>
            <div style="text-align: center;">
              Tel: &nbsp; +27 (0)12 420 3111<br />
              Email: &nbsp; ssc@studyhub.logtraq.co.za
            </div>
            <div style="text-align: right;">
              www.studyhub.logtraq.co.za
            </div>
          </div>

        </div>
      `;
    }

    default:
      return "";
  }
}