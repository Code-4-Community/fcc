import FCCEmailMallory from './FCCEmailMallory.png';
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
  email: 'filler-email@gmail.com',
  pronouns: '(she/her)',
  website: 'https://fenwaycommunitycenter.org/',
  linkedin: 'https://www.linkedin.com/company/fenwaycommunitycenter/',
  X: 'https://fenwaycommunitycenter.org/?share=x&nb=1',
  facebook: 'https://fenwaycommunitycenter.org/?share=facebook&nb=1',
};

export const TAB_CONFIG: { id: TabId; label: string }[] = [
  { id: 'donation', label: 'Donation Response' },
  { id: 'relapsed', label: 'Relapsed Donor Message' },
  { id: 'mass', label: 'Mass Email' },
];

export function buildSignatureHTML(sig: Signature): string {
  const socialHTML = [
    sig.facebook
      ? `<a href="${sig.facebook}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;border-radius:50%;background:#1877F2;margin-right:6px;text-decoration:none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
         </a>`
      : '',
    sig.X
      ? `<a href="${sig.X}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;border-radius:50%;background:#000;margin-right:6px;text-decoration:none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
         </a>`
      : '',
    sig.linkedin
      ? `<a href="${sig.linkedin}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;border-radius:50%;background:#0A66C2;text-decoration:none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
         </a>`
      : '',
  ].join('');

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;font-family:Arial,sans-serif;">
      <tr>
        <!-- Photo -->
        <td style="vertical-align:middle;width:90px;padding-right:16px;">
          <img src="${FCCEmailMallory}" alt="${sig.name}"
            style="width:80px;height:80px;border-radius:50%;object-fit:cover;object-position:top;border:3px solid white;display:block;" />
        </td>

        <!-- Name / Title / Pronouns -->
        <td style="vertical-align:middle;">
          <p style="margin:0 0 2px;font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.3px;">${sig.name}</p>
          <p style="margin:0 0 2px;font-size:14px;font-weight:400;color:#334155;">${sig.position}</p>
          <p style="margin:0;font-size:14px;font-weight:400;color:#334155;">${sig.pronouns}</p>
        </td>

        <!-- Website + Social -->
        <td style="vertical-align:middle;text-align:right;white-space:nowrap;">
          ${
            sig.website
              ? `<p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1a1a1a;">
            <a href="${sig.website}" target="_blank" rel="noreferrer" style="color:#1a1a1a;text-decoration:none;">${sig.website.replace(/^https?:\/\//, '')}</a>
          </p>`
              : ''
          }
          <div>${socialHTML}</div>
        </td>
      </tr>
    </table>
  `;
}
