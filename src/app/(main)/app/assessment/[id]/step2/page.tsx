"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRightIcon, ArrowLeftIcon, Loader2Icon, CheckIcon } from 'lucide-react';
import { Container } from '@/components';
import { cn } from '@/functions';

interface Question {
  id: keyof FormData;
  label: string;
  placeholder?: string;
  type: 'input' | 'textarea' | 'multi-select' | 'radio' | 'dual-radio';
  rows?: number;
  required: boolean;
  options?: { value: string; label: string; description?: string }[];
  subQuestion?: {
    id: string;
    label: string;
    options: { value: string; label: string; description?: string }[];
  };
}

interface FormData {
  sector: string;
  decisionImpact: string[];
  affectedPersons: string[];
  euScope: string;
  productType: string;
  biometricProcessing: string;
  sensitiveCaps: string[];
}

const questions: Question[] = [
  {
    id: 'sector',
    label: 'What sector does this AI primarily operate in?',
    type: 'radio',
    required: true,
    options: [
      { value: 'employment', label: 'Employment / Human Resources' },
      { value: 'education', label: 'Education / Academic' },
      { value: 'healthcare', label: 'Healthcare / Medical' },
      { value: 'financial', label: 'Financial services / Banking / Insurance' },
      { value: 'law_enforcement', label: 'Law enforcement / Security' },
      { value: 'legal', label: 'Legal / Justice system' },
      { value: 'immigration', label: 'Immigration / Border control' },
      { value: 'government', label: 'Government / Public services' },
      { value: 'infrastructure', label: 'Critical infrastructure (energy, water, transport)' },
      { value: 'retail', label: 'Retail / E-commerce' },
      { value: 'marketing', label: 'Marketing / Advertising' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'decisionImpact',
    label: 'What does this AI decide, recommend, or influence? (Select all that apply)',
    type: 'multi-select',
    required: true,
    options: [
      { value: 'hiring', label: 'Hiring, recruitment, or CV screening' },
      { value: 'employee_eval', label: 'Employee evaluation, monitoring, or termination' },
      { value: 'admissions', label: 'School/university admissions' },
      { value: 'grading', label: 'Student grading or assessment' },
      { value: 'credit', label: 'Credit, loan, or mortgage decisions' },
      { value: 'insurance', label: 'Insurance pricing or claims' },
      { value: 'medical', label: 'Medical diagnosis or treatment' },
      { value: 'criminal_risk', label: 'Criminal risk or recidivism assessment' },
      { value: 'visa', label: 'Visa, asylum, or border decisions' },
      { value: 'benefits', label: 'Access to public benefits' },
      { value: 'identity', label: 'Identity verification' },
      { value: 'content', label: 'Content personalization or recommendations' },
      { value: 'none', label: 'None of these (informational/assistive only)' },
    ],
  },
  {
    id: 'affectedPersons',
    label: 'Who is affected by this AI\'s outputs? (Select all that apply)',
    type: 'multi-select',
    required: true,
    options: [
      { value: 'applicants', label: 'Job applicants' },
      { value: 'employees', label: 'Employees' },
      { value: 'students', label: 'Students' },
      { value: 'patients', label: 'Patients' },
      { value: 'customers', label: 'Customers / Consumers' },
      { value: 'citizens', label: 'Citizens / General public' },
      { value: 'suspects', label: 'Criminal suspects or defendants' },
      { value: 'migrants', label: 'Migrants or asylum seekers' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'euScope',
    label: 'Where and how is this AI deployed?',
    type: 'dual-radio',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    subQuestion: {
      id: 'productType',
      label: 'Is it embedded in a physical product?',
      options: [
        { value: 'medical', label: 'Yes — medical device' },
        { value: 'machinery', label: 'Yes — machinery or equipment' },
        { value: 'vehicle', label: 'Yes — vehicle or transport' },
        { value: 'other_product', label: 'Yes — other product' },
        { value: 'software', label: 'No — software/digital service only' },
      ],
    },
  },
  {
    id: 'biometricProcessing',
    label: 'Does this AI process biometric data to identify people?',
    type: 'radio',
    required: true,
    options: [
      { 
        value: 'realtime_public', 
        label: 'Yes, real-time identification in publicly accessible spaces',
        description: 'Live biometric identification in public areas'
      },
      { 
        value: 'remote', 
        label: 'Yes, remote biometric identification (not real-time or not public)',
        description: 'Post-event or non-public biometric identification'
      },
      { 
        value: 'verification', 
        label: 'Yes, biometric verification (1:1 matching only)',
        description: 'Confirming identity against a single reference'
      },
      { 
        value: 'no', 
        label: 'No biometric identification',
        description: 'System does not use biometric data'
      },
    ],
  },
  {
    id: 'sensitiveCaps',
    label: 'Does this AI have any of these capabilities? (Select all that apply)',
    type: 'multi-select',
    required: true,
    options: [
      { value: 'emotion', label: 'Emotion recognition (inferring emotions from face, voice, behavior)' },
      { value: 'categorization', label: 'Biometric categorization by race, ethnicity, or religion' },
      { value: 'criminal_prediction', label: 'Predicting criminal behavior or reoffending likelihood' },
      { value: 'synthetic', label: 'Generating synthetic content (deepfakes, AI images/video/audio)' },
      { value: 'chatbot', label: 'Chatbot or conversational agent (interacts with users as AI)' },
      { value: 'social_scoring', label: 'Social scoring (rating citizens based on behavior)' },
      { value: 'none', label: 'None of these' },
    ],
  },
];

export default function Step2Page() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState<FormData>({
    sector: '',
    decisionImpact: [],
    affectedPersons: [],
    euScope: '',
    productType: '',
    biometricProcessing: '',
    sensitiveCaps: [],
  });

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.step2Data) {
            setFormData(data.step2Data);
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
      const response = await fetch(`/api/assessments/${assessmentId}/step2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/app/assessment/${assessmentId}/step3`);
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving step 2:', error);
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
    : currentQuestionData.type === 'dual-radio'
      ? (currentValue as string).trim().length > 0 && formData.productType.trim().length > 0
      : (currentValue as string).trim().length > 0;

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
                Step 2: How Is Your AI Used?
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
            <div className="flex justify-between mt-4 gap-1">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all duration-300",
                    index < currentQuestion
                      ? "bg-blue-500"
                      : index === currentQuestion
                      ? "bg-blue-500/50"
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
                  ) : currentQuestionData.type === 'dual-radio' ? (
                    <div className="space-y-6">
                      {/* First question */}
                      <div>
                        <Label className="text-base font-medium text-zinc-300 mb-3 block">
                          Does it affect people in the EU?
                        </Label>
                        <RadioGroup
                          value={currentValue as string}
                          onValueChange={(value: string) =>
                            setFormData({ ...formData, [currentQuestionData.id]: value })
                          }
                          className="space-y-2"
                        >
                          {currentQuestionData.options?.map((option) => (
                            <div
                              key={option.value}
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                                currentValue === option.value
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                              )}
                              onClick={() => setFormData({ ...formData, [currentQuestionData.id]: option.value })}
                            >
                              <RadioGroupItem value={option.value} id={`eu-${option.value}`} />
                              <Label htmlFor={`eu-${option.value}`} className="text-sm font-medium text-white cursor-pointer flex-1">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      {/* Second question */}
                      {currentQuestionData.subQuestion && (
                        <div>
                          <Label className="text-base font-medium text-zinc-300 mb-3 block">
                            {currentQuestionData.subQuestion.label}
                          </Label>
                          <RadioGroup
                            value={formData.productType}
                            onValueChange={(value: string) =>
                              setFormData({ ...formData, productType: value })
                            }
                            className="space-y-2"
                          >
                            {currentQuestionData.subQuestion.options.map((option) => (
                              <div
                                key={option.value}
                                className={cn(
                                  "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                                  formData.productType === option.value
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                                )}
                                onClick={() => setFormData({ ...formData, productType: option.value })}
                              >
                                <RadioGroupItem value={option.value} id={`product-${option.value}`} />
                                <Label htmlFor={`product-${option.value}`} className="text-sm font-medium text-white cursor-pointer flex-1">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
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
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={isFirstQuestion ? () => router.push(`/app/assessment/${assessmentId}/step1`) : handlePrevious}
                    className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    {isFirstQuestion ? 'Back to Step 1' : 'Previous'}
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!isCurrentAnswered || saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Complete Step 2
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
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
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
