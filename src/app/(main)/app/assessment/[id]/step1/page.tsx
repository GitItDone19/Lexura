"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRightIcon, ArrowLeftIcon, Loader2Icon, CheckIcon, AlertTriangleIcon } from 'lucide-react';
import { Container } from '@/components';
import { cn } from '@/functions';

interface Question {
  id: keyof FormData;
  label: string;
  helpText?: string; // The "trick" explanation
  placeholder?: string;
  type: 'input' | 'textarea' | 'multi-select' | 'radio';
  rows?: number;
  required: boolean;
  minLength?: number;
  options?: { value: string; label: string; description?: string }[];
  conditionalField?: {
    showWhen: string[];
    field: {
      id: string;
      label: string;
      placeholder: string;
    };
  };
}

interface FormData {
  systemName: string;
  description: string;
  euScope: string;
  technologyType: string[];
  gpaiCheck: string;
  ownership: string;
  vendorName: string;
}

const questions: Question[] = [
  {
    id: 'systemName',
    label: 'What is the name of your AI system?',
    helpText: 'This is just for your internal tracking. You can use the project name or the name of the tool (e.g., "HR Screen Pro 2024").',
    placeholder: 'Enter system name (optional)',
    type: 'input',
    required: false,
  },
  {
    id: 'description',
    label: 'What does this AI system do?',
    helpText: 'The EU AI Act classifies systems based on their "intended purpose." Describe exactly what decisions the AI makes or helps a human make.',
    placeholder: 'Describe its purpose, what decisions it makes or supports, and how it works.',
    type: 'textarea',
    rows: 5,
    required: true,
    minLength: 20,
  },
  {
    id: 'euScope',
    label: 'Does this AI affect people in the EU?',
    helpText: 'The EU AI Act applies if your AI is used in the EU or affects people in the EU, regardless of where your company is based.',
    type: 'radio',
    required: true,
    options: [
      { 
        value: 'yes', 
        label: 'Yes, it affects people in the EU',
        description: 'Used in EU or impacts EU residents'
      },
      { 
        value: 'no', 
        label: 'No, it does not affect people in the EU',
        description: 'No EU users or impact'
      },
      { 
        value: 'not_sure', 
        label: 'Not sure',
        description: 'Need to investigate further'
      },
    ],
  },
  {
    id: 'technologyType',
    label: 'What AI technology does it use?',
    helpText: 'Different technologies (like Biometrics) have extra rules under Articles 26 and 52. Select all that are core to your tool.',
    type: 'multi-select',
    required: true,
    options: [
      { value: 'ml', label: 'Machine learning / Predictive models' },
      { value: 'llm', label: 'Large language model (GPT, Claude, Llama, etc.)' },
      { value: 'vision', label: 'Computer vision / Image recognition' },
      { value: 'speech', label: 'Speech or voice recognition' },
      { value: 'biometric', label: 'Biometric identification (face, fingerprint, etc.)' },
      { value: 'recommendation', label: 'Recommendation system' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'gpaiCheck',
    label: 'Is this a general-purpose AI model?',
    helpText: 'A "General Purpose AI" (GPAI) is a model that can do many different things (like GPT-4). Purpose-built AI is designed for only one specific task.',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'develop',
        label: 'Yes, we develop/train a foundation model',
        description: 'Like GPT, Llama, Stable Diffusion'
      },
      {
        value: 'integrate',
        label: 'Yes, we integrate a foundation model into our product',
        description: 'Using existing foundation models'
      },
      {
        value: 'no',
        label: 'No, it\'s purpose-built for specific tasks',
        description: 'Custom-built for specific use cases'
      },
    ],
  },
  {
    id: 'ownership',
    label: 'How did you obtain this AI?',
    helpText: 'This determines if you are a "Provider" (you built it) or a "Deployer" (you use someone else\'s tool). Each has different legal responsibilities.',
    type: 'radio',
    required: true,
    options: [
      { value: 'inhouse', label: 'Built/developed in-house' },
      { value: 'vendor', label: 'Purchased or licensed from a vendor' },
      { value: 'api', label: 'Third-party API or cloud service' },
      { value: 'combination', label: 'Combination (customized a vendor system)' },
    ],
    conditionalField: {
      showWhen: ['vendor', 'api', 'combination'],
      field: {
        id: 'vendorName',
        label: 'Vendor name (if applicable)',
        placeholder: 'Enter vendor name',
      },
    },
  },
];

export default function Step1Page() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState<FormData>({
    systemName: '',
    description: '',
    euScope: '',
    technologyType: [],
    gpaiCheck: '',
    ownership: '',
    vendorName: '',
  });

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.step1Data) {
            setFormData(data.step1Data);
          }
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

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

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // If EU scope is "no", skip to report
        if (formData.euScope === 'no') {
          // Mark assessment as completed and generate minimal risk report
          await fetch(`/api/assessments/${assessmentId}/step3`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skipToMinimalRisk: true }),
          });
          router.push(`/app/assessment/${assessmentId}/report`);
        } else {
          router.push(`/app/assessment/${assessmentId}/step2`);
        }
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving step 1:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  // Handle different value types
  const currentValue = formData[currentQuestionData.id];
  const isCurrentAnswered = currentQuestionData.type === 'multi-select'
    ? Array.isArray(currentValue) && currentValue.length > 0
    : currentQuestionData.required
      ? (typeof currentValue === 'string' && currentValue.trim().length >= (currentQuestionData.minLength || 1))
      : true; // Optional fields are always "answered"

  // Check if conditional field should be shown
  const showConditionalField = currentQuestionData.conditionalField &&
    currentQuestionData.conditionalField.showWhen.includes(currentValue as string);

  // Check if conditional field is filled when required
  const isConditionalFieldAnswered = !showConditionalField ||
    (formData.vendorName && formData.vendorName.trim().length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <Container>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-zinc-400">
                Step 1: Describe Your AI System
              </div>
              <div className="text-sm text-zinc-400">
                {currentQuestion + 1} of {questions.length}
              </div>
            </div>
            <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question indicators */}
            <div className="flex justify-between mt-4">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                    index < currentQuestion
                      ? "bg-blue-500 text-white"
                      : index === currentQuestion
                        ? "bg-blue-500/20 text-blue-400 ring-2 ring-blue-500"
                        : "bg-zinc-900 text-zinc-600"
                  )}
                >
                  {index < currentQuestion ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
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

                        {/* The Hover "Trick" - Tooltip */}
                        <div className="absolute left-0 top-full mt-4 w-full z-20 opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-300 transform translate-y-2 peer-hover:translate-y-0">
                          <div className="bg-blue-600 p-4 rounded-xl shadow-2xl shadow-blue-500/20 text-white text-sm leading-relaxed border border-blue-400/30">
                            <div className="flex items-start gap-3">
                              <div className="bg-white/20 p-1 rounded mt-0.5">
                                <CheckIcon className="w-3 h-3 text-white" />
                              </div>
                              <p>{currentQuestionData.helpText}</p>
                            </div>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rotate-45 border-l border-t border-blue-400/30" />
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
                <div className="pt-4 space-y-4">
                  {currentQuestionData.type === 'multi-select' ? (
                    <div className="space-y-3">
                      {currentQuestionData.options?.map((option) => {
                        const isChecked = Array.isArray(currentValue) && currentValue.includes(option.value);
                        return (
                          <div
                            key={option.value}
                            className={cn(
                              "flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                              isChecked
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                            )}
                            onClick={() => {
                              const current = Array.isArray(currentValue) ? currentValue : [];
                              const updated = isChecked
                                ? current.filter((v) => v !== option.value)
                                : [...current, option.value];
                              setFormData({ ...formData, [currentQuestionData.id]: updated });
                            }}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              isChecked ? "border-blue-500 bg-blue-500" : "border-zinc-700"
                            )}>
                              {isChecked && (
                                <CheckIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Label className="text-base font-medium text-white cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : currentQuestionData.type === 'radio' ? (
                    <RadioGroup
                      value={currentValue as string}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, [currentQuestionData.id]: value })
                      }
                      className="space-y-3"
                    >
                      {currentQuestionData.options?.map((option) => (
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
                  ) : currentQuestionData.type === 'input' ? (
                    <Input
                      value={currentValue as string}
                      onChange={(e) =>
                        setFormData({ ...formData, [currentQuestionData.id]: e.target.value })
                      }
                      placeholder={currentQuestionData.placeholder}
                      className="text-lg h-14 bg-zinc-900 border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-600"
                      autoFocus
                    />
                  ) : (
                    <Textarea
                      value={currentValue as string}
                      onChange={(e) =>
                        setFormData({ ...formData, [currentQuestionData.id]: e.target.value })
                      }
                      placeholder={currentQuestionData.placeholder}
                      rows={currentQuestionData.rows}
                      className="text-lg bg-zinc-900 border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-600 resize-none"
                      autoFocus
                    />
                  )}

                  {/* Conditional Field */}
                  {showConditionalField && currentQuestionData.conditionalField && (
                    <div className="pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <Label className="text-sm font-medium text-zinc-400 mb-2 block">
                        {currentQuestionData.conditionalField.field.label}
                      </Label>
                      <Input
                        value={formData.vendorName}
                        onChange={(e) =>
                          setFormData({ ...formData, vendorName: e.target.value })
                        }
                        placeholder={currentQuestionData.conditionalField.field.placeholder}
                        className="text-base h-12 bg-zinc-900 border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-600"
                      />
                    </div>
                  )}

                  {/* Validation hint */}
                  {currentQuestionData.minLength && currentQuestionData.type === 'textarea' && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Minimum {currentQuestionData.minLength} characters required
                      {typeof currentValue === 'string' && currentValue.length > 0 && (
                        <span className={cn(
                          "ml-2",
                          currentValue.length >= currentQuestionData.minLength ? "text-green-500" : "text-yellow-500"
                        )}>
                          ({currentValue.length}/{currentQuestionData.minLength})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={isFirstQuestion ? () => router.push('/app') : handlePrevious}
                    className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    {isFirstQuestion ? 'Cancel' : 'Previous'}
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!isCurrentAnswered || !isConditionalFieldAnswered || saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Complete Step 1
                          <CheckIcon className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!isCurrentAnswered || !isConditionalFieldAnswered}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      Next
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>

        {/* Helper Text */}
        <Container delay={0.2}>
          <div className="mt-4 text-center text-sm text-zinc-500">
            Press <kbd className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800">Enter</kbd> to continue
          </div>
        </Container>
      </div>
    </div>
  );
}
