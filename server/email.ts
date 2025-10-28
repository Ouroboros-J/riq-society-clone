import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'RIQ Society <noreply@riqsociety.com>'; // 실제 도메인으로 변경 필요

export interface EmailTemplate {
  subject: string;
  body: string;
}

/**
 * 이메일 발송 함수
 */
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

/**
 * 입회 신청 승인 이메일
 */
export async function sendApplicationApprovedEmail(
  to: string,
  fullName: string,
  template?: EmailTemplate
) {
  const subject = template?.subject || 'RIQ Society 입회 신청이 승인되었습니다';
  const html = template?.body
    ? template.body.replace('{{fullName}}', fullName)
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">입회 신청 승인</h2>
      <p>안녕하세요, ${fullName}님</p>
      <p>RIQ Society 입회 신청이 승인되었습니다.</p>
      <p>다음 단계로 입회비 결제를 진행해주세요.</p>
      <p><strong>입회비:</strong> 50,000원</p>
      <p><strong>계좌번호:</strong> 국민은행 123-456-789012 (예금주: RIQ Society)</p>
      <p>입금 후 마이페이지에서 입금 확인 요청을 해주시기 바랍니다.</p>
      <br/>
      <p>감사합니다.</p>
      <p>RIQ Society 운영팀</p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

/**
 * 입회 신청 반려 이메일
 * Summarizer AI의 영어 응답을 활용한 전문적인 템플릿
 */
export async function sendApplicationRejectedEmail(
  to: string,
  fullName: string,
  reason: string,
  template?: EmailTemplate
) {
  const subject = template?.subject || 'RIQ Society Application Result';
  
  // Summarizer AI의 영어 응답을 그대로 사용
  // 브라우저 자동 번역 기능 활용
  const html = template?.body
    ? template.body.replace('{{fullName}}', fullName).replace('{{reason}}', reason)
    : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RIQ Society Application Result</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">RIQ Society</h1>
          <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">High IQ Society</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Application Result</h2>
          
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Dear ${fullName},
          </p>
          
          <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for your interest in joining RIQ Society. After careful review of your application, we regret to inform you that your application has not been approved at this time.
          </p>
          
          <!-- AI Feedback Section -->
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 15px 0; color: #991b1b; font-size: 18px; font-weight: 600;">Detailed Feedback</h3>
            <div style="color: #7f1d1d; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${reason}</div>
          </div>
          
          <!-- Next Steps -->
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">Next Steps</h3>
            <p style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 15px; line-height: 1.6;">
              If you believe there has been an error in the verification process, you may request a manual review through your account dashboard.
            </p>
            <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.6;">
              <strong>Note:</strong> You can request a review only once. Please ensure all documents are clear and meet the requirements before submitting.
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 0 0 30px 0;">
            <a href="https://riqsociety.org/mypage" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Go to My Account
            </a>
          </div>
          
          <!-- Contact Info -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions or need assistance, please contact us:
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              <strong>Email:</strong> support@riqsociety.org<br/>
              <strong>Website:</strong> <a href="https://riqsociety.org" style="color: #667eea; text-decoration: none;">riqsociety.org</a>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            Thank you for your interest in RIQ Society.
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            &copy; 2025 RIQ Society. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, subject, html);
}

/**
 * 재검토 요청 승인 이메일
 */
export async function sendReviewApprovedEmail(
  to: string,
  fullName: string
) {
  const subject = 'RIQ Society 재검토 요청이 승인되었습니다';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">재검토 요청 승인</h2>
      <p>안녕하세요, ${fullName}님</p>
      <p>재검토 요청이 승인되어 입회 신청이 승인되었습니다.</p>
      <p>다음 단계로 입회비 결제를 진행해주세요.</p>
      <p><strong>입회비:</strong> 50,000원</p>
      <p><strong>계좌번호:</strong> 국민은행 123-456-789012 (예금주: RIQ Society)</p>
      <p>입금 후 마이페이지에서 입금 확인 요청을 해주시기 바랍니다.</p>
      <br/>
      <p>감사합니다.</p>
      <p>RIQ Society 운영팀</p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

/**
 * 재검토 요청 반려 이메일
 */
export async function sendReviewRejectedEmail(
  to: string,
  fullName: string
) {
  const subject = 'RIQ Society 재검토 요청 결과 안내';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">재검토 요청 결과</h2>
      <p>안녕하세요, ${fullName}님</p>
      <p>안타깝게도 재검토 요청이 승인되지 않았습니다.</p>
      <p>추가 문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
      <br/>
      <p>감사합니다.</p>
      <p>RIQ Society 운영팀</p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

/**
 * 결제 확인 이메일
 */
export async function sendPaymentConfirmedEmail(
  to: string,
  fullName: string
) {
  const subject = 'RIQ Society 결제가 확인되었습니다';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">결제 확인 완료</h2>
      <p>안녕하세요, ${fullName}님</p>
      <p>입회비 결제가 확인되었습니다.</p>
      <p>정회원 승인이 완료되면 다시 안내드리겠습니다.</p>
      <br/>
      <p>감사합니다.</p>
      <p>RIQ Society 운영팀</p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

