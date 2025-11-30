import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const ADMIN_EMAIL = 'daniel.tomabba@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, organization } = await request.json();

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email notification');
      return NextResponse.json({
        success: true,
        message: 'Email notification skipped (API key not configured)'
      });
    }

    const resend = new Resend(resendApiKey);

    const createdAt = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Send email notification
    const { data, error } = await resend.emails.send({
      from: 'SORMAS AI <onboarding@resend.dev>', // Use Resend's default sender for testing
      to: [ADMIN_EMAIL],
      subject: `New User Registration: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SORMAS AI</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">New User Registration</p>
          </div>

          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">A new user has requested access</h2>

            <div style="background: white; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 120px;">Name</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Organization</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${organization || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Registered</td>
                  <td style="padding: 10px 0; color: #1f2937;">${createdAt}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <a href="https://supabase.com/dashboard"
                 style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                View in Supabase Dashboard
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              The user will need to verify their email before they can sign in.
              You can manage their access in the Supabase Authentication dashboard.
            </p>
          </div>

          <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>SORMAS AI - Global Disease Surveillance Platform</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send email notification:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('Email notification sent:', data);
    return NextResponse.json({
      success: true,
      message: 'Email notification sent',
      id: data?.id
    });

  } catch (error) {
    console.error('Error in notify-registration:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send notification'
    }, { status: 500 });
  }
}
