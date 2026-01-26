"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircle2Icon,
  PlayIcon,
  FileTextIcon,
  TrendingUpIcon,
} from 'lucide-react';
import Link from 'next/link';

interface Assessment {
  id: string;
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  score: number | null;
  systemDescription: string | null;
  createdAt: string;
  updatedAt: string;
  step1Data: any;
  step2Data: any;
  step3Data: any;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setAssessment(data);
        } else {
          console.error('Failed to fetch assessment');
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAssessment();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 md:p-8 lg:p-10">
        <div className="w-full space-y-6">
          <Skeleton className="h-10 w-64 bg-zinc-900" />
          <Skeleton className="h-96 bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileTextIcon className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Assessment not found</h3>
          <Button asChild>
            <Link href="/app">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const step1Completed = assessment.step1Data !== null;
  const step2Completed = assessment.step2Data !== null;
  const step3Completed = assessment.step3Data !== null;
  
  const completedSteps = [step1Completed, step2Completed, step3Completed].filter(Boolean).length;
  const progressPercentage = (completedSteps / 3) * 100;

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="w-full space-y-6">
          {/* Header */}
          <Container>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/app')}
                className="hover:bg-zinc-900"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{assessment.name}</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {assessment.systemDescription || 'EU AI Act Compliance Assessment'}
                </p>
              </div>
              <Badge
                className={
                  assessment.status === 'COMPLETED'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }
              >
                {assessment.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
          </Container>

          {/* Progress Overview */}
          <Container delay={0.05}>
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400">Overall Progress</h3>
                    <p className="text-2xl font-bold text-white mt-1">{Math.round(progressPercentage)}%</p>
                  </div>
                  <div className="text-sm text-zinc-500">
                    {completedSteps} of 3 steps completed
                  </div>
                </div>
                <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </Container>

          {/* Assessment Info */}
          <div className="grid gap-6 md:grid-cols-3">
            <Container>
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-white">
                    {new Date(assessment.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            </Container>

            <Container delay={0.1}>
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-white">
                    {new Date(assessment.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            </Container>

            <Container delay={0.2}>
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4" />
                    Compliance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-white">
                    {assessment.score !== null ? `${assessment.score}%` : 'Not yet scored'}
                  </p>
                </CardContent>
              </Card>
            </Container>
          </div>

          {/* Assessment Steps */}
          <Container delay={0.3}>
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <div className="h-5 w-0.5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                  Assessment Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Step 1 */}
                <Link href={`/app/assessment/${assessment.id}/step1`}>
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900/50 transition-all cursor-pointer group">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      step1Completed 
                        ? 'bg-green-500/10 group-hover:bg-green-500/20' 
                        : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                    }`}>
                      {step1Completed ? (
                        <CheckCircle2Icon className="h-5 w-5 text-green-400" />
                      ) : (
                        <span className="text-blue-400 font-semibold">1</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        System Information
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {step1Completed ? 'Completed' : 'Provide details about your AI system'}
                      </p>
                    </div>
                    <PlayIcon className="h-5 w-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>

                {/* Step 2 */}
                {step1Completed ? (
                  <Link href={`/app/assessment/${assessment.id}/step2`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900/50 transition-all cursor-pointer group">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        step2Completed 
                          ? 'bg-green-500/10 group-hover:bg-green-500/20' 
                          : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                      }`}>
                        {step2Completed ? (
                          <CheckCircle2Icon className="h-5 w-5 text-green-400" />
                        ) : (
                          <span className="text-blue-400 font-semibold">2</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                          Risk Assessment
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {step2Completed ? 'Completed' : 'Evaluate risk classification'}
                        </p>
                      </div>
                      <PlayIcon className="h-5 w-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 opacity-50 cursor-not-allowed">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-600 font-semibold">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-zinc-600">
                        Risk Assessment
                      </h3>
                      <p className="text-xs text-zinc-700">
                        Complete step 1 to unlock
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step2Completed ? (
                  <Link href={`/app/assessment/${assessment.id}/step3`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900/50 transition-all cursor-pointer group">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        step3Completed 
                          ? 'bg-green-500/10 group-hover:bg-green-500/20' 
                          : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                      }`}>
                        {step3Completed ? (
                          <CheckCircle2Icon className="h-5 w-5 text-green-400" />
                        ) : (
                          <span className="text-blue-400 font-semibold">3</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                          Compliance Review
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {step3Completed ? 'Completed' : 'Final compliance report'}
                        </p>
                      </div>
                      <PlayIcon className="h-5 w-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 opacity-50 cursor-not-allowed">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-600 font-semibold">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-zinc-600">
                        Compliance Review
                      </h3>
                      <p className="text-xs text-zinc-700">
                        Complete step 2 to unlock
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Container>

          {/* View Report Button - Only show when all steps completed */}
          {step3Completed && (
            <Container delay={0.4}>
              <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Assessment Complete! 🎉
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Your compliance report is ready to view
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(`/app/assessment/${assessment.id}/report`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Container>
          )}
        </div>
      </div>
    </div>
  );
}
