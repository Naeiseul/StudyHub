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

    // Call Supabase RPC to enroll teacher
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
        const bgUrl = "https://studyhub.logtraq.co.za/assets/bookshelf-bg.jpg";

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 24px 8px; background-color: #07080c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background-color: #12141c; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
            <tr>
              <td background="${bgUrl}" style="background-image: url('${bgUrl}'); background-size: cover; background-position: center top; padding: 40px 18px;">
                
                <!-- White Tile Floating on Bookshelf Backdrop -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7); border: 1px solid rgba(255, 255, 255, 0.9); overflow: hidden;">
                  <tr>
                    <td style="padding: 30px 28px 14px; text-align: center; border-bottom: 2px solid #b82e2e;">
                      <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #b82e2e; font-weight: 800;">
                        STUDYHUB EDUCATION
                      </p>
                      <h1 style="margin: 0 0 6px; font-size: 26px; font-weight: 900; letter-spacing: 0.5px; color: #0f172a;">
                        WELCOME
                      </h1>
                      <p style="margin: 0; font-size: 14px; color: #334155; font-weight: 600;">
                        Your Educator Portal account is now active.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 26px 28px 30px; background-color: #ffffff;">
                      <p style="font-size: 16px; color: #0f172a; line-height: 1.5; margin: 0 0 14px; font-weight: 700;">
                        Dear ${salutation},
                      </p>
                      <p style="font-size: 14px; color: #1e293b; line-height: 1.65; margin: 0 0 22px; font-weight: 500;">
                        Your EFT payment has been received and confirmed. Below are your official account credentials to access your Educator Portal, view curriculum modules, and manage student enrollments:
                      </p>

                      <!-- Credentials Table (High Contrast Black Text) -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 12px 16px; font-size: 13px; color: #475569; font-weight: 700; border-bottom: 1px solid #e2e8f0; width: 140px;">
                            Portal Address
                          </td>
                          <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                            studyhub.logtraq.co.za
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; font-size: 13px; color: #475569; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                            Login Email
                          </td>
                          <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                            ${email.trim().toLowerCase()}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; font-size: 13px; color: #475569; font-weight: 700;">
                            Temporary Password
                          </td>
                          <td style="padding: 12px 16px;">
                            <code style="font-family: monospace; font-size: 15px; font-weight: 800; color: #ffffff; background: #b82e2e; padding: 4px 10px; border-radius: 4px; letter-spacing: 1px; display: inline-block;">${assignedPw}</code>
                          </td>
                        </tr>
                      </table>

                      <!-- Button -->
                      <div style="text-align: center; margin: 26px 0 20px;">
                        <a href="https://studyhub.logtraq.co.za/home" style="display: inline-block; background-color: #b82e2e; color: #ffffff; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; padding: 14px 34px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(184, 46, 46, 0.35);">
                          LOG IN TO EDUCATOR PORTAL &rarr;
                        </a>
                      </div>

                      <!-- Security Notice -->
                      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 22px;">
                        <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.55; font-weight: 500;">
                          <strong>First Login Security:</strong> For your security, you will be prompted to choose your own private, permanent password immediately upon logging in.
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; font-size: 12px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                  StudyHub · A division of LogTraq · <a href="https://studyhub.logtraq.co.za" style="color: #ff8080; text-decoration: none; font-weight: 600;">studyhub.logtraq.co.za</a>
                </div>

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
