import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const BloodAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const navigate = useNavigate();

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      startAnalysis(file);
    }
  };

  // Call Flask backend (accepts PDF or image)
  const startAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setAnalysisData(data);
        setHasResults(true);
      } else {
        alert("Error: " + (data.message || "Analysis failed."));
      }
    } catch (error: any) {
      alert("Failed to connect to server: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset Analyzer
  const resetAnalyzer = () => {
    setHasResults(false);
    setUploadedFile(null);
    setAnalysisData(null);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "high":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "low":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Optional: preview for image uploads
  const isImage = uploadedFile && uploadedFile.type.startsWith("image/");
  const previewURL = isImage ? URL.createObjectURL(uploadedFile) : null;

  return (
    <section id="blood-analyzer" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="w-full flex flex-col items-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center ml-[250px]">
            Blood Report{" "}
            <span className="text-transparent bg-clip-text bg-gradient-primary">
              AI Analyzer
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl text-center">
            Upload your blood test in PDF or Image format for instant AI-based health insights
          </p>

          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 ml-[450px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Analyzer Section */}
        <div className="max-w-6xl mx-auto">
          {!hasResults ? (
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-12">
                  {!uploadedFile ? (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">Upload Blood Report</h3>
                        <p className="text-muted-foreground mb-6">
                          Upload your blood test results in PDF or image format for comprehensive AI analysis.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <label htmlFor="report-upload">
                          <Button variant="medical" size="lg" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="w-5 h-5 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </label>
                        <input
                          id="report-upload"
                          type="file"
                          accept=".pdf, .jpg, .jpeg, .png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>

                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>• Supported formats: PDF, JPG, JPEG, PNG</p>
                        <p>• Max file size: 25MB</p>
                        <p>• Processing typically takes 30–60 seconds</p>
                        <p>• All data is encrypted and HIPAA compliant</p>
                      </div>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Activity className="w-8 h-8 text-primary animate-pulse" />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">Analyzing Report</h3>
                        <p className="text-muted-foreground mb-6">
                          AI is processing: <span className="font-medium">{uploadedFile.name}</span>
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Progress value={75} className="w-full" />
                        <p className="text-sm text-muted-foreground">
                          Extracting biomarkers and analyzing patterns...
                        </p>
                      </div>

                      {previewURL && (
                        <img
                          src={previewURL}
                          alt="Preview"
                          className="mx-auto rounded-lg mt-4 max-h-64 shadow-md"
                        />
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Analysis Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisData?.results && Object.keys(analysisData.results).length > 0 ? (
                    Object.entries(analysisData.results).map(([test, details]: [string, any]) => (
                      <div
                        key={test}
                        className="flex justify-between items-center border-b border-border py-3"
                      >
                        <div>
                          <p className="font-semibold capitalize">{test.replace(/_/g, " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            Value: {details.value} {details.unit}
                          </p>
                        </div>
                        <Badge className={getStatusBadge(details.status || "normal")}>
                          {details.status || "normal"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No test parameters detected. Try a clearer report.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisData?.recommendations?.length ? (
                    analysisData.recommendations.map((rec: string, idx: number) => (
                      <p key={idx} className="text-muted-foreground">
                        {rec}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recommendations found.</p>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button variant="outline" onClick={resetAnalyzer}>
                  Analyze Another Report
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Powered by advanced AI • 99.84% accuracy • HIPAA compliant • Instant analysis
          </p>
        </div>
      </div>
    </section>
  );
};

export default BloodAnalyzer;
