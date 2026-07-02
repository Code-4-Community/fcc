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
    return `<!-- FCC_META:${JSON.stringify(metadata)} -->
<html><body>
  <!-- FCC_BODY_START -->
  ${email.body}
  <!-- FCC_BODY_END -->
  ${buildSignatureHTML(m.sig)}
  ${m.ctaText ? `<div style="text-align:center;margin:28px 0"><a href="${m.ctaLink}" style="background:#059669;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:0.05em">${m.ctaText}</a></div>` : ''}
</body></html>`;
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
