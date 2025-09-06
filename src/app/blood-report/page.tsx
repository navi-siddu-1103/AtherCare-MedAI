import BloodReportClient from './blood-report-client';

export default function BloodReportPage() {
  return (
    <div className="h-full flex flex-col">
      <div>
        <h1 className="font-headline text-3xl font-bold">Blood Report Analysis</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your blood report in PDF format for an intelligent, easy-to-understand summary.
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <BloodReportClient />
      </div>
    </div>
  );
}
