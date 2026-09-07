/**
 * Official LogTraq High School Tutoring Statements & Institutional Documents.
 * Clean, modern layout matching official high school tuition statements.
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
    title: "Invoice: High School Student Account",
    category: "Financial Documents",
    description: "Official LogTraq high school tutoring chronological tuition invoice and running fee ledger.",
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
      const logoSrc = "/assets/logtraq-logo-clean.png";
      const logoMark = "/assets/logtraq-logo-mark.png";
      const studentAddr = student.address || "South Africa (High School FET Phase)";
      const isPaid = (student.paidAmount !== undefined && student.totalDebt !== undefined)
        ? student.paidAmount >= student.totalDebt
        : (student.studentId === "STU-382910" || student.studentId === "STU-592810" ? false : true);

      const billedAmount = student.totalDebt || 4900.00;
      const paidAmount = isPaid 
        ? billedAmount 
        : (student.studentId === "STU-382910" ? 3400.00 : 2900.00);
      const balanceDue = billedAmount - paidAmount;

      const invoiceTitle = isPaid
        ? "OFFICIAL TUITION STATEMENT & RECEIPT (PAID IN FULL)"
        : "OFFICIAL HIGH SCHOOL TUITION INVOICE (PAYMENT DUE)";

      const finalStatusBanner = isPaid
        ? `<div style="text-align: right; margin: 18px 0 16px; font-size: 14px; font-weight: 800; color: #047857; letter-spacing: 0.3px;">
             R 0.00 Outstanding &bull; Account Paid in Full with Thanks
           </div>`
        : `<div style="text-align: right; margin: 18px 0 16px; font-size: 14px; font-weight: 800; color: #b82e2e; letter-spacing: 0.3px;">
             R ${balanceDue.toFixed(2)} Due By Parent / Guardian
           </div>`;

      return `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 820px; margin: 0 auto; color: #000000; background: #ffffff; padding: 32px 40px; box-sizing: border-box; line-height: 1.35; border: 1px solid #e2e8f0; border-radius: 8px;">
          
          <!-- Top LogTraq Header Lockup -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; border-bottom: 2px solid #b82e2e; padding-bottom: 16px;">
            <div style="font-size: 12px; color: #000000; line-height: 1.55;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Student Information</p>
              <p style="margin: 2px 0 0;">Student Number: <strong style="font-family: monospace; color: #b82e2e; font-size: 13px;">${student.studentId}</strong></p>
              <p style="margin: 2px 0 0;">Learner Name: <strong style="color: #0f172a; font-size: 13px;">${student.name}</strong></p>
              <p style="margin: 2px 0 0; color: #475569;">Curriculum Phase: <strong>Grade 12 (DBE / IEB Senior FET Phase)</strong></p>
              <p style="margin: 2px 0 0; color: #64748b;">Residential Address: ${studentAddr}</p>
            </div>
            
            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
              <img src="${logoSrc}" alt="LogTraq Logo" style="height: 48px; width: auto; max-width: 170px; object-fit: contain; margin-bottom: 6px;" />
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.6px; color: #0f172a; line-height: 1.3; text-transform: uppercase;">
                LOGTRAQ ACADEMIC TUTORING<br />
                <span style="font-size: 10px; color: #b82e2e; font-weight: 700;">High School STEM Mastery &bull; StudyHub</span>
              </div>
              <p style="font-size: 10px; color: #64748b; margin: 3px 0 0;">Invoice Date: <strong>${accountAsAt}</strong></p>
            </div>
          </div>

          <!-- Document Title -->
          <div style="text-align: center; margin: 16px 0 14px;">
            <h1 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: 0.3px; text-transform: uppercase;">
              ${invoiceTitle}
            </h1>
            <p style="font-size: 11px; color: #64748b; margin: 3px 0 0;">Department of Mathematics, Physical Sciences &amp; High School Academic Excellence</p>
          </div>

          <!-- 7 High School Enrolled Subjects Roster -->
          <div style="margin-bottom: 18px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.4px;">
                Registered High School Subjects (7-Subject NSC Package):
              </p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 10.5px; color: #334155;">
                <div>&bull; <strong>Mathematics</strong> (Paper 1 &amp; Paper 2 - Calculus, Trigonometry, Euclidean)</div>
                <div>&bull; <strong>Physical Sciences</strong> (Physics: Mechanics, Electricity; Chemistry)</div>
                <div>&bull; <strong>Life Sciences</strong> (Genetics, DNA, Human Evolution)</div>
                <div>&bull; <strong>English Home Language</strong> (HL Literature, Comprehension &amp; Essays)</div>
                <div>&bull; <strong>First Additional Language</strong> (FAL IsiZulu / Afrikaans)</div>
                <div>&bull; <strong>Life Orientation</strong> (LO Career &amp; Tertiary Readiness)</div>
                <div>&bull; <strong>Accounting / Geography</strong> (Elective Academic Specialisation)</div>
                <div style="color: #047857; font-weight: 700;">&bull; Status: Active Academic Enrolment 2026</div>
              </div>
            </div>
          </div>

          <!-- Chronological High School Tuition Ledger -->
          <table style="width: 100%; font-size: 10.5px; border-collapse: collapse; color: #000000; margin-bottom: 12px;">
            <thead>
              <tr style="border-top: 1.5px solid #0f172a; border-bottom: 1.5px solid #0f172a; background: #f8fafc;">
                <th style="padding: 6px 8px; text-align: left; font-weight: 700; width: 14%; border-right: 1px solid #cbd5e1;">Date</th>
                <th style="padding: 6px 8px; text-align: left; font-weight: 700; width: 44%; border-right: 1px solid #cbd5e1;">Description</th>
                <th style="padding: 6px 8px; text-align: left; font-weight: 700; width: 22%; border-right: 1px solid #cbd5e1;">Reference</th>
                <th style="padding: 6px 8px; text-align: right; font-weight: 700; width: 10%; border-right: 1px solid #cbd5e1;">Amount</th>
                <th style="padding: 6px 8px; text-align: right; font-weight: 700; width: 10%;">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">2026/01/15</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">Term 1 High School Academic Tutoring (7 Subjects)</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px;">INV-T1-TUITION</td>
                <td style="padding: 5px 8px; text-align: right; border-right: 1px solid #cbd5e1;">3,500.00</td>
                <td style="padding: 5px 8px; text-align: right;">3,500.00</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">2026/01/15</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">Matric Exam Masterclass &amp; Past Exam Drill Packs</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px;">EXAM-PACK-2026</td>
                <td style="padding: 5px 8px; text-align: right; border-right: 1px solid #cbd5e1;">650.00</td>
                <td style="padding: 5px 8px; text-align: right;">4,150.00</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">2026/01/15</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">Weekly Interactive Tutorials &amp; StudyHub Quiz Mastery Access</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px;">SH-PORTAL-LIC</td>
                <td style="padding: 5px 8px; text-align: right; border-right: 1px solid #cbd5e1;">450.00</td>
                <td style="padding: 5px 8px; text-align: right;">4,600.00</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">2026/01/15</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">Continuous Diagnostic SBA Progress Tracking</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px;">SBA-DIAG-01</td>
                <td style="padding: 5px 8px; text-align: right; border-right: 1px solid #cbd5e1;">300.00</td>
                <td style="padding: 5px 8px; text-align: right;">4,900.00</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f0fdf4;">
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1;">2026/01/28</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1; font-weight: 700; color: #047857;">ABSA / FNB Electronic Funds Transfer (EFT) Payment Received</td>
                <td style="padding: 5px 8px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px;">EFT-PAY-98234</td>
                <td style="padding: 5px 8px; text-align: right; border-right: 1px solid #cbd5e1; font-weight: 700; color: #047857;">-${paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="padding: 5px 8px; text-align: right; font-weight: 800; color: ${balanceDue > 0 ? "#b82e2e" : "#047857"};">
                  ${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Final Balance Due Banner -->
          ${finalStatusBanner}

          <!-- Institutional Settlement & Banking Notice -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; font-size: 10px; color: #334155; line-height: 1.5;">
            <strong style="color: #0f172a; font-size: 11px;">Banking Details for Electronic Funds Transfer (EFT):</strong><br />
            Bank Name: <strong>First National Bank (FNB) / ABSA Bank</strong> &bull; Account Name: <strong>LogTraq Tutoring &amp; StudyHub Education (Pty) Ltd</strong><br />
            Account Number: <strong>62899014521</strong> &bull; Branch Code: <strong>250655</strong> &bull; Reference: <strong style="color: #b82e2e; font-family: monospace;">${student.studentId}</strong> (Compulsory)
          </div>

          <!-- Bottom Footer Lockup -->
          <div style="border-top: 1.5px solid #0f172a; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748b;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${logoMark}" alt="LogTraq Mark" style="height: 20px; width: 20px; object-fit: contain;" />
              <span><strong>LogTraq Tutoring Services</strong> &bull; StudyHub Online High School Learning Portal</span>
            </div>
            <div style="text-align: right;">
              <span>support@logtraq.co.za &bull; www.studyhub.logtraq.co.za &bull; Tel: +27 (0)11 800 4520</span>
            </div>
          </div>

        </div>
      `;
    }

    default:
      return "";
  }
}