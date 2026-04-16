type ExportModalProps = {
  onExportCsv?: () => void;
  onExportPdf?: () => void;
};

export default function ExportModal({
  onExportCsv,
  onExportPdf,
}: ExportModalProps) {
  return (
    <div className="h-[84px] w-[130px] shrink-0 rounded-[24px] bg-white p-0 shadow-[0_0_4px_0_rgba(23,23,23,0.25)]">
      <button
        type="button"
        onClick={onExportCsv}
        className="flex h-[42px] w-full items-center justify-center rounded-t-[24px] text-center text-[14px] font-normal leading-6 text-[#171717] outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Export as CSV
      </button>

      <button
        type="button"
        onClick={onExportPdf}
        className="flex h-[42px] w-full items-center justify-center rounded-b-[24px] text-center text-[14px] font-normal leading-6 text-[#171717] outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Export as PDF
      </button>
    </div>
  );
}
