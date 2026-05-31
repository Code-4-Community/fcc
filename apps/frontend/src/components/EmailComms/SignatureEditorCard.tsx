import { Input } from '../ui/input';
import type { Signature } from './types';
import { Label } from '../ui/label';
export default function SignatureEditor({
  sig,
  onChange,
}: {
  sig: Signature;
  onChange: (s: Signature) => void;
}) {
  const field = (label: string, key: keyof Signature, placeholder: string) => (
    <div key={key} className="flex flex-col gap-1.5">
      <Label>{label}</Label>

      <Input
        value={(sig[key] as string) || ''}
        onChange={(e) => onChange({ ...sig, [key]: e.target.value })}
        placeholder={placeholder}
        className="bg-white border-slate-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition text-[#171717]"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {field('Full Name', 'name', 'Your name')}
        {field('Position', 'position', 'Your title')}
        {field('Email', 'email', 'mallory@fenwaycommunitycenter.org')}
        {field('Pronouns', 'pronouns', '(she/her)')}
        {field('Website', 'website', 'https://fenwaycommunitycenter.org/')}
        {field(
          'LinkedIn',
          'linkedin',
          'https://www.linkedin.com/company/fenwaycommunitycenter',
        )}
        {field('X (Twitter)', 'X', 'https://twitter.com/...')}
        {field(
          'Facebook',
          'facebook',
          'https://www.facebook.com/fenwaycommunitycenter',
        )}
      </div>
      {field(
        'Image Upload (CDN URL placeholder)',
        'imageUrl',
        'https://example.com/image.png',
      )}
    </div>
  );
}
