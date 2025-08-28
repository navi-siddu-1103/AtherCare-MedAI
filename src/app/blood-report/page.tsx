import BloodReportClient from './blood-report-client';

export default function BloodReportPage() {
  return (
    <div className="h-full">
      <h1 className="font-headline text-3xl font-bold">Blood Report Analysis</h1>
      <p className="mt-2 text-muted-foreground">
        Upload your blood report in PDF format for an intelligent, easy-to-understand summary.
      </p>
      <BloodReportClient />
    </div>
  );
}
