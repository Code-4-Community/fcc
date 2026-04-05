export type EmailTabId = 'donation' | 'relapsed' | 'other';
export type TabId = EmailTabId;

export type Signature = {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  avatarUrl: string;
  linkedin: string;
  twitter: string;
  instagram: string;
};

export type EmailData = {
  subject: string;
  body: string;
};

export type EmailsState = Record<EmailTabId, EmailData>;

export const defaultEmails: EmailsState = {
  donation: {
    subject: 'Thank You For Your Donation!',
    body: '<p>Dear <strong>[Donor Name]</strong>,</p><p>Thank you sincerely for your generous donation of <strong>[Amount]</strong>. Your support makes a real difference in the lives of those we serve.</p><p>Because of donors like you, we can continue our mission to bring positive change to our community.</p><p>With gratitude,</p>',
  },
  relapsed: {
    subject: "We've Missed You — Come Back!",
    body: "<p>Dear <strong>[Donor Name]</strong>,</p><p>It's been a while since we last heard from you, and we wanted to reach out personally.</p><p>Your past generosity helped us accomplish so much, and we'd love to have you rejoin our community of supporters. Every contribution — big or small — creates lasting impact.</p><p>Warmly,</p>",
  },
  other: {
    subject: 'An Important Update From Us',
    body: '<p>Dear Supporter,</p><p>We have an exciting update to share with you regarding our upcoming initiatives. As a valued member of our community, you deserve to hear about this first.</p><p>Please read below for full details.</p>',
  },
};

export const defaultSignature: Signature = {
  name: 'Pamela Change',
  position: 'Chief Growth Officer',
  company: 'E-Marketing',
  email: 'pamela@e-marketing.com',
  phone: '+1 (555) 234-5678',
  website: 'www.e-marketing.com',
  avatarUrl: '',
  linkedin: '#',
  twitter: '#',
  instagram: '#',
};

export const TAB_CONFIG: { id: TabId; label: string }[] = [
  { id: 'donation', label: 'Donation Response' },
  { id: 'relapsed', label: 'Relapsed Donor' },
  { id: 'other', label: 'Other Emails' },
];

export function buildSignatureHTML(sig: Signature): string {
  const avatarHTML = sig.avatarUrl
    ? `<img src="${sig.avatarUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;display:block;" />`
    : `<div style="width:80px;height:80px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;color:white;font-size:28px;font-weight:bold;text-align:center;line-height:80px;">${sig.name.charAt(0).toUpperCase()}</div>`;

  const socialHTML = [
    sig.linkedin
      ? `<a href="${sig.linkedin}"  style="display:inline-block;width:32px;height:32px;border-radius:6px;background:#e8eaf6;margin-right:6px;text-align:center;line-height:32px;text-decoration:none;font-size:14px;">in</a>`
      : '',
    sig.twitter
      ? `<a href="${sig.twitter}"   style="display:inline-block;width:32px;height:32px;border-radius:6px;background:#e8eaf6;margin-right:6px;text-align:center;line-height:32px;text-decoration:none;font-size:14px;">𝕏</a>`
      : '',
    sig.instagram
      ? `<a href="${sig.instagram}" style="display:inline-block;width:32px;height:32px;border-radius:6px;background:#e8eaf6;margin-right:6px;text-align:center;line-height:32px;text-decoration:none;font-size:14px;">◎</a>`
      : '',
  ].join('');

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;width:100%;font-family:Arial,sans-serif;">
      <tr>
        <td colspan="2" style="padding-bottom:16px;">
          <p style="margin:0;font-size:14px;color:#334155;">We hope you will join us and stay safe.</p>
        </td>
      </tr>

      <tr>
        <td style="vertical-align:top;padding-right:16px;width:96px;">
          ${avatarHTML}
        </td>

        <td style="vertical-align:top;">
          <p style="margin:0 0 2px;font-size:17px;font-weight:700;color:#4f46e5;">${sig.name}</p>

          <p style="margin:0 0 1px;font-size:13px;color:#475569;">${sig.position}</p>
          
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#334155;">${sig.company}</p>
          ${sig.website ? `<p style="margin:0 0 8px;font-size:12px;"><a href="https://${sig.website}" style="color:#4f46e5;text-decoration:none;">${sig.website}</a></p>` : ''}
          <div>${socialHTML}</div>
        </td>

      </tr>
    </table>
  `;
}
