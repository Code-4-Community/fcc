import { useState } from 'react';
import EmailEditorCard from './EmailEditorCard';
import EmailPreviewPanel from './EmailPreviewPanel';

import {
  defaultEmails,
  defaultSignature,
  TAB_CONFIG,
  buildSignatureHTML,
} from './types';
import type { TabId, EmailData, EmailsState, Signature } from './types';

export default function EmailEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('donation');
  const [emails, setEmails] = useState<EmailsState>(defaultEmails);
  const [sig, setSig] = useState<Signature>(defaultSignature);
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Call to action button text');
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmailChange = (
    tab: TabId,
    field: keyof EmailData,
    value: string,
  ) => {
    setEmails((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));
  };

  const handleSave = () => {
    console.log('[EmailEditor] Save payload:', {
      tab: activeTab,
      subject: emails[activeTab].subject,
      body: emails[activeTab].body,
      signature: sig,
      cta: ctaText,
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
    console.log('[EmailEditor] Send payload:', {
      to: '[recipient]',
      subject: email.subject,
      html: fullHTML,
    });
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <EmailEditorCard
          activeTab={activeTab}
          emails={emails}
          onEmailChange={handleEmailChange}
          sig={sig}
          onSigChange={setSig}
          headerImageUrl={headerImageUrl}
          onHeaderImageChange={setHeaderImageUrl}
          ctaText={ctaText}
          onCtaChange={setCtaText}
          saved={saved}
          sent={sent}
          onSave={handleSave}
          onSend={handleSend}
        />

        <EmailPreviewPanel
          activeTab={activeTab}
          emails={emails}
          sig={sig}
          ctaText={ctaText}
          headerImageUrl={headerImageUrl}
        />
      </div>
    </div>
  );
}
