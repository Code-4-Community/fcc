import type { EmailTabId, EmailsState, Signature } from './types';
import { buildSignatureHTML } from './types';

interface EmailPreviewPanelProps {
  activeTab: EmailTabId;
  emails: EmailsState;
  sig: Signature;
  ctaText: string;
  headerImageUrl: string;
}

export default function EmailPreviewPanel({
  activeTab,
  emails,
  sig,
  ctaText,
  headerImageUrl,
}: EmailPreviewPanelProps) {
  const email = emails[activeTab];

  return (
    <div className="flex flex-col gap-5 h-full">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Email Preview
      </p>

      <div className="bg-white shadow-lg border border-slate-100 overflow-hidden">
        {headerImageUrl ? (
          <div className="w-full h-[120px] overflow-hidden">
            <img
              src={headerImageUrl}
              alt="Email header"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-5 flex items-center gap-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-7 h-7 text-white"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="text-white font-semibold text-lg tracking-wide">
              {sig.company || 'Your Organization'}
            </span>
          </div>
        )}

        <div className="px-8 py-6">
          <div
            className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />

          {ctaText && (
            <div className="mb-8 text-center">
              <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold tracking-wide text-sm shadow-lg shadow-indigo-100 uppercase">
                {ctaText}
              </button>
            </div>
          )}

          <div
            className="border-t border-slate-100 pt-6"
            dangerouslySetInnerHTML={{ __html: buildSignatureHTML(sig) }}
          />
        </div>
      </div>
    </div>
  );
}
