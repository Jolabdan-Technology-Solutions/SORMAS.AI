import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const ADMIN_EMAIL = 'daniel.tomabba@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const { name, email, organization, message } = await request.json();

    // Validate required fields
    if (!name || !email || !organization || !message) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, logging inquiry instead');
      console.log('Enterprise Inquiry:', { name, email, organization, message });
      return NextResponse.json({
        success: true,
        message: 'Inquiry logged (email not configured)'
      });
    }

    const resend = new Resend(resendApiKey);

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Send email notification
    const { data, error } = await resend.emails.send({
      from: 'SORMAS AI <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `Enterprise Inquiry from ${organization}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SORMAS AI</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">Enterprise Inquiry</p>
          </div>

          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">New Enterprise Lead</h2>

            <p style="color: #4b5563; margin-bottom: 20px;">
              A potential enterprise customer has reached out through the pricing page.
            </p>

            <div style="background: white; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 120px;">Name</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">
                    <a href="mailto:${email}" style="color: #6366f1;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Organization</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${organization}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Submitted</td>
                  <td style="padding: 10px 0; color: #1f2937;">${submittedAt}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 20px; background: white; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
              <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 10px;">Their Message</h3>
              <p style="color: #4b5563; white-space: pre-wrap; margin: 0;">${message}</p>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${email}"
                 style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Reply to ${name}
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Tip: Respond within 24 hours to maximize conversion. Enterprise leads typically
              need custom demos and pricing discussions.
            </p>
          </div>

          <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>SORMAS AI - Global Disease Surveillance Platform</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send enterprise inquiry email:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('Enterprise inquiry email sent:', data);
    return NextResponse.json({
      success: true,
      message: 'Inquiry sent successfully',
      id: data?.id
    });

  } catch (error) {
    console.error('Error in enterprise-inquiry:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process inquiry'
    }, { status: 500 });
  }
}
