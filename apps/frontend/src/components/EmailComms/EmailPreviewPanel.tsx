import type { EmailTabId, EmailsState, Signature } from './types';
import { buildSignatureHTML } from './types';
import FCCEmailHeader from './FCCEmailHeader.svg';

interface EmailPreviewPanelProps {
  activeTab: EmailTabId;
  emails: EmailsState;
  sig: Signature;
}

export default function EmailPreviewPanel({
  activeTab,
  emails,
  sig,
}: EmailPreviewPanelProps) {
  const email = emails[activeTab];

  return (
    <div className="flex flex-col gap-5 h-full">
      <p className="text-xs font-semibold uppercase tracking-widest">
        Email Preview
      </p>

      <div className="bg-white shadow-lg border border-slate-100 overflow-hidden">
        <img src={FCCEmailHeader} alt="Boston skyline" className="w-full" />

        <div className="px-8 py-6">
          <div
            className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />

          <div
            className="border-t border-slate-100"
            dangerouslySetInnerHTML={{ __html: buildSignatureHTML(sig) }}
          />
        </div>
      </div>
    </div>
  );
}
