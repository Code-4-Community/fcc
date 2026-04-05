import { useRef } from 'react';

export default function ImageUploadButton({
  label,
  currentUrl,
  onUpload,
  shape = 'rounded-lg',
}: {
  label: string;
  currentUrl: string;
  onUpload: (url: string) => void;
  shape?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-14 h-14 ${shape} overflow-hidden bg-emerald-100 border-2 border-dashed border-emerald-400 flex items-center justify-center shrink-0`}
        onClick={() => inputRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-emerald-400"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M4 16l4-4a3 3 0 014 0l4 4M14 12l2-2a3 3 0 014 0l2 2M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 transition font-medium w-fit"
        >
          {currentUrl ? 'Change image' : 'Upload image'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
