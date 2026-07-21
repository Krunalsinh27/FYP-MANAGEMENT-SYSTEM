export function generateOTPEmailTemplate({ name, otp, verificationUrl }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Email Verification - OTP</title>
    </head>
    <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#0f172a; color:#f8fafc;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a; padding:40px 20px;">
        <tr>
          <td align="center">
            
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b; border-radius:16px; overflow:hidden; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
              
              <!-- HEADER -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color:white; text-align:center; padding:30px 20px;">
                  <h1 style="margin:0; font-size:26px; font-weight:800; letter-spacing: -0.5px;">🎓 FYP Management System</h1>
                  <p style="margin:8px 0 0 0; font-size:14px; opacity:0.9;">Educational Project & Supervisor Management</p>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding:40px 30px; color:#e2e8f0; line-height: 1.6;">
                  
                  <h2 style="margin-top:0; color:#ffffff; font-size:22px; font-weight:700;">Verify Your Email Address</h2>
                  
                  <p style="font-size:15px; color:#cbd5e1;">
                    Hello <strong style="color:#ffffff;">${name || "User"}</strong>,
                  </p>
                  
                  <p style="font-size:15px; color:#cbd5e1;">
                    Thank you for joining the FYP Management System. Please use the following 6-digit One-Time Password (OTP) to complete your email verification:
                  </p>

                  <!-- OTP BOX -->
                  <div style="text-align:center; margin:35px 0;">
                    <div style="display:inline-block; background:#0f172a; border: 2px dashed #6366f1; border-radius:12px; padding:18px 40px;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size:38px; font-weight:900; letter-spacing: 12px; color:#818cf8; text-shadow: 0 0 10px rgba(129, 140, 248, 0.3);">
                        ${otp}
                      </span>
                    </div>
                    <p style="font-size:13px; color:#94a3b8; margin-top:10px;">
                      ⏱️ This OTP is valid for <strong>10 minutes</strong>. Maximum 5 attempts allowed.
                    </p>
                  </div>

                  <!-- VERIFY BUTTON -->
                  <div style="text-align:center; margin:30px 0;">
                    <a href="${verificationUrl}" 
                      style="display:inline-block; background:#6366f1; color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:10px; font-size:16px; font-weight:700; shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);">
                      Verify Account & Login →
                    </a>
                  </div>

                  <p style="font-size:13px; color:#94a3b8;">
                    If the button doesn't work, copy and paste this link in your browser:
                  </p>
                  <p style="word-break:break-all; font-size:13px; color:#818cf8;">
                    ${verificationUrl}
                  </p>

                  <hr style="border:none; border-top:1px solid #334155; margin:30px 0;" />

                  <p style="font-size:13px; color:#94a3b8; margin-bottom:0;">
                    If you did not request this email, please ignore it or contact system support.
                  </p>

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background:#0f172a; text-align:center; padding:20px; font-size:12px; color:#64748b; border-top: 1px solid #1e293b;">
                  © ${new Date().getFullYear()} FYP Management System. All rights reserved.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}

export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset</title>
    </head>

    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
        <tr>
          <td align="center">
            
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
              
              <!-- HEADER -->
              <tr>
                <td style="background:#4CAF50; color:white; text-align:center; padding:20px; font-size:24px; font-weight:bold;">
                  FYP Management System
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding:30px; color:#333;">
                  
                  <h2>Password Reset Request</h2>
                  
                  <p>
                    You requested to reset your password. Click the button below to set a new password.
                  </p>

                  <p style="text-align:center; margin:30px 0;">
                    <a href="${resetPasswordUrl}" 
                      style="background:#4CAF50; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
                      Reset Password
                    </a>
                  </p>

                  <p>
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>

                  <p style="word-break:break-all; color:#4CAF50;">
                    ${resetPasswordUrl}
                  </p>

                  <p>
                    This link will expire in <strong>15 minutes</strong>.
                  </p>

                  <p>
                    If you did not request this, please ignore this email.
                  </p>

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background:#f4f4f4; text-align:center; padding:15px; font-size:12px; color:#777;">
                  © ${new Date().getFullYear()} FYP System. All rights reserved.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}

export function generateRequestAcceptedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#10b981;">✅ Supervisor Request Accepted</h2>
      <p>Your supervisor request has been accepted by <strong>${supervisorName}</strong>.</p>
      <p>You can now start working on your project and upload files.</p>
    </div>
  `;
}

export function generateRequestRejectedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#ef4444;">❌ Supervisor Request Rejected</h2>
      <p>Your supervisor request has been rejected by <strong>${supervisorName}</strong>.</p>
      <p>You can try requesting another supervisor.</p>
    </div>
  `;
}