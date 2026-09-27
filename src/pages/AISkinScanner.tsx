import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Scan,
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/api";

interface DiseaseInfo {
  disease: string;
  description: string;
  treatments: string;
  precautions: string;
  references: string;
  last_updated: string;
}

interface PredictionResponse {
  prediction?: string;
  info?: DiseaseInfo;
  disclaimer?: string;
  error?: string;
}

const AISkinScanner = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<DiseaseInfo | null>(null);

  const navigate = useNavigate();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        sendToBackend(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendToBackend = async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData
      });
      const data: PredictionResponse = await response.json();

      if (data.error) {
        alert(data.error);
      } else if (data.prediction) {
        setPrediction(data.prediction);
        if (data.info) {
          setResultInfo(data.info);
        } else {
          setResultInfo(null);
        }
        setHasResults(true);
      } else {
        alert("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      alert("Backend server error. Make sure the Flask app is running and reachable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setHasResults(false);
    setUploadedImage(null);
    setPrediction(null);
    setResultInfo(null);
  };

  return (
    <section id="ai-scanner" className="min-h-screen py-16 bg-gradient-hero">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center">
            AI <span className="bg-gradient-medical bg-clip-text text-transparent">Skin Scanner</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a skin image for instant AI analysis of skin conditions
          </p>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card className="border border-medical-border bg-gradient-card backdrop-blur-md hover:border-primary/40 transition-colors shadow-card-medical">
            <CardContent className="p-8">
              {!uploadedImage ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-medical">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload Skin Image</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Take a clear, well-lit photo of the skin area you'd like analyzed
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="image-upload">
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-medical text-white font-medium rounded-md cursor-pointer shadow-medical hover:shadow-hover-medical transition-all">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="text-center text-xs text-muted-foreground mt-2">
                      Supported: JPG, PNG • Max size: 10MB
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded skin"
                    className="w-full max-w-sm mx-auto rounded-lg shadow-card"
                  />
                  {isAnalyzing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Scan className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-sm font-medium">Analyzing image...</span>
                      </div>
                      <Progress value={65} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        AI is examining skin patterns and characteristics
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Area */}
          <Card className="border border-medical-border bg-gradient-card backdrop-blur-md shadow-card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 bg-emerald-500/10 rounded-full p-0.5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasResults && prediction ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{prediction}</h3>
                    <Badge variant="secondary" className="border-primary/30 text-primary">Prediction</Badge>
                  </div>

                  {resultInfo && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Description</h4>
                      <p className="text-muted-foreground">{resultInfo.description}</p>

                      <h4 className="font-semibold text-primary">Suggested Treatments</h4>
                      <p className="text-muted-foreground">{resultInfo.treatments}</p>

                      <h4 className="font-semibold text-primary">Precautions & Home-care</h4>
                      <p className="text-muted-foreground">{resultInfo.precautions}</p>

                      <h4 className="font-semibold text-primary">References</h4>
                      <p className="text-muted-foreground">{resultInfo.references}</p>

                      <p className="text-xs text-muted-foreground">Last updated: {resultInfo.last_updated}</p>
                    </div>
                  )}

                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-300">Important Notice</p>
                        <p className="text-amber-200/80">
                          This analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetScanner}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-primary/40 text-primary font-medium rounded-md hover:bg-primary/10 transition-all shadow-sm"
                    >
                      New Scan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Scan className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to see detailed AI analysis results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AISkinScanner;
