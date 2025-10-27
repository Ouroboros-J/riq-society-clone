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

    console.log('Email sent successfully:', data);
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
 * 입회 신청 거부 이메일
 */
export async function sendApplicationRejectedEmail(
  to: string,
  fullName: string,
  reason: string,
  template?: EmailTemplate
) {
  const subject = template?.subject || 'RIQ Society 입회 신청 결과 안내';
  const html = template?.body
    ? template.body.replace('{{fullName}}', fullName).replace('{{reason}}', reason)
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">입회 신청 결과</h2>
      <p>안녕하세요, ${fullName}님</p>
      <p>안타깝게도 RIQ Society 입회 신청이 승인되지 않았습니다.</p>
      <p><strong>거부 사유:</strong></p>
      <p style="background-color: #fee2e2; padding: 15px; border-radius: 5px;">${reason}</p>
      <p>재검토를 원하시면 마이페이지에서 재검토 요청을 하실 수 있습니다.</p>
      <br/>
      <p>감사합니다.</p>
      <p>RIQ Society 운영팀</p>
    </div>
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
 * 재검토 요청 거부 이메일
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

