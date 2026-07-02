export type EmailTabId = 'donation' | 'relapsed' | 'mass';
export type TabId = EmailTabId;

export type Signature = {
  name: string;
  position: string;
  email: string;
  pronouns: string;
  website: string;
  linkedin: string;
  X: string;
  facebook: string;
};

export type EmailData = {
  subject: string;
  body: string;
};

export type EmailsState = Record<EmailTabId, EmailData>;

const FILLER_EMAIL_BODY = `
<p>Dear Donor,</p>

<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin dictum gravida justo,
nec porttitor sapien bibendum in. Cras sed quam nec lectus malesuada condimentum nec in urna.
Ut volutpat nisi arcu, sit amet malesuada ipsum euismod sed.
</p>

<p>
Vivamus ut cursus justo. Cras et libero congue, congue urna ac, vulputate urna.
Nulla egestas semper sagittis. Nulla facilisi. Aenean semper fermentum euismod.
Mauris ut velit nec neque tristique pretium. Nam luctus, orci ut rutrum pretium,
risus leo pharetra enim, in auctor velit sapien sit amet arcu. Curabitur in viverra sem.
</p>

<p>
Maecenas posuere dolor nulla. Aenean ultrices posuere convallis.
Proin quis leo eget eros luctus efficitur. Proin eget velit ut tortor sollicitudin dignissim.
Morbi pharetra consequat mi quis pharetra.
</p>
`;

export const defaultEmails: EmailsState = {
  donation: {
    subject: 'Thank You For Your Donation!',
    body: FILLER_EMAIL_BODY,
  },
  relapsed: {
    subject: "We've Missed You — Come Back!",
    body: FILLER_EMAIL_BODY,
  },
  mass: {
    subject: 'An Important Update From Us',
    body: FILLER_EMAIL_BODY,
  },
};

export const DEFAULT_SIGNATURE: Signature = {
  name: 'Mallory Rohig',
  position: 'Executive Director',
  email: 'mallory@fenwaycommunitycenter.org',
  pronouns: '(she/her)',
  website: 'https://fenwaycommunitycenter.org/',
  linkedin: 'https://www.linkedin.com/company/fenwaycommunitycenter',
  X: '',
  facebook: 'https://www.facebook.com/fenwaycommunitycenter',
};

export const TAB_CONFIG: { id: TabId; label: string }[] = [
  { id: 'donation', label: 'Donation Response' },
  { id: 'relapsed', label: 'Relapsed Donor Message' },
  { id: 'mass', label: 'Mass Email' },
];

export function buildSignatureHTML(sig: Signature): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://fenwaycommunitycenter.org';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
  const fbUrl = isLocal
    ? 'https://files.catbox.moe/fuxnuq.png'
    : `${origin}/facebook.png`;
  const xUrl = isLocal
    ? 'https://files.catbox.moe/yljj1o.png'
    : `${origin}/x.png`;
  const linkedinUrl = isLocal
    ? 'https://files.catbox.moe/gmuylj.png'
    : `${origin}/linkedin.png`;

  const socialHTML = [
    sig.facebook
      ? `<a href="${sig.facebook}" target="_blank" rel="noreferrer" style="display:inline-block;margin-right:4px;text-decoration:none;">
          <img src="${fbUrl}" width="20" height="20" alt="Facebook" style="display:block;border:0;border-radius:50%;">
         </a>`
      : '',
    sig.X
      ? `<a href="${sig.X}" target="_blank" rel="noreferrer" style="display:inline-block;margin-right:4px;text-decoration:none;">
          <img src="${xUrl}" width="20" height="20" alt="X" style="display:block;border:0;border-radius:50%;">
         </a>`
      : '',
    sig.linkedin
      ? `<a href="${sig.linkedin}" target="_blank" rel="noreferrer" style="display:inline-block;text-decoration:none;">
          <img src="${linkedinUrl}" width="20" height="20" alt="LinkedIn" style="display:block;border:0;border-radius:50%;">
         </a>`
      : '',
  ].join('');

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;font-family:Arial,sans-serif;max-width:100%;table-layout:fixed;">
      <tr>
        <!-- Name / Title / Pronouns -->
        <td style="vertical-align:middle;overflow:hidden;">
          <p style="margin:0 0 1px;font-size:clamp(12px, 2vw, 16px);font-weight:800;color:#1a1a1a;letter-spacing:-0.2px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sig.name}</p>
          <p style="margin:0 0 1px;font-size:clamp(10px, 1.2vw, 12px);font-weight:400;color:#334155;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sig.position}</p>
          <p style="margin:0;font-size:clamp(9px, 1vw, 11px);font-weight:400;color:#334155;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sig.pronouns}</p>
        </td>

        <!-- Website + Social -->
        <td style="vertical-align:middle;text-align:right;width:35%;min-width:100px;">
          ${
            sig.email
              ? `<p style="margin:0 0 2px;font-size:clamp(9px, 1.2vw, 12px);font-weight:700;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            <a href="mailto:${sig.email}" target="_blank" rel="noreferrer" style="color:#1a1a1a;text-decoration:none;">${sig.email}</a>
          </p>`
              : ''
          }
          ${
            sig.website
              ? `<p style="margin:0 0 6px;font-size:clamp(9px, 1.2vw, 12px);font-weight:700;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            <a href="${sig.website}" target="_blank" rel="noreferrer" style="color:#1a1a1a;text-decoration:none;">${sig.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
          </p>`
              : ''
          }
          <div style="white-space:nowrap;">${socialHTML}</div>
        </td>
      </tr>
    </table>
  `;
}
