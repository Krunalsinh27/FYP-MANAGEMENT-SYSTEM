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