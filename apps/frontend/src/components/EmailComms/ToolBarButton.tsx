export default function ToolBarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`w-7 self-stretch flex items-center justify-center rounded text-sm transition-all text-[#212529] ${
        active ? 'bg-[#212529]/15' : 'hover:bg-[#212529]/10'
      }`}
    >
      {children}
    </button>
  );
}
