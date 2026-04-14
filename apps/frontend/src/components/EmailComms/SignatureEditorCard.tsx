import type { Signature } from './types';
export default function SignatureEditor({
  sig,
  onChange,
}: {
  sig: Signature;
  onChange: (s: Signature) => void;
}) {
  const field = (label: string, key: keyof Signature, placeholder: string) => (
    <div key={key} className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </label>

      <input
        value={(sig[key] as string) || ''}
        onChange={(e) => onChange({ ...sig, [key]: e.target.value })}
        placeholder={placeholder}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
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
