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
    <div key={key} className="flex flex-col gap-">
      <Label>{label}</Label>

      <Input
        value={(sig[key] as string) || ''}
        onChange={(e) => onChange({ ...sig, [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {field('Full Name', 'name', 'Your name')}

        {field('Position', 'position', 'Your title')}

        {field('Email', 'email', 'you@company.com')}
      </div>
    </div>
  );
}
