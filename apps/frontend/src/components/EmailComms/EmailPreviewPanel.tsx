import type { EmailTabId, EmailsState, Signature } from './types';
import { buildSignatureHTML } from './types';
import FCCEmailHeader from './FCCEmailHeader.svg';
import FCCEmailBg from './FCCEmailBg.png';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

type EmailPreviewPanelProps = {
  activeTab: EmailTabId;
  emails: EmailsState;
  sig: Signature;
  ctaText: string;
  ctaLink: string;
};

export default function EmailPreviewPanel({
  activeTab,
  emails,
  sig,
  ctaText,
  ctaLink,
}: EmailPreviewPanelProps) {
  const email = emails[activeTab];

  return (
    <div className="flex flex-col gap-5 h-full">
      <Label>Email Preview</Label>

      <div className="bg-white border-1 border-[#D4D4D4] overflow-hidden rounded-xl">
        <img src={FCCEmailHeader} alt="Boston skyline" className="w-full" />

        <div className="px-8 py-6 pb-20">
          <div
            className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>

        <div className="flex justify-center pb-12">
          <a href={ctaLink} target="_blank" rel="noreferrer">
            <Button className="px-6 py-4 h-[44px] rounded-md text-white bg-[#2A9D90] font-semibold text-sm transition-all">
              {ctaText}
            </Button>
          </a>
        </div>

        <div className="relative">
          <img src={FCCEmailBg} alt="FCC footer" className="w-full block" />

          <div
            className="absolute inset-0 flex items-center px-8"
            dangerouslySetInnerHTML={{ __html: buildSignatureHTML(sig) }}
          />
        </div>
      </div>
    </div>
  );
}
