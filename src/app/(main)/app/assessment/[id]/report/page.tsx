"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftIcon,
  Loader2Icon,
  DownloadIcon,
  ShareIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ClipboardCheckIcon,
  CalendarIcon,
  FileTextIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
} from 'lucide-react';
import { Container } from '@/components';
import { cn } from '@/functions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Custom components for markdown rendering
const MarkdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-3xl font-bold text-white mt-10 mb-6 pb-3 border-b border-zinc-800 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-2xl font-bold text-white mt-10 mb-5 flex items-center gap-3" {...props}>
      <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-xl font-semibold text-zinc-100 mt-8 mb-4" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-lg font-semibold text-zinc-200 mt-6 mb-3" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p className="text-zinc-300 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="text-white font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="text-zinc-300 italic" {...props}>
      {children}
    </em>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-none space-y-2 my-4 pl-0" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside space-y-2 my-4 text-zinc-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-zinc-300 flex items-start gap-3" {...props}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  a: ({ children, href, ...props }: any) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="relative my-6 pl-6 py-4 pr-4 bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 rounded-r-lg"
      {...props}
    >
      <InfoIcon className="absolute -left-3 top-4 w-6 h-6 p-1 bg-blue-500 text-white rounded-full" />
      <div className="text-zinc-300 italic">{children}</div>
    </blockquote>
  ),
  code: ({ inline, children, ...props }: any) => {
    if (inline) {
      return (
        <code
          className="px-2 py-1 text-sm bg-zinc-800/80 text-blue-400 rounded-md font-mono border border-zinc-700/50"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="my-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-x-auto">
        <code className="text-sm text-zinc-300 font-mono" {...props}>
          {children}
        </code>
      </pre>
    );
  },
  pre: ({ children, ...props }: any) => (
    <div className="my-4" {...props}>
      {children}
    </div>
  ),
  table: ({ children, ...props }: any) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-zinc-900/80" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-zinc-200 border-b border-zinc-800"
      {...props}
    >
      {children}
    </th>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-zinc-800/50" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-zinc-800/30 transition-colors" {...props}>
      {children}
    </tr>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-3 text-sm text-zinc-300" {...props}>
      {children}
    </td>
  ),
  hr: ({ ...props }: any) => (
    <hr className="my-8 border-zinc-800" {...props} />
  ),
};

// Section icon mapping based on section titles
const getSectionIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('executive') || titleLower.includes('summary')) {
    return <FileTextIcon className="w-5 h-5" />;
  }
  if (titleLower.includes('classification') || titleLower.includes('risk')) {
    return <AlertTriangleIcon className="w-5 h-5" />;
  }
  if (titleLower.includes('compliance') || titleLower.includes('requirements')) {
    return <ClipboardCheckIcon className="w-5 h-5" />;
  }
  if (titleLower.includes('gap') || titleLower.includes('analysis')) {
    return <AlertCircleIcon className="w-5 h-5" />;
  }
  if (titleLower.includes('action') || titleLower.includes('critical')) {
    return <AlertTriangleIcon className="w-5 h-5" />;
  }
  if (titleLower.includes('timeline') || titleLower.includes('deadline')) {
    return <CalendarIcon className="w-5 h-5" />;
  }
  if (titleLower.includes('recommend') || titleLower.includes('best')) {
    return <CheckCircle2Icon className="w-5 h-5" />;
  }
  if (titleLower.includes('penalty') || titleLower.includes('fine')) {
    return <ShieldCheckIcon className="w-5 h-5" />;
  }
  return <FileTextIcon className="w-5 h-5" />;
};

export default function ComplianceReportPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [reportSource, setReportSource] = useState<'rag' | 'fallback' | null>(null);
  const [systemName, setSystemName] = useState<string>('');
  const [classification, setClassification] = useState<string>('');

  const fetchAIReport = async (forceRegenerate = false) => {
    try {
      if (forceRegenerate) {
        setRegenerating(true);
      }

      // Fetch the assessment data
      const assessmentResponse = await fetch(`/api/assessments/${assessmentId}`);
      if (!assessmentResponse.ok) {
        throw new Error('Failed to fetch assessment');
      }

      const assessmentData = await assessmentResponse.json();

      // Store system info for display
      setSystemName(assessmentData.step1Data?.systemName || 'AI System');
      setClassification(assessmentData.classification || 'Unknown');

      if (!assessmentData.step3Data) {
        alert('Please complete the assessment first');
        router.push(`/app/assessment/${assessmentId}`);
        return;
      }

      // Check if AI report already exists and we're not regenerating
      if (assessmentData.aiGeneratedReport && !forceRegenerate) {
        setAiReport(assessmentData.aiGeneratedReport);
        setReportSource(assessmentData.reportSource || 'rag');
      } else {
        // Generate new AI report
        const reportResponse = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentData }),
        });

        if (!reportResponse.ok) {
          throw new Error('Failed to generate report');
        }

        const reportData = await reportResponse.json();
        setAiReport(reportData.report);
        setReportSource(reportData.source);

        // Save the generated report to the assessment
        await fetch(`/api/assessments/${assessmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aiGeneratedReport: reportData.report,
            reportSource: reportData.source,
            status: 'COMPLETED'
          }),
        });
      }
    } catch (error) {
      console.error('Error fetching/generating AI report:', error);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchAIReport();
  }, [assessmentId, router]);

  const handleDownloadPDF = () => {
    // Simple print-to-PDF approach
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    } catch {
      alert('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Loader2Icon className="w-10 h-10 animate-spin text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-white">Generating AI Compliance Report</h3>
          <p className="text-zinc-400 max-w-md">
            Our AI is analyzing your assessment data against the EU AI Act requirements...
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-sm text-zinc-500">This may take a moment</span>
        </div>
      </div>
    );
  }

  if (!aiReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircleIcon className="w-12 h-12 text-red-500" />
        <p className="text-zinc-400">Unable to generate report</p>
        <Button onClick={() => fetchAIReport(true)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black print:bg-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-black to-purple-950/10 pointer-events-none print:hidden" />

      <div className="relative p-4 md:p-8 lg:p-10">
        <div className="w-full max-w-5xl mx-auto space-y-6">

          {/* Header Card */}
          <Container>
            <Card className="bg-gradient-to-r from-zinc-900/90 to-zinc-900/70 border-zinc-800/80 backdrop-blur-sm overflow-hidden print:bg-white print:border-gray-200">
              {/* Decorative top border */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />

              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Left side - Title and info */}
                  <div className="flex items-start gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push('/app')}
                      className="hover:bg-zinc-800 print:hidden shrink-0"
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                    </Button>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white print:text-black">
                            EU AI Act Compliance Report
                          </h1>
                          <p className="text-zinc-400 mt-1 print:text-gray-600">
                            {systemName}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Classification Badge */}
                        <Badge
                          className={cn(
                            "px-3 py-1 text-sm font-medium",
                            classification.toLowerCase().includes('high')
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : classification.toLowerCase().includes('limited')
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : classification.toLowerCase().includes('minimal')
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          )}
                        >
                          {classification.replace(/_/g, ' ')}
                        </Badge>

                        {/* Source Badge */}
                        {reportSource && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              reportSource === 'rag'
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            )}
                          >
                            {reportSource === 'rag' ? '🔍 RAG Enhanced' : '⚡ AI Generated'}
                          </Badge>
                        )}

                        {/* Date Badge */}
                        <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex gap-2 print:hidden shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAIReport(true)}
                      disabled={regenerating}
                      className="border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
                    >
                      <RefreshCwIcon className={cn("w-4 h-4 mr-2", regenerating && "animate-spin")} />
                      {regenerating ? 'Regenerating...' : 'Regenerate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
                    >
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownloadPDF}
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Container>

          {/* AI Report Content */}
          <Container>
            <Card className="bg-zinc-950/90 border-zinc-800/80 backdrop-blur-sm overflow-hidden print:bg-white print:border-gray-200">
              <CardContent className="p-6 md:p-10 lg:p-12">
                <article className="max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {aiReport}
                  </ReactMarkdown>
                </article>
              </CardContent>
            </Card>
          </Container>

          {/* Footer */}
          <Container>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-zinc-800/50 print:hidden">
              <p className="text-sm text-zinc-500">
                This report was generated by Lexura AI based on your assessment data and the EU AI Act regulations.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/app')}
                  className="text-zinc-400 hover:text-white"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:text-gray-600 {
            color: #4B5563 !important;
          }
          .print\\:border-gray-200 {
            border-color: #E5E7EB !important;
          }
        }
      `}</style>
    </div>
  );
}
