/**
 * StudyHub Institutional Document Generation Templates
 * Automates generation of official institutional documents populated with student records.
 */

export interface StudentDocData {
  name: string;
  studentId: string;
  email: string;
  parentName?: string;
  parentEmail?: string;
  enrolledModules?: string[];
  grade?: string;
}

export interface InstitutionDocData {
  institutionName: string;
  educatorName: string;
  contactEmail: string;
  website: string;
}

export type DocumentType =
  | "parent_consent"
  | "student_consent"
  | "enrolment_confirmation"
  | "academic_progress";

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
];

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

  const modulesList = student.enrolledModules && student.enrolledModules.length > 0
    ? student.enrolledModules.join(", ")
    : "Mathematics Grade 12, Physical Sciences Grade 12";

  switch (type) {
    case "parent_consent":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          <div style="border-bottom: 2px solid #b82e2e; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${institution.institutionName}</h1>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Department of Academic Administration · Student Support</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <p style="margin: 0;">Date: <strong>${dateStr}</strong></p>
              <p style="margin: 2px 0 0;">Doc Ref: <strong>DOC-CON-${student.studentId || "001"}</strong></p>
            </div>
          </div>

          <h2 style="font-size: 16px; font-weight: 800; color: #b82e2e; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px; text-align: center;">
            PARENT / GUARDIAN ACADEMIC CONSENT & INDEMNITY AGREEMENT
          </h2>

          <p style="font-size: 13px; margin-bottom: 16px;">
            This document serves as formal written consent for the student indicated below to participate in academic tutoring, virtual lectures, tutorial workshops, and online learning through <strong>${institution.institutionName}</strong>.
          </p>

          <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 24px; background: #f8fafc; border-radius: 6px; overflow: hidden;">
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 700; width: 35%; color: #475569;">Student Full Name:</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 800; color: #0f172a;">${student.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Student Number / ID:</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-mono; font-weight: 800; color: #b82e2e;">${student.studentId}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Registered Modules:</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600;">${modulesList}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Parent / Guardian Contact:</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${student.parentEmail || student.email}</td>
            </tr>
          </table>

          <h3 style="font-size: 13px; font-weight: 700; margin: 18px 0 8px; color: #0f172a;">Terms of Consent</h3>
          <ul style="font-size: 12px; color: #334155; padding-left: 18px; margin: 0 0 20px; line-height: 1.6;">
            <li>I confirm that the student has permission to participate in all scheduled curriculum sessions, assessments, and revision workshops.</li>
            <li>I agree to adhere to the institution's tuition schedules and understand that accounts must remain in good standing for ongoing access.</li>
            <li>I acknowledge that learning resources and exam recordings provided by ${institution.institutionName} are copyright protected and for the enrolled student's personal study only.</li>
          </ul>

          ${extraNotes ? `<div style="padding: 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; font-size: 12px; color: #92400e; margin-bottom: 20px;"><strong>Special Notes:</strong> ${extraNotes}</div>` : ""}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Parent / Guardian Signature:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 90%;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">Date: ________________________</p>
            </div>
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Educator / Institution Representative:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 90%;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">${institution.educatorName} · ${institution.institutionName}</p>
            </div>
          </div>
        </div>
      `;

    case "student_consent":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          <div style="border-bottom: 2px solid #b82e2e; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase;">${institution.institutionName}</h1>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Student Code of Academic Integrity & Portal Engagement</p>
          </div>

          <h2 style="font-size: 15px; font-weight: 800; color: #b82e2e; text-transform: uppercase; margin: 0 0 16px; text-align: center;">
            STUDENT CODE OF CONDUCT & ACADEMIC PLEDGE
          </h2>

          <p style="font-size: 13px; margin-bottom: 16px;">
            I, <strong>${student.name}</strong> (Student ID: <code style="color: #b82e2e; font-weight: bold;">${student.studentId}</code>), hereby agree to uphold the highest standards of academic honesty, punctuality, and mutual respect while participating in StudyHub educational modules under <strong>${institution.educatorName}</strong>.
          </p>

          <div style="background: #f8fafc; border-left: 3px solid #b82e2e; padding: 14px 18px; margin-bottom: 24px; font-size: 12px;">
            <p style="margin: 0 0 8px;"><strong>1. Punctual Attendance:</strong> I commit to attending all scheduled live sessions and tutorials on time.</p>
            <p style="margin: 0 0 8px;"><strong>2. Assessment Integrity:</strong> All tests, quizzes, and homework submitted will be my own authentic work.</p>
            <p style="margin: 0;"><strong>3. Resource Security:</strong> I will not distribute, record, or share class recordings or proprietary materials without permission.</p>
          </div>

          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Student Signature:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 220px;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">Date: ________________________</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 11px; color: #64748b; margin: 0 0 35px;">Official Endorsement:</p>
              <div style="border-bottom: 1.5px solid #0f172a; width: 220px; margin-left: auto;"></div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">${institution.institutionName}</p>
            </div>
          </div>
        </div>
      `;

    case "enrolment_confirmation":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          <div style="border-bottom: 2px solid #b82e2e; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase;">${institution.institutionName}</h1>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Academic Registrar & Student Admissions</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <p style="margin: 0;">Date: <strong>${dateStr}</strong></p>
              <p style="margin: 2px 0 0;">Ref: <strong>REG-${student.studentId || "2026"}</strong></p>
            </div>
          </div>

          <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0 0 20px;">
            TO WHOM IT MAY CONCERN: PROOF OF ACADEMIC ENROLMENT
          </h2>

          <p style="font-size: 13px; margin-bottom: 16px;">
            This letter certifies that the following candidate is an officially registered and actively enrolled student at <strong>${institution.institutionName}</strong> for the current academic session:
          </p>

          <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; width: 35%;">Student Name:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 800;">${student.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">Student ID Number:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-mono; font-weight: bold; color: #b82e2e;">${student.studentId}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">Registered Courses / Modules:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${modulesList}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">Registration Status:</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #047857; font-weight: 800;">Active & In Good Standing</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 14px; font-weight: 700;">Assigned Educator / Tutor:</td>
              <td style="padding: 10px 14px; font-weight: 600;">${institution.educatorName}</td>
            </tr>
          </table>

          <p style="font-size: 13px; line-height: 1.6; margin-bottom: 30px;">
            The student participates in weekly academic lectures, problem-solving workshops, and assessment preparations. Please do not hesitate to contact our office directly at <a href="mailto:${institution.contactEmail}" style="color: #b82e2e;">${institution.contactEmail}</a> should additional verification be required.
          </p>

          <div style="margin-top: 50px;">
            <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0;">${institution.educatorName}</p>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0;">Lead Academic Tutor · ${institution.institutionName}</p>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0;">${institution.website}</p>
          </div>
        </div>
      `;

    case "academic_progress":
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          <div style="border-bottom: 2px solid #b82e2e; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase;">${institution.institutionName}</h1>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Academic Assessment & Performance Report</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <p style="margin: 0;">Report Date: <strong>${dateStr}</strong></p>
            </div>
          </div>

          <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">
            STUDENT ACADEMIC PERFORMANCE SUMMARY
          </h2>

          <p style="font-size: 13px; margin-bottom: 16px;">
            Dear Parent / Guardian of <strong>${student.name}</strong> (Student No: <code style="color: #b82e2e; font-weight: bold;">${student.studentId}</code>),
          </p>

          <p style="font-size: 13px; margin-bottom: 20px;">
            We are pleased to provide the official progress review regarding ${student.name}'s participation, tutorial performance, and topic readiness in the enrolled curriculum:
          </p>

          <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <tr>
                <th style="padding: 10px 14px; text-align: left; font-weight: 700;">Subject / Module</th>
                <th style="padding: 10px 14px; text-align: center; font-weight: 700;">Attendance Rate</th>
                <th style="padding: 10px 14px; text-align: center; font-weight: 700;">Assessment Avg</th>
                <th style="padding: 10px 14px; text-align: right; font-weight: 700;">Standing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Mathematics Grade 12 (Calculus & Trigonometry)</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;">95%</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 800; color: #b82e2e;">78%</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #047857;">Proficient</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: 600;">Physical Sciences (Mechanics & Newton's Laws)</td>
                <td style="padding: 10px 14px; text-align: center;">90%</td>
                <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #b82e2e;">72%</td>
                <td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #047857;">Proficient</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #334155;">
            <strong>Tutor Commentary:</strong> ${extraNotes || "The student demonstrates consistent engagement in class discussions and strong grasp of core concepts. Continued revision of past exam questions is encouraged ahead of the upcoming term assessments."}
          </div>

          <div style="margin-top: 40px;">
            <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0;">${institution.educatorName}</p>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0;">StudyHub Lead Educator · ${institution.contactEmail}</p>
          </div>
        </div>
      `;

    default:
      return "";
  }
}
