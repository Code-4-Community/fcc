import type { TabId, EmailData, EmailsState, Signature } from './types';
import RichTextEditor from './RichTextEditor';
import { Button } from './../ui/button';
import SignatureEditorCard from './SignatureEditorCard';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

type EmailEditorCardProps = {
  activeTab: TabId;
  emails: EmailsState;
  onEmailChange: (tab: TabId, field: keyof EmailData, value: string) => void;
  sig: Signature;
  onSigChange: (sig: Signature) => void;
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
  onCtaChange,
  saved,
  sent,
  onSave,
  onSend,
}: EmailEditorCardProps) {
  const currentEmail = emails[activeTab];

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <Label> Subject Line</Label>

        <input
          value={currentEmail.subject}
          onChange={(e) => onEmailChange(activeTab, 'subject', e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition"
          placeholder="Email subject…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label> Body Text</Label>

        <RichTextEditor
          key={activeTab}
          content={currentEmail.body}
          onUpdate={(html) => onEmailChange(activeTab, 'body', html)}
        />

        <Label className="bg-slate"> Button Text </Label>

        <Input
          value={'Button Link'}
          onChange={(e) => onCtaChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <Label className="pb-2"> Email Signature </Label>

        <SignatureEditorCard sig={sig} onChange={onSigChange} />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={onSave}
          className={`px-6 py-4 rounded-med text-white bg-[#007B64] font-semibold text-sm transition-all`}
        >
          {saved ? 'Saved' : 'Save Changes'}
        </Button>

        <Button
          onClick={onSend}
          className="px-6 py-4 rounded-med font-semibold text-sm bg-[#737373] text-white transition-all"
        >
          {sent ? 'Sent!' : 'Send Email'}
        </Button>
      </div>
    </div>
  );
}
