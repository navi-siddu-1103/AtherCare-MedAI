import SkinAnalysisClient from './skin-analysis-client';

export default function SkinAnalysisPage() {
  return (
    <div className="h-full">
      <h1 className="font-headline text-3xl font-bold">AI Skin Analysis</h1>
      <p className="mt-2 text-muted-foreground">
        Upload an image of your skin to get an AI-powered analysis for potential conditions.
      </p>
      <SkinAnalysisClient />
    </div>
  );
}
