"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeftIcon, Loader2Icon, CheckIcon, AlertTriangleIcon, ShieldAlertIcon } from 'lucide-react';
import { Container } from '@/components';
import { cn } from '@/functions';
import { classifyAISystem, ClassificationType } from '@/lib/classification-logic';

interface Question {
  id: string;
  label: string;
  type: 'radio';
  options: { value: string; label: string; description?: string }[];
}

// Questions for each classification type
const prohibitedQuestions: Question[] = []; // No questions, just warning

const highRiskProviderQuestions: Question[] = [
  {
    id: 'riskManagement',
    label: 'Do you have a documented risk management system for this AI?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, established and continuously maintained' },
      { value: 'partial', label: 'Partial — some documentation exists' },
      { value: 'no', label: 'No formal risk management' },
    ],
  },
  {
    id: 'riskMitigation',
    label: 'Have you identified and documented risks to health, safety, and fundamental rights, with mitigation measures?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, with documented mitigations' },
      { value: 'identified', label: 'Identified but not fully mitigated' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'dataDocumentation',
    label: 'Is your training, validation, and testing data formally documented?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, with data sheets and quality records' },
      { value: 'partial', label: 'Partial documentation' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'biasTest',
    label: 'Have you examined training data for biases and taken corrective measures?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, formal bias testing with corrections' },
      { value: 'informal', label: 'Informal review only' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'technicalDocs',
    label: 'Do you maintain technical documentation covering design, development, capabilities, limitations, and intended purpose?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, comprehensive and up-to-date' },
      { value: 'partial', label: 'Partial documentation' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'logging',
    label: 'Does the system automatically log operations to enable traceability and issue identification?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, comprehensive automatic logging' },
      { value: 'partial', label: 'Partial logging' },
      { value: 'no', label: 'No logging' },
    ],
  },
  {
    id: 'instructions',
    label: 'Have you created clear instructions for deployers covering proper use, capabilities, and limitations?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, detailed instructions provided' },
      { value: 'basic', label: 'Basic information only' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'oversightDesign',
    label: 'Is the system designed to enable effective human oversight, including ability to understand outputs and intervene?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, oversight tools built-in' },
      { value: 'partial', label: 'Partially' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'overrideCapability',
    label: 'Can humans override decisions and stop the system when needed?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, easily accessible controls' },
      { value: 'difficult', label: 'Possible but difficult' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'accuracySecurity',
    label: 'Have you tested and documented accuracy levels, and implemented cybersecurity measures against manipulation?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, tested with security measures in place' },
      { value: 'partial', label: 'Partial testing or measures' },
      { value: 'no', label: 'No' },
    ],
  },
];

const highRiskDeployerQuestions: Question[] = [
  {
    id: 'providerInstructions',
    label: 'Did the provider give you instructions for use?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, comprehensive documentation' },
      { value: 'limited', label: 'Limited documentation' },
      { value: 'no', label: 'No documentation received' },
    ],
  },
  {
    id: 'understanding',
    label: 'Do you understand the system\'s intended purpose, capabilities, and limitations?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, fully understand' },
      { value: 'partial', label: 'Partially' },
      { value: 'no', label: 'No, unclear' },
    ],
  },
  {
    id: 'humanReview',
    label: 'Is there human review of AI outputs before final decisions are made?',
    type: 'radio',
    options: [
      { value: 'always', label: 'Always — human makes final decision' },
      { value: 'usually', label: 'Usually — some exceptions' },
      { value: 'rarely', label: 'Rarely or never — mostly automated' },
    ],
  },
  {
    id: 'overrideCapability',
    label: 'Can staff override or disregard the AI\'s output when needed?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, easily' },
      { value: 'approval', label: 'Yes, but requires approval' },
      { value: 'no', label: 'No real override capability' },
    ],
  },
  {
    id: 'training',
    label: 'Are personnel using this AI trained on how it works?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, formal training provided' },
      { value: 'informal', label: 'Informal guidance only' },
      { value: 'no', label: 'No training' },
    ],
  },
  {
    id: 'monitoring',
    label: 'Do you ensure input data quality and monitor the system for issues or unexpected behavior?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, formal data checks and ongoing monitoring' },
      { value: 'some', label: 'Some informal checks' },
      { value: 'no', label: 'No processes in place' },
    ],
  },
  {
    id: 'incidentReporting',
    label: 'Do you have a process to report serious incidents or malfunctions to the provider?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, defined escalation process' },
      { value: 'adhoc', label: 'Would figure it out if needed' },
      { value: 'no', label: 'No process' },
    ],
  },
  {
    id: 'transparency',
    label: 'Are affected persons (e.g., job applicants, customers) informed that AI is being used in decisions about them?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, clear and prominent notice' },
      { value: 'policy', label: 'Mentioned in privacy policy or terms' },
      { value: 'no', label: 'No disclosure' },
    ],
  },
  {
    id: 'rightsAssessment',
    label: 'Have you assessed this AI\'s potential impact on fundamental rights (discrimination, privacy, fairness)?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, documented assessment' },
      { value: 'informal', label: 'Informal consideration' },
      { value: 'no', label: 'No' },
    ],
  },
];

const limitedRiskQuestions: Question[] = [
  {
    id: 'aiDisclosure',
    label: 'If users interact directly with this AI (e.g., chatbot), are they informed they are interacting with AI?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, clear notice provided' },
      { value: 'mentioned', label: 'Mentioned but not prominent' },
      { value: 'no', label: 'No disclosure' },
      { value: 'na', label: 'N/A — no direct user interaction' },
    ],
  },
  {
    id: 'emotionDisclosure',
    label: 'If this AI recognizes emotions or uses biometric categorization, are subjects informed?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, informed before exposure' },
      { value: 'policy', label: 'Mentioned in terms/policy' },
      { value: 'no', label: 'No' },
      { value: 'na', label: 'N/A — no emotion/biometric features' },
    ],
  },
  {
    id: 'syntheticLabeling',
    label: 'If this AI generates synthetic content (images, video, audio, text), is the output labeled as AI-generated?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, clearly labeled' },
      { value: 'sometimes', label: 'Sometimes labeled' },
      { value: 'no', label: 'No labeling' },
      { value: 'na', label: 'N/A — no synthetic content generation' },
    ],
  },
];

const gpaiProviderQuestions: Question[] = [
  {
    id: 'compute',
    label: 'What compute was used to train this model?',
    type: 'radio',
    options: [
      { value: 'less', label: 'Less than 10^25 FLOPS' },
      { value: 'more', label: '10^25 FLOPS or more' },
      { value: 'unknown', label: 'Unknown' },
    ],
  },
  {
    id: 'documentation',
    label: 'Do you have technical documentation including model capabilities, limitations, and training methodology?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, comprehensive' },
      { value: 'partial', label: 'Partial' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'trainingSummary',
    label: 'Can you provide a sufficiently detailed summary of training data content if requested by authorities?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'partial', label: 'Partially' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'copyrightPolicy',
    label: 'Do you have a policy on copyright compliance for training data?',
    type: 'radio',
    options: [
      { value: 'public', label: 'Yes, publicly available' },
      { value: 'internal', label: 'Yes, internal only' },
      { value: 'no', label: 'No' },
    ],
  },
];

export default function Step3Page() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [classification, setClassification] = useState<ClassificationType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAndClassify = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Classify based on step1 and step2 data
          if (data.step1Data && data.step2Data) {
            const result = classifyAISystem(data.step1Data, data.step2Data);
            setClassification(result.classification);
          }
          
          if (data.step3Data) {
            setFormData(data.step3Data);
          }
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndClassify();
  }, [assessmentId]);

  const getQuestions = (): Question[] => {
    switch (classification) {
      case 'PROHIBITED':
        return prohibitedQuestions;
      case 'HIGH_RISK_PROVIDER':
        return highRiskProviderQuestions;
      case 'HIGH_RISK_DEPLOYER':
        return highRiskDeployerQuestions;
      case 'LIMITED_RISK':
        return limitedRiskQuestions;
      case 'GPAI_PROVIDER':
        return gpaiProviderQuestions;
      case 'MINIMAL_RISK':
        return [];
      default:
        return [];
    }
  };

  const questions = getQuestions();
  const isProhibited = classification === 'PROHIBITED';
  const isMinimal = classification === 'MINIMAL_RISK';

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection('forward');
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection('backward');
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);

    try {
      // Save step3 data
      await fetch(`/api/assessments/${assessmentId}/step3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, classification }),
      });

      // Mark as completed
      await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'COMPLETED',
          completedAt: new Date().toISOString()
        }),
      });

      router.push(`/app/assessment/${assessmentId}/report`);
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // PROHIBITED Screen
  if (isProhibited) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Container>
          <Card className="bg-zinc-950 border-red-900 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-4">
                <ShieldAlertIcon className="w-10 h-10 text-red-400" />
              </div>
              
              <h2 className="text-3xl font-black text-red-400">
                ⛔ PROHIBITED AI PRACTICE
              </h2>
              
              <div className="space-y-4 text-left bg-red-500/5 p-6 rounded-lg border border-red-900">
                <p className="text-white">
                  Based on your answers, this AI involves practices <strong>PROHIBITED</strong> under EU AI Act Article 5.
                </p>
                <p className="text-zinc-400 text-sm">
                  <strong>Effective:</strong> February 2, 2025<br />
                  <strong>Penalty:</strong> Up to €35 million or 7% of global turnover
                </p>
              </div>

              <div className="text-left space-y-3">
                <h3 className="text-lg font-semibold text-white">Recommended actions:</h3>
                <ul className="text-zinc-400 space-y-2 text-sm">
                  <li>• Consult legal counsel immediately</li>
                  <li>• Discontinue or fundamentally redesign this system</li>
                  <li>• Document compliance review process</li>
                </ul>
              </div>

              <p className="text-xs text-zinc-500 pt-4">
                ⚖️ This is guidance, not legal advice.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/app')}
                  className="flex-1 border-zinc-800"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/app/assessment/new')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Start New Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  // MINIMAL RISK Screen
  if (isMinimal) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Container>
          <Card className="bg-zinc-950 border-zinc-800 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                <CheckIcon className="w-10 h-10 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-black text-green-400">
                ✅ MINIMAL RISK AI SYSTEM
              </h2>
              
              <p className="text-zinc-400">
                Your AI system falls under minimal risk.<br />
                There are no mandatory requirements.
              </p>

              <div className="text-left bg-green-500/5 p-6 rounded-lg border border-green-900">
                <p className="text-white text-sm">
                  We recommend following voluntary codes of conduct for trustworthy AI.
                </p>
              </div>

              <Button
                onClick={handleComplete}
                disabled={completing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {completing ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    Continue to Report
                    <CheckIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  // Multi-step form for other classifications
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-400">Loading classification...</p>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const currentValue = formData[currentQuestionData.id] || '';
  const isCurrentAnswered = currentValue.trim().length > 0;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <Container>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-zinc-400">
                Step 3: {classification?.replace(/_/g, ' ')}
              </div>
              <div className="text-sm text-zinc-400">
                {currentQuestion + 1} of {questions.length}
              </div>
            </div>
            <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Question indicators */}
            <div className="flex justify-between mt-4 gap-1">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all duration-300",
                    index < currentQuestion
                      ? "bg-green-500"
                      : index === currentQuestion
                      ? "bg-green-500/50"
                      : "bg-zinc-900"
                  )}
                />
              ))}
            </div>
          </div>
        </Container>

        {/* Question Card */}
        <Container delay={0.1}>
          <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div
                key={currentQuestion}
                className={cn(
                  "space-y-6 animate-in fade-in duration-500",
                  direction === 'forward' ? "slide-in-from-right-8" : "slide-in-from-left-8"
                )}
              >
                {/* Question Label */}
                <div>
                  <Label className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {currentQuestionData.label}
                  </Label>
                  <p className="text-sm text-zinc-500 mt-2">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>

                {/* Input Field */}
                <div className="pt-4">
                  <RadioGroup
                    value={currentValue}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, [currentQuestionData.id]: value })
                    }
                    className="space-y-3"
                  >
                    {currentQuestionData.options.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                          currentValue === option.value
                            ? "border-green-500 bg-green-500/10"
                            : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                        )}
                        onClick={() => setFormData({ ...formData, [currentQuestionData.id]: option.value })}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="flex-1">
                          <Label
                            htmlFor={option.value}
                            className="text-base font-semibold text-white cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          {option.description && (
                            <p className="text-sm text-zinc-500 mt-1">{option.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={isFirstQuestion ? () => router.push(`/app/assessment/${assessmentId}/step2`) : handlePrevious}
                    className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    {isFirstQuestion ? 'Back to Step 2' : 'Previous'}
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      onClick={handleComplete}
                      disabled={!isCurrentAnswered || completing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {completing ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Assessment
                          <CheckIcon className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!isCurrentAnswered}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      Next
                      <CheckIcon className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    </div>
  );
}
