import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, capacity, tempPassword } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: "Email and Full Name are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "StudyHub <info@logtraq.co.za>";

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Call Supabase RPC to create/update the teacher account
    const { data: enrollData, error: enrollError } = await supabase.rpc("enroll_paid_teacher", {
      p_email: email.trim().toLowerCase(),
      p_full_name: fullName.trim(),
      p_temp_password: tempPassword ? tempPassword.trim() : null,
      p_capacity: capacity ? Number(capacity) : 50,
    });

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    const assignedPw = enrollData?.temp_password || tempPassword || "Study#2026";

    // Dispatch email via Resend if API key is configured
    let emailSent = false;
    let emailErrorMsg = null;

    if (resendApiKey) {
      try {
        const subject = "Welcome to StudyHub! Your Educator Account Details";
        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>${subject}</title></head>
        <body style="margin: 0; padding: 30px 15px; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background: #12121a; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <tr>
              <td style="background: linear-gradient(135deg, #b82e2e 0%, #821c1c 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">StudyHub Education</h1>
                <p style="margin: 6px 0 0; font-size: 14px; color: #fed7d7;">LogTraq Learning & Educator Portal</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 28px;">
                <h2 style="font-size: 19px; margin: 0 0 16px; color: #ffffff;">Dear ${fullName.trim()},</h2>
                <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px;">
                  Your EFT payment has been received and your <strong>StudyHub Educator Account</strong> is now active. You have full access to manage your students and view curriculum modules.
                </p>
                <div style="background: #1a1a24; border: 1px solid rgba(184,46,46,0.3); border-radius: 10px; padding: 20px; margin-bottom: 26px;">
                  <p style="margin: 0 0 12px; font-size: 14px; color: #94a3b8;">
                    <strong>Login Email:</strong> <span style="color: #ffffff; margin-left: 8px;">${email.trim().toLowerCase()}</span>
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                    <strong>Temporary Password:</strong>
                    <code style="display: inline-block; margin-left: 8px; background: #b82e2e; color: #ffffff; padding: 4px 10px; border-radius: 5px; font-size: 15px; font-weight: bold; letter-spacing: 1px;">${assignedPw}</code>
                  </p>
                </div>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="https://studyhub.logtraq.co.za/home" style="display: inline-block; background: #b82e2e; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(184,46,46,0.4);">
                    Log In to Educator Portal &rarr;
                  </a>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-left: 3px solid #b82e2e; padding: 12px 16px; margin: 24px 0 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                    🔒 <strong>First Login Security:</strong> You will be prompted to choose your own private, permanent password immediately upon logging in.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background: #0d0d14; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05);">
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
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
