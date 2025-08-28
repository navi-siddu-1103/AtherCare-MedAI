'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Bot } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { analyzeSkinCondition } from '@/ai/flows/analyze-skin-condition';
import type { AnalyzeSkinConditionOutput } from '@/ai/flows/analyze-skin-condition';

type AnalysisState = {
  loading: boolean;
  error: string | null;
  result: AnalyzeSkinConditionOutput | null;
};

export default function SkinAnalysisClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    error: null,
    result: null,
  });
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysis({ loading: false, error: null, result: null });
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis({ loading: false, error: null, result: null });
  };

  const handleAnalysis = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select an image file to analyze.',
      });
      return;
    }

    setAnalysis({ loading: true, error: null, result: null });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      try {
        const result = await analyzeSkinCondition({ photoDataUri });
        setAnalysis({ loading: false, error: null, result });
      } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred.';
        setAnalysis({ loading: false, error, result: null });
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: error,
        });
      }
    };
    reader.onerror = () => {
      setAnalysis({ loading: false, error: 'Failed to read the file.', result: null });
    };
  };

  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-chart-2';
      case 'medium':
        return 'bg-chart-4';
      case 'low':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Skin Image</CardTitle>
          <CardDescription>
            Choose a clear, well-lit image of the affected skin area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!previewUrl ? (
            <label
              htmlFor="skin-image-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center text-muted-foreground transition-colors hover:border-primary hover:bg-accent/20"
            >
              <Upload className="h-10 w-10" />
              <span className="mt-4 font-medium">Click to upload or drag and drop</span>
              <span className="mt-1 text-sm">PNG, JPG, or WEBP</span>
              <input
                id="skin-image-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Skin preview"
                width={500}
                height={300}
                className="w-full rounded-lg object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 rounded-full"
                onClick={resetState}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button onClick={handleAnalysis} disabled={!file || analysis.loading} className="w-full">
            {analysis.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        {analysis.loading && (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Bot className="h-16 w-16 animate-pulse text-primary" />
            <p className="font-medium">AI is analyzing your image...</p>
            <p className="text-sm">This may take a moment.</p>
          </div>
        )}

        {analysis.error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{analysis.error}</AlertDescription>
          </Alert>
        )}

        {analysis.result && (
          <Card className="w-full animate-in fade-in-50">
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>
                Here is the AI-powered analysis of your skin image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="font-medium">Acne Probability</span>
                  <span className="font-semibold">
                    {(analysis.result.analysis.acneProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={analysis.result.analysis.acneProbability * 100} />
              </div>
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="font-medium">Other Condition Probability</span>
                   <span className="font-semibold">
                    {(analysis.result.analysis.otherConditionProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={analysis.result.analysis.otherConditionProbability * 100} />
              </div>

              <div className="space-y-2 rounded-lg border bg-card p-3">
                <p>
                  <strong>Detected Condition:</strong> {analysis.result.analysis.conditionName}
                </p>
                <p className="flex items-center">
                  <strong>Confidence:</strong>
                  <span className={`ml-2 inline-block h-3 w-3 rounded-full ${getConfidenceColor(analysis.result.analysis.confidenceLevel)}`}></span>
                  <span className="ml-1.5">{analysis.result.analysis.confidenceLevel}</span>
                </p>
              </div>

              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>AI Recommendation</AlertTitle>
                <AlertDescription>
                  {analysis.result.analysis.recommendation}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Disclaimer: This is an AI-generated analysis and not a substitute for professional medical advice.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
