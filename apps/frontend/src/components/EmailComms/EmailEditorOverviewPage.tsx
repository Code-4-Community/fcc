import { useState } from 'react';
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

export function EmailEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('donation');
  const [emails, setEmails] = useState<EmailsState>(defaultEmails);
  const [sig, setSig] = useState<Signature>(DEFAULT_SIGNATURE);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const [ctaText, setCtaText] = useState('DONATE AT OUR SITE!');
  const [ctaLink, setCtaLink] = useState('https://fenwaycommunitycenter.org/');

  const handleEmailChange = (
    tab: TabId,
    field: keyof EmailData,
    value: string,
  ) => {
    setEmails((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));
  };

  const handleSave = () => {
    console.log('[EmailEditorOverviewPage] Save payload:', {
      tab: activeTab,
      subject: emails[activeTab].subject,
      body: emails[activeTab].body,
      signature: sig,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSend = () => {
    const email = emails[activeTab];
    const fullHTML = `
      <html><body>
        ${email.body}
        ${buildSignatureHTML(sig)}
        ${ctaText ? `<div style="text-align:center;margin:28px 0"><a href="#" style="background:#059669;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:0.05em">${ctaText}</a></div>` : ''}
      </body></html>
    `;
    console.log('[EmailEditorOverviewPage] Send payload:', {
      to: '[recipient]',
      subject: email.subject,
      html: fullHTML,
    });
    setSent(true);
    setTimeout(() => setSent(false), 2500);
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
