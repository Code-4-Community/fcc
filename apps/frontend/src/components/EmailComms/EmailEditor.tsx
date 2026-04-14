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
import { Button } from '../ui/button';

export function EmailEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('donation');
  const [emails, setEmails] = useState<EmailsState>(defaultEmails);
  const [sig, setSig] = useState<Signature>(defaultSignature);
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
    <div className="relative flex flex-col gap-5 p-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 w-fit">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-sm text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
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
          saved={saved}
          sent={sent}
          onSave={handleSave}
          onSend={handleSend}
        />

        <EmailPreviewPanel activeTab={activeTab} emails={emails} sig={sig} />
      </div>
    </div>
  );
}
