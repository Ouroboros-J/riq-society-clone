INSERT INTO emailTemplates (templateKey, subject, body, description) VALUES
('application_approved', 
 'RIQ Society 입회 신청이 승인되었습니다', 
 '안녕하세요, {{name}}님.

RIQ Society 입회 신청이 승인되었습니다.

이제 회비 납부를 진행해주시면 정회원으로 등록됩니다.
입금 정보는 마이페이지에서 확인하실 수 있습니다.

감사합니다.
RIQ Society', 
 '입회 신청 승인 시 발송되는 이메일'),

('application_rejected', 
 'RIQ Society 입회 신청 결과 안내', 
 '안녕하세요, {{name}}님.

안타깝게도 귀하의 RIQ Society 입회 신청이 승인되지 않았습니다.

사유: {{reason}}

추가 문의사항이 있으시면 언제든지 연락 주시기 바랍니다.

감사합니다.
RIQ Society', 
 '입회 신청 거부 시 발송되는 이메일'),

('payment_confirmed', 
 'RIQ Society 회비 입금이 확인되었습니다', 
 '안녕하세요, {{name}}님.

회비 입금이 확인되어 정회원으로 등록되었습니다.

이제 RIQ Society의 모든 혜택을 누리실 수 있습니다.

감사합니다.
RIQ Society', 
 '회비 입금 확인 시 발송되는 이메일')
ON DUPLICATE KEY UPDATE
  subject = VALUES(subject),
  body = VALUES(body),
  description = VALUES(description);
