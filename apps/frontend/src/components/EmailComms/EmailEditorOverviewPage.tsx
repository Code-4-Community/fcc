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

export function EmailEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('donation');
  const [emails, setEmails] = useState<EmailsState>(defaultEmails);
  const [sig, setSig] = useState<Signature>(DEFAULT_SIGNATURE);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const [ctaText, setCtaText] = useState('DONATE AT OUR SITE!');
  const [ctaLink, setCtaLink] = useState('https://fenwaycommunitycenter.org/');

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
                next[tab] = {
                  subject: t.subject,
                  body: t.bodyHtml,
                };
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
    return `
      <html><body>
        ${email.body}
        ${buildSignatureHTML(sig)}
        ${ctaText ? `<div style="text-align:center;margin:28px 0"><a href="${ctaLink}" style="background:#059669;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:0.05em">${ctaText}</a></div>` : ''}
      </body></html>
    `;
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

  const handleSend = async () => {
    try {
      const email = emails[activeTab];
      const fullHTML = buildFullHTML();

      let targetGroup: 'relapsed_donors' | 'email_subscribers';
      if (activeTab === 'relapsed') {
        targetGroup = 'relapsed_donors';
      } else if (activeTab === 'mass') {
        targetGroup = 'email_subscribers';
      } else {
        alert('Use "Save Changes" for Donation Response emails');
        return;
      }

      const result = await apiClient.bulkSendEmail({
        targetGroup,
        subject: email.subject,
        bodyHtml: fullHTML,
      });

      console.log('[EmailEditorOverviewPage] Bulk email sent:', result);
      alert(`Successfully sent ${result.sent} emails to ${result.targetGroup}`);

      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (error) {
      console.error('[EmailEditorOverviewPage] Send failed:', error);
      alert(
        `Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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
            sig={sig}
            onSigChange={setSig}
            ctaText={ctaText}
            onCtaTextChange={setCtaText}
            ctaLink={ctaLink}
            onLinkChange={setCtaLink}
            saved={saved}
            sent={sent}
            onSave={handleSave}
            onSend={handleSend}
          />
        </div>

        <div className="w-full max-w-[700px] flex-shrink sticky top-8 overflow-hidden">
          <EmailPreviewPanel
            activeTab={activeTab}
            emails={emails}
            sig={sig}
            ctaText={ctaText}
            ctaLink={ctaLink}
          />
        </div>
      </div>
    </div>
  );
}
