'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SymptomResult {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  recommendations: string[];
  when_to_seek_help: string;
}

const commonSymptoms = [
  { id: 'fever', label: 'Fever', category: 'general' },
  { id: 'cough', label: 'Cough', category: 'respiratory' },
  { id: 'sore_throat', label: 'Sore Throat', category: 'respiratory' },
  { id: 'headache', label: 'Headache', category: 'general' },
  { id: 'fatigue', label: 'Fatigue/Weakness', category: 'general' },
  { id: 'body_ache', label: 'Body Aches', category: 'general' },
  { id: 'shortness_of_breath', label: 'Shortness of Breath', category: 'respiratory' },
  { id: 'chest_pain', label: 'Chest Pain', category: 'respiratory' },
  { id: 'nausea', label: 'Nausea', category: 'digestive' },
  { id: 'vomiting', label: 'Vomiting', category: 'digestive' },
  { id: 'diarrhea', label: 'Diarrhea', category: 'digestive' },
  { id: 'abdominal_pain', label: 'Abdominal Pain', category: 'digestive' },
  { id: 'rash', label: 'Rash/Skin Irritation', category: 'skin' },
  { id: 'itching', label: 'Itching', category: 'skin' },
  { id: 'chills', label: 'Chills', category: 'general' },
  { id: 'difficulty_concentrating', label: 'Difficulty Concentrating', category: 'general' },
];

const conditionProfiles: Record<string, SymptomResult> = {
  common_cold: {
    condition: 'Common Cold',
    severity: 'mild',
    confidence: 85,
    recommendations: [
      'Rest for 7-10 days',
      'Stay hydrated - drink plenty of water',
      'Use honey or throat lozenges for sore throat',
      'Gargle with salt water',
      'Use saline nasal drops if congested',
    ],
    when_to_seek_help: 'Seek immediate help if fever exceeds 103°F (39.4°C) or symptoms worsen after 10 days',
  },
  flu: {
    condition: 'Influenza (Flu)',
    severity: 'moderate',
    confidence: 78,
    recommendations: [
      'Rest at home for at least 5 days',
      'Drink plenty of fluids',
      'Use fever-reducing medications (paracetamol/ibuprofen)',
      'Consider antiviral medication if within 48 hours of symptom onset',
      'Wear mask when around others',
    ],
    when_to_seek_help: 'Seek immediate medical attention if experiencing difficulty breathing, chest pain, or severe symptoms',
  },
  gastroenteritis: {
    condition: 'Gastroenteritis (Food Poisoning/Stomach Bug)',
    severity: 'moderate',
    confidence: 72,
    recommendations: [
      'Stay hydrated - drink clear fluids slowly',
      'Rest as much as possible',
      'Eat bland foods when ready (BRAT diet: bananas, rice, applesauce, toast)',
      'Avoid dairy, fatty, or spicy foods for 24 hours',
      'Monitor for dehydration symptoms',
    ],
    when_to_seek_help: 'Seek help if symptoms persist beyond 2 days or if experiencing severe dehydration, bloody stools, or high fever',
  },
  allergy: {
    condition: 'Allergic Reaction/Allergies',
    severity: 'mild',
    confidence: 65,
    recommendations: [
      'Identify and avoid known allergens',
      'Take antihistamine medication (like cetirizine or loratadine)',
      'Use saline nasal rinse',
      'Apply cool compress for itching',
      'Keep emergency contact number ready if prone to severe reactions',
    ],
    when_to_seek_help: 'Seek immediate help if experiencing difficulty breathing, swelling of throat/face, or severe anaphylaxis symptoms',
  },
  migraine: {
    condition: 'Migraine/Severe Headache',
    severity: 'moderate',
    confidence: 70,
    recommendations: [
      'Rest in a quiet, dark room',
      'Apply warm or cold compress to affected area',
      'Take pain relievers early (ibuprofen or paracetamol)',
      'Stay hydrated',
      'Try meditation or relaxation techniques',
    ],
    when_to_seek_help: 'Seek medical attention if headache is unusually severe, accompanied by fever/stiff neck, or represents a change in your usual headache pattern',
  },
};

export default function SymptomCheckerClient() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSymptomToggle = (symptomId: string) => {
    const newSelected = new Set(selectedSymptoms);
    if (newSelected.has(symptomId)) {
      newSelected.delete(symptomId);
    } else {
      newSelected.add(symptomId);
    }
    setSelectedSymptoms(newSelected);
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No symptoms selected',
        description: 'Please select at least one symptom to analyze',
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock analysis based on selected symptoms
      const symptomsArray = Array.from(selectedSymptoms);
      let selectedCondition: SymptomResult;

      if (
        symptomsArray.includes('cough') &&
        symptomsArray.includes('sore_throat') &&
        symptomsArray.includes('fever')
      ) {
        selectedCondition = conditionProfiles.flu;
      } else if (
        symptomsArray.includes('nausea') &&
        symptomsArray.includes('vomiting') &&
        symptomsArray.includes('diarrhea')
      ) {
        selectedCondition = conditionProfiles.gastroenteritis;
      } else if (
        symptomsArray.includes('rash') ||
        symptomsArray.includes('itching')
      ) {
        selectedCondition = conditionProfiles.allergy;
      } else if (symptomsArray.includes('headache')) {
        selectedCondition = conditionProfiles.migraine;
      } else {
        selectedCondition = conditionProfiles.common_cold;
      }

      setResult(selectedCondition);
      toast({
        title: 'Analysis Complete',
        description: `Potential condition identified: ${selectedCondition.condition}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to analyze symptoms. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedSymptoms(new Set());
    setResult(null);
  };

  const groupedSymptoms = commonSymptoms.reduce(
    (acc, symptom) => {
      if (!acc[symptom.category]) {
        acc[symptom.category] = [];
      }
      acc[symptom.category].push(symptom);
      return acc;
    },
    {} as Record<string, typeof commonSymptoms>
  );

  const categoryLabels: Record<string, string> = {
    general: 'General Symptoms',
    respiratory: 'Respiratory Symptoms',
    digestive: 'Digestive Symptoms',
    skin: 'Skin Symptoms',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Symptom Checker</h1>
        <p className="text-muted-foreground mt-2">
          Describe your symptoms to get a preliminary assessment. This is not a substitute for professional medical advice.
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Disclaimer</AlertTitle>
        <AlertDescription className="text-blue-800">
          This symptom checker provides general information only and should not be used as a substitute for professional medical diagnosis or treatment. Always consult a healthcare provider for proper evaluation and care.
        </AlertDescription>
      </Alert>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Symptoms</CardTitle>
            <CardDescription>
              Check all symptoms you are experiencing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedSymptoms).map(([category, symptoms]) => (
              <div key={category}>
                <h3 className="font-semibold mb-3 text-sm">
                  {categoryLabels[category]}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {symptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom.id}
                        checked={selectedSymptoms.has(symptom.id)}
                        onCheckedChange={() => handleSymptomToggle(symptom.id)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={symptom.id}
                        className="font-normal cursor-pointer"
                      >
                        {symptom.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={analyzeSymptoms}
                disabled={selectedSymptoms.size === 0 || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Symptoms'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className={
            result.severity === 'severe'
              ? 'border-red-200 bg-red-50'
              : result.severity === 'moderate'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-green-200 bg-green-50'
          }>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {result.severity === 'severe' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : result.severity === 'moderate' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {result.condition}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Severity: {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">
                  Confidence Level
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={result.confidence} className="flex-1" />
                  <span className="text-sm font-medium">
                    {result.confidence}%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-accent font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Alert className="border-red-300 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900">When to Seek Medical Help</AlertTitle>
                <AlertDescription className="text-red-800">
                  {result.when_to_seek_help}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={resetAnalysis} variant="outline">
                  Check Another Symptom
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Based on this assessment, you might want to:
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/chat">
                    Ask Our AI Chatbot for More Information
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/hospitals">
                    Find Nearby Hospitals and Clinics
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
