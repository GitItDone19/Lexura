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
  helpText?: string;
  type: 'radio';
  options: { value: string; label: string; description?: string }[];
}

// Questions for each classification type
const prohibitedQuestions: Question[] = []; // No questions, just warning

const highRiskProviderQuestions: Question[] = [
  {
    id: 'riskManagement',
    label: 'Do you have a documented risk management system for this AI?',
    helpText: 'Article 9 requires a continuous process to identify and analyze risks to health, safety, and fundamental rights throughout the AI lifecycle.',
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
    helpText: 'You must identify foreseeable risks and implement measures to reduce them to an acceptable level.',
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
    helpText: 'Article 10 sets quality criteria for datasets. You must document your data collection, labeling, and filtering processes.',
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
    helpText: 'You must test for possible biases and take steps to address them, especially regarding protected characteristics.',
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
    helpText: 'Article 11 requires detailed docs on system design, logic, and architecture so authorities can verify compliance.',
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
    helpText: 'Article 12 requires High-Risk AI to keep logs for traceability of its functioning throughout its lifetime.',
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
    helpText: 'You must provide instructions of use that are clear, comprehensive, and accessible to deployers.',
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
    helpText: 'Article 14 says humans must be able to understand the AI outputs and intervene or shut it down if something goes wrong.',
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
    helpText: 'Human oversight must include the ability to override or disregard AI outputs and stop the system.',
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
    helpText: 'You must achieve appropriate levels of accuracy and implement measures to protect against cybersecurity threats.',
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
    helpText: 'Article 26(1) states you must use the system according to the instructions of use provided by the provider.',
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
    helpText: 'You must ensure you understand how the system works and what it can and cannot do.',
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
    helpText: 'Article 14 (Human Oversight) - High-risk decisions should not be 100% automated. A human must verify the result.',
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
    helpText: 'Humans must have the ability to override or disregard AI recommendations when appropriate.',
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
    helpText: 'You must ensure that people using the system have appropriate training and competence.',
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
    helpText: 'Article 26(5) requires you to monitor the operation of the high-risk AI system and report any serious incidents.',
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
    helpText: 'You must report serious incidents to the provider and relevant authorities.',
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
    helpText: 'Article 13 & 52. Affected persons have a right to know they are being evaluated or interacted with by an AI.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, clear notice provided' },
      { value: 'policy', label: 'Mentioned in privacy policy' },
      { value: 'no', label: 'No disclosure' },
    ],
  },
];

const limitedRiskQuestions: Question[] = [
  {
    id: 'aiDisclosure',
    label: 'Are users clearly informed they are interacting with AI?',
    helpText: 'Article 50(1). Transparency is the main rule for Limited Risk systems. Users must know they aren\'t talking to a human.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, clear and prominent notice' },
      { value: 'partial', label: 'Mentioned but not prominent' },
      { value: 'no', label: 'No disclosure' },
    ],
  },
  {
    id: 'syntheticLabeling',
    label: 'Is AI-generated content clearly labeled as artificial?',
    helpText: 'Article 50(4). Images, audio, or video created by AI must be marked so they aren\'t mistaken for authentic content.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, clearly labeled' },
      { value: 'sometimes', label: 'Sometimes labeled' },
      { value: 'no', label: 'No labeling' },
      { value: 'na', label: 'N/A — no content generation' },
    ],
  },
  {
    id: 'emotionDisclosure',
    label: 'If using emotion recognition, are people informed?',
    helpText: 'Article 50(2). People must be informed when emotion recognition systems are being used on them.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, clear disclosure' },
      { value: 'no', label: 'No disclosure' },
      { value: 'na', label: 'N/A — no emotion recognition' },
    ],
  },
];

const gpaiProviderQuestions: Question[] = [
  {
    id: 'documentation',
    label: 'Do you maintain technical documentation for the model?',
    helpText: 'GPAI Providers must keep technical documentation for the AI Office to verify training and model benchmarks.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, comprehensive' },
      { value: 'partial', label: 'Partial' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'copyrightPolicy',
    label: 'Do you have a copyright compliance policy for training data?',
    helpText: 'GPAI models must respect EU copyright law during training, even if trained outside the EU.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, formal policy' },
      { value: 'partial', label: 'Informal approach' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'publicSummary',
    label: 'Have you published a summary of training data?',
    helpText: 'You must make publicly available a sufficiently detailed summary of the content used for training.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes, published' },
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

          if (data.step1Data && data.step2Data) {
            const result = classifyAISystem(data.step1Data, data.step2Data);
            setClassification(result.classification);
          } else {
            // If step1 or step2 data is missing, redirect back
            console.error('Missing step data');
            router.push(`/app/assessment/${assessmentId}`);
            return;
          }

          if (data.step3Data) {
            setFormData(data.step3Data);
          }
        } else {
          console.error('Failed to fetch assessment');
          router.push('/app');
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
        router.push('/app');
      } finally {
        setLoading(false);
      }
    };

    fetchAndClassify();
  }, [assessmentId, router]);

  const getQuestions = (): Question[] => {
    switch (classification) {
      case 'HIGH_RISK_PROVIDER':
        return highRiskProviderQuestions;
      case 'HIGH_RISK_DEPLOYER':
        return highRiskDeployerQuestions;
      case 'LIMITED_RISK':
        return limitedRiskQuestions;
      case 'GPAI_PROVIDER':
        return gpaiProviderQuestions;
      case 'GPAI_DEPLOYER':
        return highRiskDeployerQuestions;
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
      // Save step 3 data
      console.log('Step 1: Saving step 3 data...');
      await fetch(`/api/assessments/${assessmentId}/step3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, classification }),
      });

      // Fetch complete assessment data for report generation
      console.log('Step 2: Fetching assessment data...');
      const assessmentResponse = await fetch(`/api/assessments/${assessmentId}`);
      const assessmentData = await assessmentResponse.json();
      console.log('Assessment data:', assessmentData);

      // Generate AI report
      console.log('Step 3: Generating AI report...');
      const reportPayload = {
        assessmentData: {
          step1Data: assessmentData.step1Data,
          step2Data: assessmentData.step2Data,
          step3Data: { ...formData, classification },
          classification,
        },
      };
      console.log('Report payload:', reportPayload);

      const reportResponse = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json();
        console.error('Report generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const { report, summary } = await reportResponse.json();
      console.log('Step 4: Report generated successfully!');
      console.log('Generated summary:', summary);
      console.log('Generated report preview:', report.substring(0, 200) + '...');

      // Update assessment with generated report and mark as completed
      console.log('Step 5: Saving report to database...');
      await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          aiGeneratedReport: report,
        }),
      });

      console.log('Step 6: Redirecting to report page...');
      router.push(`/app/assessment/${assessmentId}/report`);
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Failed to generate report. Please try again. Check console for details.');
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
  
  // Safety check - if currentQuestionData is undefined, show loading
  if (!currentQuestionData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
            
            {/* Question indicators */}
            <div className="flex justify-between gap-1">
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
                <div className="group relative">
                  <div className="flex items-start justify-between gap-4">
                    <Label className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {currentQuestionData.label}
                    </Label>
                    {currentQuestionData.helpText && (
                      <div className="mt-1 flex-shrink-0">
                        <div className="peer p-2 rounded-full bg-zinc-900 border border-zinc-800 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all cursor-help">
                          <AlertTriangleIcon className="w-5 h-5 rotate-180" />
                        </div>

                        {/* The Hover Tooltip */}
                        <div className="absolute left-0 top-full mt-4 w-full z-20 opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-300 transform translate-y-2 peer-hover:translate-y-0">
                          <div className="bg-blue-600 p-4 rounded-xl shadow-2xl text-white text-sm leading-relaxed border border-blue-400/30">
                            <p>{currentQuestionData.helpText}</p>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rotate-45" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                            ? "border-blue-500 bg-blue-500/10"
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
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {completing ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Scan
                          <CheckIcon className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!isCurrentAnswered}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
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
