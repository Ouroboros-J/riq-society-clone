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
    // For now, we'll use console.log to simulate email sending
    // In production, integrate with an actual email service
    console.log('[Email] Sending email:', { to, subject });
    console.log('[Email] Content:', html);
    
    // TODO: Integrate with actual email service
    // Example with fetch to external email API:
    // const response = await fetch('https://api.emailservice.com/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`
    //   },
    //   body: JSON.stringify({ to, subject, html })
    // });
    // return response.ok;
    
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

export function generateCertificateApprovedEmail(userName: string): string {
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
        .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RIQ Society</h1>
        </div>
        <div class="content">
          <h2>증명서 승인 완료</h2>
          <p>안녕하세요, ${userName}님</p>
          <p>제출하신 IQ 증명서가 승인되었습니다.</p>
          <p>축하드립니다! 이제 RIQ Society의 정회원으로서 모든 혜택을 누리실 수 있습니다.</p>
          <a href="https://riq-society.manus.space" class="button">웹사이트 방문하기</a>
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

export function generateCertificateRejectedEmail(userName: string, reason: string): string {
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
        .reason { background-color: #fff; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RIQ Society</h1>
        </div>
        <div class="content">
          <h2>증명서 검토 결과</h2>
          <p>안녕하세요, ${userName}님</p>
          <p>제출하신 IQ 증명서를 검토한 결과, 다음과 같은 사유로 승인이 거부되었습니다.</p>
          <div class="reason">
            <strong>거부 사유:</strong><br>
            ${reason}
          </div>
          <p>추가 문의사항이 있으시면 관리자에게 문의해 주시기 바랍니다.</p>
          <p>다른 증명서를 제출하시려면 마이페이지에서 다시 업로드해 주세요.</p>
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

