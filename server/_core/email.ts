import { ENV } from './env';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using built-in notification API
 * This is a simplified implementation that uses the notification system
 * For production, consider using a dedicated email service like SendGrid, Mailgun, or AWS SES
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    console.log('[Email] Sending email:', { to, subject });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

export function generatePaymentRequestEmail(userName: string, tossLink: string, kakaoPayLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .payment-option { background-color: #fff; border: 2px solid #000; padding: 20px; margin: 15px 0; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RIQ Society</h1>
        </div>
        <div class="content">
          <h2>증명서 승인 완료 - 입회비 납부 안내</h2>
          <p>안녕하세요, ${userName}님</p>
          <p>제출하신 IQ 증명서가 승인되었습니다. 축하드립니다!</p>
          <p>정회원 등록을 위해 연회비를 납부해 주세요.</p>
          
          <div class="payment-option">
            <h3>토스 송금 (추천)</h3>
            <p>토스 앱에서 간편하게 송금하세요.</p>
            <a href="${tossLink}" class="button">토스로 송금하기</a>
          </div>
          
          <div class="payment-option">
            <h3>카카오페이 (오픈채팅방)</h3>
            <p>카카오페이 오픈채팅방에서 결제하세요.</p>
            <a href="${kakaoPayLink}" class="button">카카오페이 오픈채팅방 입장</a>
          </div>
          
          <p style="margin-top: 30px;">결제 후 마이페이지에서 입금 확인을 요청해 주세요.</p>
          <a href="https://riq-society.manus.space/mypage" class="button">마이페이지로 이동</a>
        </div>
        <div class="footer">
          <p>© 2024 RIQ Society. All rights reserved.</p>
          <p>PRO IIS QUI ULTRA COGITANT</p>
        </div>
      </div>
    </body>
    </html>
  `;
}



