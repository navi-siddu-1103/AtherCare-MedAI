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
      const response = await fetch("http://127.0.0.1:8000/predict", {
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
    <section id="ai-scanner" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center">
            AI <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Skin Scanner</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a skin image for instant AI analysis of skin conditions
          </p>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              {!uploadedImage ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Scan className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload Skin Image</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Take a clear, well-lit photo of the skin area you'd like analyzed
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="image-upload">
                      <span className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700">
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
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 bg-green-100 rounded-full p-1" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasResults && prediction ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{prediction}</h3>
                    <Badge variant="secondary">Prediction</Badge>
                  </div>

                  {resultInfo && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Description</h4>
                      <p>{resultInfo.description}</p>

                      <h4 className="font-semibold">Suggested Treatments</h4>
                      <p>{resultInfo.treatments}</p>

                      <h4 className="font-semibold">Precautions & Home-care</h4>
                      <p>{resultInfo.precautions}</p>

                      <h4 className="font-semibold">References</h4>
                      <p>{resultInfo.references}</p>

                      <p className="text-xs text-muted">Last updated: {resultInfo.last_updated}</p>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">Important Notice</p>
                        <p className="text-yellow-700">
                          This analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetScanner}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
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
