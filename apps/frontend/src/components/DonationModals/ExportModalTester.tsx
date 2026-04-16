import ExportModal from './ExportModal';

export default function ExportModalTester() {
  return (
    <div className="flex min-h-screen items-start justify-start bg-[#d9d9d9] p-12">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[#171717]">ExportModal tester</p>

        <ExportModal
          onExportCsv={() => {
            console.log('Export as CSV clicked');
          }}
          onExportPdf={() => {
            console.log('Export as PDF clicked');
          }}
        />
      </div>
    </div>
  );
}
