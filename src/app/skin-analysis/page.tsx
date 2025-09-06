import SkinAnalysisClient from './skin-analysis-client';

export default function SkinAnalysisPage() {
  return (
    <div className="h-full flex flex-col">
      <div>
        <h1 className="font-headline text-3xl font-bold">AI Skin Analysis</h1>
        <p className="mt-2 text-muted-foreground">
          Upload an image of your skin to get an AI-powered analysis for potential conditions.
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <SkinAnalysisClient />
      </div>
    </div>
  );
}
