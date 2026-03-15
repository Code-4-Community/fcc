type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

export const FormField = ({
  id,
  label,
  required,
  error,
  children,
}: FormFieldProps) => (
  <div className="flex flex-col gap-1 w-full">
    <label htmlFor={id} className="text-sm text-[#000] font-normal">
      {label} {required && <span className="text-[#000]">*</span>}
    </label>

    {children}

    {error && (
      <span id={`${id}-error`} className="text-sm text-[#d93025]">
        {error}
      </span>
    )}
  </div>
);
