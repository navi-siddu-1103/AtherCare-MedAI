
'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { FileText, X, Loader2, Bot, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { analyzeBloodReport } from '@/ai/flows/analyze-blood-report';
import type { AnalyzeBloodReportOutput } from '@/ai/flows/analyze-blood-report';

type AnalysisState = {
  loading: boolean;
  error: string | null;
  result: AnalyzeBloodReportOutput | null;
};

const formatAnalysis = (text: string) => {
    const sections = text.split('## ').filter(Boolean);
    return sections.map((section, index) => {
        const lines = section.split('\n').filter(Boolean);
        const title = lines[0];
        const points = lines.slice(1).map(line => line.replace('* ', ''));
        return (
            <div key={index} className="mb-4 last:mb-0">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
                    {points.map((point, i) => (
                        <li key={i}>{point}</li>
                    ))}
                </ul>
            </div>
        );
    });
};

export default function BloodReportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    error: null,
    result: null,
  });
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setAnalysis({ loading: false, error: null, result: null });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
      });
    }
  };

  const resetState = () => {
    setFile(null);
    setAnalysis({ loading: false, error: null, result: null });
  };

  const handleAnalysis = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a PDF file to analyze.',
      });
      return;
    }

    setAnalysis({ loading: true, error: null, result: null });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const pdfDataUri = reader.result as string;
      try {
        const result = await analyzeBloodReport({ pdfDataUri });
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

  return (
    <div className="mt-6 w-full max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Blood Report</CardTitle>
          <CardDescription>
            Only PDF files are accepted for analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
             <label
              htmlFor="blood-report-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center text-muted-foreground transition-colors hover:border-primary hover:bg-accent/20"
            >
              <Upload className="h-10 w-10" />
              <span className="mt-4 font-medium">Click to upload or drag and drop</span>
              <span className="mt-1 text-sm">PDF file</span>
              <input
                id="blood-report-upload"
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative flex items-center justify-between rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <span className="font-medium">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
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
              'Analyze Report'
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        {analysis.loading && (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Bot className="h-16 w-16 animate-pulse text-primary" />
            <p className="font-medium">AI is analyzing your report...</p>
            <p className="text-sm">This may take a few moments.</p>
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
                An easy-to-understand summary of your blood report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>AI Summary</AlertTitle>
                <AlertDescription>
                  {formatAnalysis(analysis.result.analysisResult)}
                  <p className="mt-4 text-xs text-muted-foreground">
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
