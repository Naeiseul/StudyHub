import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, surname, gender, email, capacity, tempPassword } = body;

    if (!email || !firstName || !surname) {
      return NextResponse.json({ error: "First Name, Surname, and Email are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "StudyHub <info@logtraq.co.za>";

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Call Supabase RPC to enroll teacher with first_name, surname, gender
    const { data: enrollData, error: enrollError } = await supabase.rpc("enroll_paid_teacher", {
      p_email: email.trim().toLowerCase(),
      p_first_name: firstName.trim(),
      p_surname: surname.trim(),
      p_gender: gender ? gender.trim().toLowerCase() : "other",
      p_capacity: capacity ? Number(capacity) : 50,
      p_temp_password: tempPassword ? tempPassword.trim() : null,
    });

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    const assignedPw = enrollData?.temp_password || tempPassword || "Study#2026";

    // Academic salutation
    let salutation = `${firstName.trim()} ${surname.trim()}`;
    const g = (gender || "").toLowerCase().trim();
    if (g === "male" || g === "m" || g === "mr") {
      salutation = `Mr. ${surname.trim()}`;
    } else if (g === "female" || g === "f" || g === "ms" || g === "mrs") {
      salutation = `Ms. ${surname.trim()}`;
    }

    let emailSent = false;
    let emailErrorMsg = null;

    if (resendApiKey) {
      try {
        const subject = "Welcome to StudyHub | Your Educator Account Details";
        const bannerUrl = "https://studyhub.logtraq.co.za/assets/email-banner.jpg";

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 36px 12px; background-color: #08090c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6); border: 1px solid rgba(255,255,255,0.08);">
            <!-- Atmospheric Academic Banner -->
            <tr>
              <td style="padding: 0; background: #111319; text-align: center;">
                <img src="${bannerUrl}" alt="StudyHub Education" width="580" style="width: 100%; max-width: 580px; height: auto; display: block; object-fit: cover; border-bottom: 3px solid #b82e2e;" />
              </td>
            </tr>

            <!-- Light Elegant Container -->
            <tr>
              <td style="padding: 34px 34px 10px; background-color: #ffffff; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #b82e2e; font-weight: 700;">
                  YOUR EDUCATOR ACCESS IS ACTIVE
                </p>
                <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 800; letter-spacing: 1px; color: #0f172a;">
                  WELCOME
                </h1>
                <p style="margin: 0 0 24px; font-size: 14px; color: #64748b;">
                  We are thrilled to welcome you to the StudyHub Learning Network.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 34px 36px; background-color: #ffffff;">
                <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0 0 14px; font-weight: 600;">
                  Dear ${salutation},
                </p>
                <p style="font-size: 14px; color: #475569; line-height: 1.65; margin: 0 0 24px;">
                  Your EFT enrollment has been processed and confirmed. Below are your official account credentials to access your Educator Portal, view curriculum modules, and manage student enrollments.
                </p>

                <!-- Credentials Table -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 26px; overflow: hidden;">
                  <tr>
                    <td style="padding: 13px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 140px;">
                      Portal Address
                    </td>
                    <td style="padding: 13px 18px; font-size: 13px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                      studyhub.logtraq.co.za
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 13px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                      Login Email
                    </td>
                    <td style="padding: 13px 18px; font-size: 13px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                      ${email.trim().toLowerCase()}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 13px 18px; font-size: 13px; color: #64748b;">
                      Temporary Password
                    </td>
                    <td style="padding: 13px 18px; font-size: 13px;">
                      <code style="font-family: monospace; font-size: 15px; font-weight: 700; color: #b82e2e; background: #fee2e2; padding: 4px 10px; border-radius: 5px; letter-spacing: 1px; display: inline-block;">${assignedPw}</code>
                    </td>
                  </tr>
                </table>

                <!-- Call to Action Button -->
                <div style="text-align: center; margin: 30px 0 24px;">
                  <a href="https://studyhub.logtraq.co.za/home" style="display: inline-block; background-color: #b82e2e; color: #ffffff; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; padding: 14px 34px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(184, 46, 46, 0.28);">
                    LOG IN TO EDUCATOR PORTAL &rarr;
                  </a>
                </div>

                <!-- Clean Security Note (no question marks, no broken emojis) -->
                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
                  <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.55;">
                    <strong>First Login Security:</strong> For your security, you will be prompted to choose your own private, permanent password immediately upon logging in.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Subtle Footer -->
            <tr>
              <td style="background-color: #0b0c10; padding: 22px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
                StudyHub · A division of LogTraq · <a href="https://studyhub.logtraq.co.za" style="color: #b82e2e; text-decoration: none;">studyhub.logtraq.co.za</a>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [email.trim().toLowerCase()],
            reply_to: "info@logtraq.co.za",
            subject,
            html,
          }),
        });

        if (res.ok) {
          emailSent = true;
        } else {
          const errData = await res.json();
          emailErrorMsg = errData?.message || "Resend error";
        }
      } catch (e: unknown) {
        emailErrorMsg = e instanceof Error ? e.message : "Email dispatch failed";
      }
    }

    return NextResponse.json({
      success: true,
      data: enrollData,
      emailSent,
      emailError: emailErrorMsg,
      tempPassword: assignedPw,
      salutation,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
