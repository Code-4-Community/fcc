import type { TabId, EmailData, EmailsState, Signature } from './types';
import RichTextEditor from './RichTextEditor';
import ImageUploadButton from './ImageUploadButton';
import SignatureEditorCard from './SignatureEditorCard';

type EmailEditorCardProps = {
  activeTab: TabId;
  emails: EmailsState;
  onEmailChange: (tab: TabId, field: keyof EmailData, value: string) => void;
  sig: Signature;
  onSigChange: (sig: Signature) => void;
  headerImageUrl: string;
  onHeaderImageChange: (url: string) => void;
  ctaText: string;
  onCtaChange: (val: string) => void;
  saved: boolean;
  sent: boolean;
  onSave: () => void;
  onSend: () => void;
};

export default function EmailEditorCard({
  activeTab,
  emails,
  onEmailChange,
  sig,
  onSigChange,
  headerImageUrl,
  onHeaderImageChange,
  ctaText,
  onCtaChange,
  saved,
  sent,
  onSave,
  onSend,
}: EmailEditorCardProps) {
  const currentEmail = emails[activeTab];

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">Email Header</h3>
        <ImageUploadButton
          label="Header banner image"
          currentUrl={headerImageUrl}
          onUpload={onHeaderImageChange}
          shape="rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase">
          Subject Line
        </label>

        <input
          value={currentEmail.subject}
          onChange={(e) => onEmailChange(activeTab, 'subject', e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition"
          placeholder="Email subject…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase">
          Body Text
        </label>

        <RichTextEditor
          key={activeTab}
          content={currentEmail.body}
          onUpdate={(html) => onEmailChange(activeTab, 'body', html)}
        />
      </div>

      <div className="flex flex-col gap-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">
          Email Signature
        </h3>

        <SignatureEditorCard sig={sig} onChange={onSigChange} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase">
          Call to Action
        </label>

        <input
          value={ctaText}
          onChange={(e) => onCtaChange(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onSave}
          className={`px-6 py-2.5 rounded-xl text-white bg-emerald-600 font-semibold text-sm transition-all shadow-md`}
        >
          {saved ? 'Saved' : 'Save Changes'}
        </button>

        <button
          onClick={onSend}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 shadow-md shadow-emerald-200 text-white shadow-md transition-all"
        >
          {sent ? 'Sent!' : 'Send Email'}
        </button>
      </div>
    </div>
  );
}
