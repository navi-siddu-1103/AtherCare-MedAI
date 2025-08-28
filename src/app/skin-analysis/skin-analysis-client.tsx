
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Bot, Camera, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { analyzeSkinCondition } from '@/ai/flows/analyze-skin-condition';
import type { AnalyzeSkinConditionOutput } from '@/ai/flows/analyze-skin-condition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const getCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (activeTab === 'camera') {
      getCameraPermission();
    } else {
      // Stop camera stream when switching away
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setHasCameraPermission(null);
      }
    }
  }, [activeTab, getCameraPermission]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysis({ loading: false, error: null, result: null });
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUrl);
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const capturedFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            setFile(capturedFile);
          });
      }
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis({ loading: false, error: null, result: null });
    if (activeTab === 'camera') {
      getCameraPermission();
    }
  };

  const handleAnalysis = async () => {
    const source = file || previewUrl;
    if (!source) {
      toast({
        variant: 'destructive',
        title: 'No image selected',
        description: 'Please upload or capture an image to analyze.',
      });
      return;
    }
  
    setAnalysis({ loading: true, error: null, result: null });
  
    const processAndAnalyze = async (data: string | File) => {
      let photoDataUri: string;
      if (typeof data === 'string') {
        photoDataUri = data;
      } else {
        photoDataUri = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }
  
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
  
    await processAndAnalyze(source);
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
          <CardTitle>Provide Skin Image</CardTitle>
          <CardDescription>
            Upload a file or use your camera. Choose a clear, well-lit image of the affected area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" /> Upload
              </TabsTrigger>
              <TabsTrigger value="camera">
                <Camera className="mr-2 h-4 w-4" /> Camera
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6">
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
                    disabled={analysis.loading}
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
            </TabsContent>
            <TabsContent value="camera" className="mt-6">
              {!previewUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                        <Camera className="h-12 w-12" />
                        <p className="mt-2 text-center">Camera access denied or not available.</p>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCapture} disabled={!hasCameraPermission || analysis.loading} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Image
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={previewUrl}
                    alt="Captured skin"
                    width={500}
                    height={300}
                    className="w-full rounded-lg object-cover"
                  />
                   <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                    onClick={resetState}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button onClick={handleAnalysis} disabled={!previewUrl || analysis.loading} className="w-full">
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
