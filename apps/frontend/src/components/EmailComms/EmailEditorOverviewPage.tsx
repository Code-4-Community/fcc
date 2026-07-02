import { useState, useEffect } from 'react';
import EmailEditorCard from './EmailEditorCard';
import EmailPreviewPanel from './EmailPreviewPanel';
import type { TabId, EmailData, EmailsState, Signature } from './types';
import { Button } from '../ui/button';
import {
  defaultEmails,
  DEFAULT_SIGNATURE,
  TAB_CONFIG,
  buildSignatureHTML,
} from './types';
import apiClient from '../../api/apiClient';
import { ConfirmationModal } from '../ConfirmationModal';

export function EmailEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('donation');
  const [emails, setEmails] = useState<EmailsState>(defaultEmails);
  const [meta, setMeta] = useState<
    Record<TabId, { sig: Signature; ctaText: string; ctaLink: string }>
  >({
    donation: {
      sig: DEFAULT_SIGNATURE,
      ctaText: 'DONATE AT OUR SITE!',
      ctaLink: 'https://fenwaycommunitycenter.org/',
    },
    relapsed: {
      sig: DEFAULT_SIGNATURE,
      ctaText: 'DONATE AT OUR SITE!',
      ctaLink: 'https://fenwaycommunitycenter.org/',
    },
    mass: {
      sig: DEFAULT_SIGNATURE,
      ctaText: 'DONATE AT OUR SITE!',
      ctaLink: 'https://fenwaycommunitycenter.org/',
    },
  });
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await apiClient.getEmailTemplates();
        if (templates && templates.length > 0) {
          setEmails((prev) => {
            const next = { ...prev };
            templates.forEach((t: any) => {
              let tab: TabId | null = null;
              if (t.type === 'donation_response') tab = 'donation';
              else if (t.type === 'relapsed_donor') tab = 'relapsed';
              else if (t.type === 'email_subscribers') tab = 'mass';

              if (tab) {
                const bodyMatch = t.bodyHtml.match(
                  /<!-- FCC_BODY_START -->([\s\S]*?)<!-- FCC_BODY_END -->/,
                );
                const body = bodyMatch ? bodyMatch[1].trim() : t.bodyHtml;

                next[tab] = {
                  subject: t.subject,
                  body: body,
                };
              }
            });
            return next;
          });

          setMeta((prev) => {
            const next = { ...prev };
            templates.forEach((t: any) => {
              let tab: TabId | null = null;
              if (t.type === 'donation_response') tab = 'donation';
              else if (t.type === 'relapsed_donor') tab = 'relapsed';
              else if (t.type === 'email_subscribers') tab = 'mass';

              if (tab) {
                const metaMatch = t.bodyHtml.match(/<!-- FCC_META:(.*?) -->/);
                if (metaMatch) {
                  try {
                    const meta = JSON.parse(metaMatch[1]);
                    next[tab] = {
                      sig: meta.sig || next[tab].sig,
                      ctaText: meta.ctaText || next[tab].ctaText,
                      ctaLink: meta.ctaLink || next[tab].ctaLink,
                    };
                  } catch (e) {
                    console.error('Failed to parse metadata from template', e);
                  }
                }
              }
            });
            return next;
          });
        }
      } catch (error) {
        console.error('[EmailEditor] Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  const handleEmailChange = (
    tab: TabId,
    field: keyof EmailData,
    value: string,
  ) => {
    setEmails((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));
  };

  const buildFullHTML = () => {
    const email = emails[activeTab];
    const m = meta[activeTab];
    const metadata = { sig: m.sig, ctaText: m.ctaText, ctaLink: m.ctaLink };
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://fenwaycommunitycenter.org';
    const isLocal =
      origin.includes('localhost') || origin.includes('127.0.0.1');
    const headerUrl = isLocal
      ? 'https://files.catbox.moe/008bok.png'
      : `${origin}/FCCEmailHeader.png`;
    const bgUrl = isLocal
      ? 'https://files.catbox.moe/11ird9.png'
      : `${origin}/FCCEmailBg.png`;

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!-- FCC_META:${JSON.stringify(metadata)} -->
  <style>
    .email-body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; color: #334155; line-height: 1.75; font-size: 14px; }
    .email-body p { margin-top: 1.25em; margin-bottom: 1.25em; }
    .email-body h1 { font-size: 2.25em; margin-top: 0; margin-bottom: 0.8888889em; line-height: 1.1111111; font-weight: 800; color: #111827; }
    .email-body h2 { font-size: 1.5em; margin-top: 2em; margin-bottom: 1em; line-height: 1.3333333; font-weight: 700; color: #111827; }
    .email-body h3 { font-size: 1.25em; margin-top: 1.6em; margin-bottom: 0.6em; line-height: 1.6; font-weight: 600; color: #111827; }
    .email-body ul { margin-top: 1.25em; margin-bottom: 1.25em; padding-left: 1.625em; list-style-type: disc; }
    .email-body ol { margin-top: 1.25em; margin-bottom: 1.25em; padding-left: 1.625em; list-style-type: decimal; }
    .email-body li { margin-top: 0.5em; margin-bottom: 0.5em; }
    .email-body a { color: #2A9D90; text-decoration: underline; font-weight: 500; }
    .email-body strong { font-weight: 600; color: #111827; }
    .email-body blockquote { font-weight: 500; font-style: italic; color: #111827; border-left-width: 0.25rem; border-left-color: #e2e8f0; margin-top: 1.6em; margin-bottom: 1.6em; padding-left: 1em; }
    .email-body mark { background-color: #fef08a; color: inherit; }
  </style>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;}
    .email-body {font-family: Arial, sans-serif;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; width: 100%;">
    <tr>
      <td align="center" style="padding: 24px 0;">
        <table class="main-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td>
              <img src="${headerUrl}" alt="Header" width="600" style="width: 100%; max-width: 600px; display: block; border: 0;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px; min-height: 300px;">
              <div class="email-body">
                <!-- FCC_BODY_START -->
                ${email.body}
                <!-- FCC_BODY_END -->
              </div>
            </td>
          </tr>
          <!-- CTA -->
          ${
            m.ctaText
              ? `
          <tr>
            <td align="center" style="padding-bottom: 48px;">
              <a href="${m.ctaLink}" style="display: inline-block; background-color: #2A9D90; color: #ffffff; padding: 16px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 14px; font-family: Arial, sans-serif;">
                ${m.ctaText}
              </a>
            </td>
          </tr>`
              : ''
          }
          <!-- Footer with Background -->
          <tr>
            <td background="${bgUrl}" bgcolor="#e2e8f0" valign="middle" style="background: url('${bgUrl}') no-repeat center center / cover; background-size: cover; height: 180px;">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:180px;">
                <v:fill type="tile" src="${bgUrl}" color="#e2e8f0" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <div style="padding: 0 32px; width: 100%; box-sizing: border-box;">
                ${buildSignatureHTML(m.sig)}
              </div>
              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleSave = async () => {
    try {
      const email = emails[activeTab];
      const fullHTML = buildFullHTML();

      let type: 'donation_response' | 'relapsed_donor' | 'email_subscribers';
      if (activeTab === 'donation') {
        type = 'donation_response';
      } else if (activeTab === 'relapsed') {
        type = 'relapsed_donor';
      } else {
        type = 'email_subscribers';
      }

      await apiClient.saveEmailTemplate({
        type,
        subject: email.subject,
        bodyHtml: fullHTML,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('[EmailEditorOverviewPage] Save failed:', error);
      alert(
        `Failed to save: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  const handleSendClick = () => {
    if (activeTab === 'donation') {
      alert('Use "Save Changes" for Donation Response emails');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSend = async () => {
    setIsSending(true);
    try {
      const email = emails[activeTab];
      const fullHTML = buildFullHTML();

      let targetGroup: 'relapsed_donors' | 'email_subscribers';
      if (activeTab === 'relapsed') {
        targetGroup = 'relapsed_donors';
      } else if (activeTab === 'mass') {
        targetGroup = 'email_subscribers';
      } else {
        setIsSending(false);
        return;
      }

      const result = await apiClient.bulkSendEmail({
        targetGroup,
        subject: email.subject,
        bodyHtml: fullHTML,
      });

      console.log('[EmailEditorOverviewPage] Bulk email sent:', result);
      setShowConfirmModal(false);
      alert(`Successfully sent ${result.sent} emails to ${result.targetGroup}`);

      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (error) {
      console.error('[EmailEditorOverviewPage] Send failed:', error);
      alert(
        `Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-6 p-8 bg-[#F5F5F5] min-h-full font-sans">
      <div className="flex flex-row flex-1 gap-14 items-start justify-center">
        <div className="w-full max-w-[700px] flex-shrink-0 flex flex-col gap-6">
          <div className="flex items-center h-12 bg-white rounded-md border border-slate-100 w-fit">
            {TAB_CONFIG.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center h-12 px-6 py-3 rounded-md text-base font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <EmailEditorCard
            activeTab={activeTab}
            emails={emails}
            onEmailChange={handleEmailChange}
            sig={meta[activeTab].sig}
            onSigChange={(s) =>
              setMeta((prev) => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], sig: s },
              }))
            }
            ctaText={meta[activeTab].ctaText}
            onCtaTextChange={(v) =>
              setMeta((prev) => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], ctaText: v },
              }))
            }
            ctaLink={meta[activeTab].ctaLink}
            onLinkChange={(v) =>
              setMeta((prev) => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], ctaLink: v },
              }))
            }
            saved={saved}
            sent={sent}
            onSave={handleSave}
            onSend={handleSendClick}
          />
        </div>

        <div className="w-full max-w-[700px] flex-shrink sticky top-8 overflow-hidden">
          <EmailPreviewPanel
            activeTab={activeTab}
            emails={emails}
            sig={meta[activeTab].sig}
            ctaText={meta[activeTab].ctaText}
            ctaLink={meta[activeTab].ctaLink}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSend}
        title="Confirm Send"
        heading={`Send ${activeTab === 'relapsed' ? 'Relapsed Donor' : 'Mass'} Email?`}
        description={`Are you sure you want to send this email to the ${activeTab === 'relapsed' ? 'Relapsed Donors' : 'Mass Email Subscribers'} list? This action cannot be undone.`}
        confirmText="Send Email"
        cancelText="Cancel"
        confirmVariant="success"
        isConfirming={isSending}
      />
    </div>
  );
}
