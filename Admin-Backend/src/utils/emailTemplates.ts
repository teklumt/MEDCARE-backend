/**
 * MED-CARE Ethiopia — transactional email templates.
 * All templates use inline CSS for maximum email client compatibility.
 */

// ---------------------------------------------------------------------------
// Base layout
// ---------------------------------------------------------------------------
function layout(opts: {
  preheader: string;
  headerAccent?: string;
  body: string;
  footerNote?: string;
}): string {
  const accent = opts.headerAccent ?? "#16a34a";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table{border-spacing:0;}
    td{padding:0;}
    img{border:0;}
    @media only screen and (max-width:600px){
      .wrapper{width:100%!important;border-radius:0!important;}
      .content-pad{padding:28px 24px!important;}
      .header-pad{padding:28px 24px!important;}
      .footer-pad{padding:20px 24px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f0f2f0;">
    ${opts.preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f0;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" class="wrapper" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td class="header-pad" style="background:${accent};padding:36px 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <!-- Logo mark -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:middle;">
                      <tr>
                        <td style="background:#ffffff;width:48px;height:48px;border-radius:12px;text-align:center;vertical-align:middle;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
                          <span style="display:block;font-size:26px;font-weight:900;color:${accent};line-height:48px;font-family:Georgia,serif;">M</span>
                        </td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <span style="display:block;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;">Med Care</span>
                          <span style="display:block;font-size:11px;color:rgba(255,255,255,0.75);letter-spacing:0.8px;text-transform:uppercase;margin-top:2px;">Ethiopia</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="content-pad" style="padding:44px 48px 36px;">
              ${opts.body}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <div style="height:1px;background:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" style="padding:28px 48px 32px;background:#fafafa;">
              ${opts.footerNote ? `<p style="margin:0 0 12px;font-size:12px;color:#6b7280;text-align:center;">${opts.footerNote}</p>` : ""}
              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.7;">
                &copy; 2025 MED-CARE Ethiopia &bull; AI-powered healthcare navigation &amp; pharmacy delivery<br/>
                Addis Ababa, Ethiopia &bull; <a href="mailto:support@teklumoges.dev" style="color:#9ca3af;text-decoration:underline;">support@teklumoges.dev</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------
function heading(text: string, color = "#111827"): string {
  return `<h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:${color};letter-spacing:-0.5px;line-height:1.25;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">${text}</p>`;
}

function badge(text: string, bg: string, color: string): string {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:99px;background:${bg};color:${color};font-size:12px;font-weight:600;letter-spacing:0.3px;text-transform:uppercase;">${text}</span>`;
}

function calloutBox(opts: { icon: string; title: string; text: string; bg: string; border: string; titleColor: string; textColor: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%"
    style="background:${opts.bg};border:1.5px solid ${opts.border};border-radius:12px;margin:24px 0;">
    <tr>
      <td style="padding:20px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:24px;vertical-align:top;padding-right:14px;line-height:1;">${opts.icon}</td>
            <td>
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${opts.titleColor};text-transform:uppercase;letter-spacing:0.6px;">${opts.title}</p>
              <p style="margin:0;font-size:14px;color:${opts.textColor};line-height:1.6;">${opts.text}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<div style="height:1px;background:#f3f4f6;margin:8px 0 24px;"></div>`;
}

// ---------------------------------------------------------------------------
// OTP code block
// ---------------------------------------------------------------------------
function otpCodeBlock(code: string, expiryMinutes = 15): string {
  const digits = code.split("");
  const digitBoxes = digits
    .map(
      (d) =>
        `<td style="padding:0 4px;">
          <div style="width:42px;height:56px;background:#f8fffe;border:2px solid #bbf7d0;border-radius:10px;text-align:center;line-height:56px;font-size:28px;font-weight:900;color:#15803d;font-family:'Courier New',Courier,monospace;">${d}</div>
        </td>`,
    )
    .join("");

  return `<div style="text-align:center;margin:32px 0;">
    <p style="margin:0 0 20px;font-size:13px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:1.2px;">Your verification code</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;margin:0 auto;">
      <tr>${digitBoxes}</tr>
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">
      &#9200; Expires in <strong style="color:#374151;">${expiryMinutes} minutes</strong>
    </p>
  </div>`;
}

// ---------------------------------------------------------------------------
// 1. Patient signup OTP
// ---------------------------------------------------------------------------
export function patientSignupOtp(code: string): { subject: string; html: string } {
  return {
    subject: "Verify your email — MED-CARE Ethiopia",
    html: layout({
      preheader: `Your verification code is ${code}. Use it to complete your MED-CARE registration.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">
          <tr>
            <td>${badge("New Account", "#dcfce7", "#15803d")}</td>
          </tr>
        </table>
        ${heading("Verify your email address")}
        ${paragraph("Welcome to MED-CARE Ethiopia! To complete your account registration, enter the verification code below.")}
        ${otpCodeBlock(code)}
        ${divider()}
        ${paragraph("If you did not create an account on MED-CARE, you can safely ignore this email.")}
      `,
      footerNote: "This code expires in 15 minutes and can only be used once.",
    }),
  };
}

// ---------------------------------------------------------------------------
// 2. Pharmacy signup OTP
// ---------------------------------------------------------------------------
export function pharmacySignupOtp(code: string): { subject: string; html: string } {
  return {
    subject: "Verify your pharmacy registration — MED-CARE Ethiopia",
    html: layout({
      preheader: `Your pharmacy registration verification code is ${code}.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">
          <tr>
            <td>${badge("Pharmacy Registration", "#dcfce7", "#15803d")}</td>
          </tr>
        </table>
        ${heading("Verify your pharmacy account")}
        ${paragraph("You are registering a pharmacy on MED-CARE Ethiopia. Enter the verification code below to continue. After email verification, our team will review your pharmacy license.")}
        ${otpCodeBlock(code)}
        ${calloutBox({
          icon: "&#128203;",
          title: "What happens next?",
          text: "Once your email is verified, submit your pharmacy license documents. Our admin team will review and approve your pharmacy within 1–3 business days.",
          bg: "#f0fdf4",
          border: "#bbf7d0",
          titleColor: "#15803d",
          textColor: "#374151",
        })}
        ${divider()}
        ${paragraph("If you did not initiate this registration, please ignore this email.")}
      `,
      footerNote: "This code expires in 15 minutes and can only be used once.",
    }),
  };
}

// ---------------------------------------------------------------------------
// 3. Delivery personnel signup OTP
// ---------------------------------------------------------------------------
export function deliverySignupOtp(code: string): { subject: string; html: string } {
  return {
    subject: "Verify your delivery account — MED-CARE Ethiopia",
    html: layout({
      preheader: `Your delivery account verification code is ${code}.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">
          <tr>
            <td>${badge("Delivery Partner", "#dcfce7", "#15803d")}</td>
          </tr>
        </table>
        ${heading("Verify your delivery account")}
        ${paragraph("You are registering as a delivery partner on MED-CARE Ethiopia. Enter the code below to verify your email and complete your registration.")}
        ${otpCodeBlock(code)}
        ${divider()}
        ${paragraph("If you did not initiate this registration, please ignore this email.")}
      `,
      footerNote: "This code expires in 15 minutes and can only be used once.",
    }),
  };
}

// ---------------------------------------------------------------------------
// 4. Password reset OTP
// ---------------------------------------------------------------------------
export function passwordResetOtp(code: string): { subject: string; html: string } {
  return {
    subject: "Reset your MED-CARE password",
    html: layout({
      preheader: `Your password reset code is ${code}. This code expires in 15 minutes.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">
          <tr>
            <td>${badge("Password Reset", "#dcfce7", "#15803d")}</td>
          </tr>
        </table>
        ${heading("Reset your password")}
        ${paragraph("We received a request to reset the password for your MED-CARE account. Enter the code below to proceed. If you did not request this, no action is needed.")}
        ${otpCodeBlock(code)}
        ${calloutBox({
          icon: "&#128274;",
          title: "Security notice",
          text: "Never share this code with anyone, including MED-CARE staff. We will never ask for your verification code.",
          bg: "#f0fdf4",
          border: "#bbf7d0",
          titleColor: "#15803d",
          textColor: "#374151",
        })}
        ${divider()}
        ${paragraph("If you did not request a password reset, your account is safe — please ignore this email.")}
      `,
      footerNote: "This code expires in 15 minutes. Request a new one if it has expired.",
    }),
  };
}

// ---------------------------------------------------------------------------
// 5. License approved
// ---------------------------------------------------------------------------
export function licenseApproved(pharmacyName?: string): { subject: string; html: string } {
  const name = pharmacyName ? `<strong>${pharmacyName}</strong>` : "Your pharmacy";
  return {
    subject: "&#127881; Your pharmacy license has been approved — MED-CARE Ethiopia",
    html: layout({
      preheader: "Congratulations! Your pharmacy license has been approved and your store is now live.",
      body: `
        <!-- Hero checkmark -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;width:72px;height:72px;background:#dcfce7;border-radius:50%;text-align:center;line-height:72px;font-size:36px;">&#9989;</div>
        </div>
        ${heading("Congratulations — you're approved!", "#15803d")}
        ${paragraph(`${name} has been reviewed and <strong style="color:#15803d;">approved</strong> by the MED-CARE Ethiopia admin team. Your pharmacy is now live and visible to patients across the platform.`)}

        ${calloutBox({
          icon: "&#129514;",
          title: "You can now",
          text: "Add and manage your medication inventory &bull; Receive and fulfill patient orders &bull; Verify prescriptions &bull; Chat with patients &bull; Track commission payments",
          bg: "#f0fdf4",
          border: "#86efac",
          titleColor: "#15803d",
          textColor: "#374151",
        })}

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;">
          <tr>
            <td align="center">
              <a href="https://medcare-et.vercel.app/pharmacy"
                style="display:inline-block;background:#16a34a;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:99px;text-decoration:none;letter-spacing:0.2px;">
                Go to Pharmacy Dashboard &#8594;
              </a>
            </td>
          </tr>
        </table>
      `,
      footerNote: "Questions? Reply to this email or contact our support team.",
    }),
  };
}

// ---------------------------------------------------------------------------
// 6. License rejected
// ---------------------------------------------------------------------------
export function licenseRejected(reason: string, pharmacyName?: string): { subject: string; html: string } {
  const name = pharmacyName ? `<strong>${pharmacyName}</strong>` : "Your pharmacy license application";
  return {
    subject: "Update on your pharmacy license application — MED-CARE Ethiopia",
    html: layout({
      preheader: "An update regarding your pharmacy license application on MED-CARE Ethiopia.",
      headerAccent: "#b45309",
      body: `
        <!-- Icon -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;width:72px;height:72px;background:#fef3c7;border-radius:50%;text-align:center;line-height:72px;font-size:36px;">&#128203;</div>
        </div>
        ${heading("Application requires attention", "#92400e")}
        ${paragraph(`Thank you for applying to MED-CARE Ethiopia. After review, ${name} was <strong style="color:#b45309;">not approved</strong> at this time.`)}

        ${calloutBox({
          icon: "&#8505;&#65039;",
          title: "Reason for rejection",
          text: reason,
          bg: "#fffbeb",
          border: "#fde68a",
          titleColor: "#92400e",
          textColor: "#78350f",
        })}

        ${calloutBox({
          icon: "&#128260;",
          title: "What to do next",
          text: "Please address the reason above, update your documents in your pharmacy dashboard, and resubmit your application. Our team reviews submissions within 1–3 business days.",
          bg: "#f9fafb",
          border: "#e5e7eb",
          titleColor: "#374151",
          textColor: "#4b5563",
        })}

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;">
          <tr>
            <td align="center">
              <a href="https://medcare-et.vercel.app/pharmacy/profile"
                style="display:inline-block;background:#b45309;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:99px;text-decoration:none;letter-spacing:0.2px;">
                Update &amp; Resubmit &#8594;
              </a>
            </td>
          </tr>
        </table>
      `,
      footerNote: "If you believe this was a mistake, reply to this email and our team will review your case.",
    }),
  };
}

// ---------------------------------------------------------------------------
// 7. Pharmacy suspended
// ---------------------------------------------------------------------------
export function pharmacySuspended(reason: string, pharmacyName?: string): { subject: string; html: string } {
  const name = pharmacyName ? `<strong>${pharmacyName}</strong>` : "Your pharmacy account";
  return {
    subject: "Important: Your pharmacy account has been suspended — MED-CARE Ethiopia",
    html: layout({
      preheader: "Your MED-CARE pharmacy account has been suspended. Please review the details below.",
      headerAccent: "#dc2626",
      body: `
        <!-- Icon -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;width:72px;height:72px;background:#fee2e2;border-radius:50%;text-align:center;line-height:72px;font-size:36px;">&#9888;&#65039;</div>
        </div>
        ${heading("Account suspended", "#991b1b")}
        ${paragraph(`${name} on MED-CARE Ethiopia has been <strong style="color:#dc2626;">suspended</strong> by our admin team. Your pharmacy is no longer visible to patients and cannot accept new orders.`)}

        ${calloutBox({
          icon: "&#128221;",
          title: "Reason for suspension",
          text: reason,
          bg: "#fef2f2",
          border: "#fecaca",
          titleColor: "#991b1b",
          textColor: "#7f1d1d",
        })}

        ${calloutBox({
          icon: "&#128172;",
          title: "How to appeal",
          text: "If you believe this suspension was made in error or you have resolved the issue, please contact our support team. We aim to respond within 24 hours.",
          bg: "#f9fafb",
          border: "#e5e7eb",
          titleColor: "#374151",
          textColor: "#4b5563",
        })}

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;">
          <tr>
            <td align="center">
              <a href="mailto:support@teklumoges.dev"
                style="display:inline-block;background:#dc2626;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:99px;text-decoration:none;letter-spacing:0.2px;">
                Contact Support &#8594;
              </a>
            </td>
          </tr>
        </table>
      `,
      footerNote: "This action was taken by the MED-CARE Ethiopia admin team in accordance with our platform policies.",
    }),
  };
}
