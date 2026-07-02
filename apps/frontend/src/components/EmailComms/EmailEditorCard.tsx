import type { TabId, EmailData, EmailsState, Signature } from './types';
import EmailTextEditor from './EmailTextEditor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import SignatureEditorCard from './SignatureEditorCard';
import { Label } from '../ui/label';
import MailingListManager from './MailingListManager';

type EmailEditorCardProps = {
  activeTab: TabId;
  emails: EmailsState;
  onEmailChange: (tab: TabId, field: keyof EmailData, value: string) => void;
  sig: Signature;
  onSigChange: (sig: Signature) => void;
  ctaText: string;
  onCtaTextChange: (val: string) => void;
  ctaLink: string;
  onLinkChange: (val: string) => void;
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
  ctaText,
  onCtaTextChange: onCtaChange,
  ctaLink,
  onLinkChange: onCtaLinkChange,
  saved,
  sent,
  onSave,
  onSend,
}: EmailEditorCardProps) {
  const currentEmail = emails[activeTab];

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <Label className="pb-2"> Subject Line</Label>

        <Input
          value={currentEmail.subject}
          onChange={(e) => onEmailChange(activeTab, 'subject', e.target.value)}
          className="bg-white border-slate-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition text-[#171717]"
          placeholder="Email subject…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label> Body Text</Label>

        <EmailTextEditor
          key={activeTab}
          content={currentEmail.body}
          onUpdate={(html) => onEmailChange(activeTab, 'body', html)}
        />

        <Label className="pt-1 bg-slate"> Button Text </Label>

        <Input
          value={ctaText}
          onChange={(e) => onCtaChange(e.target.value)}
          className="bg-white border-slate-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition text-[#171717]"
        />

        <Label className="pt-2 bg-slate"> Button Link </Label>

        <Input
          value={ctaLink}
          onChange={(e) => onCtaLinkChange(e.target.value)}
          className="bg-white border-slate-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition text-[#171717]"
        />
      </div>

      <div className="flex flex-col gap-3 bg-white border border-slate-100 rounded-md p-5 shadow-sm">
        <Label className="pb-2"> Email Signature </Label>

        <SignatureEditorCard sig={sig} onChange={onSigChange} />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={onSave}
          className={`px-6 py-2 h-[38px] rounded-md text-white bg-[#007B64] font-medium text-sm transition-all`}
        >
          {saved ? 'Saved' : 'Save Changes'}
        </Button>

        <Button
          onClick={onSend}
          className="px-6 py-2 h-[38px] rounded-md font-medium text-sm bg-[#737373] text-white transition-all"
        >
          {sent ? 'Sent!' : 'Send Email'}
        </Button>
      </div>

      <MailingListManager activeTab={activeTab} />
    </div>
  );
}
