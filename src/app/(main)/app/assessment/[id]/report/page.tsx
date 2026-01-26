"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeftIcon,
  Loader2Icon,
  DownloadIcon,
  CalendarIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon
} from 'lucide-react';
import { Container } from '@/components';
import { cn } from '@/functions';

interface ComplianceReport {
  summary: {
    systemName: string;
    date: string;
    role: string;
    vendor: string;
    classification: string;
    score: number;
    deadline: string;
    daysRemaining: number;
  };
  requirements: {
    critical: RequirementItem[];
    needsWork: RequirementItem[];
    adequate: RequirementItem[];
  };
  actionPlan: {
    priority1: string[];
    priority2: string[];
    priority3: string[];
  };
  vendorInfo?: {
    name: string;
    obligations: string[];
    requests: string[];
  };
}

interface RequirementItem {
  title: string;
  article: string;
  score: number;
  issue?: string;
  action?: string;
  good?: string;
  gap?: string;
}

export default function ComplianceReportPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ComplianceReport | null>(null);

  useEffect(() => {
    const fetchAndGenerateReport = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (response.ok) {
          const data = await response.json();

          if (!data.step3Data) {
            alert('Please complete the assessment first');
            router.push(`/app/assessment/${assessmentId}`);
            return;
          }

          const generatedReport = generateComplianceReport(data);
          setReport(generatedReport);
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGenerateReport();
  }, [assessmentId, router]);

  const handleDownloadPDF = () => {
    alert('PDF download will be implemented');
  };

  const handleSaveToDashboard = async () => {
    try {
      await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallScore: report?.summary.score,
          status: 'COMPLETED'
        }),
      });
      router.push('/app');
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-400">Unable to generate report</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <Container>
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/app')}
                className="hover:bg-zinc-900"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">Compliance Report</h1>
                <p className="text-zinc-400 mt-1">EU AI Act Assessment Results</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="border-zinc-800 hover:border-zinc-700"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleSaveToDashboard}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  Save to Dashboard
                </Button>
              </div>
            </div>
          </Container>

          {/* Report Content */}
          <Container delay={0.1}>
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">LEXURA COMPLIANCE REPORT</h2>
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-6" />
                </div>

                {/* Summary Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-500 rounded" />
                    SUMMARY
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">System:</span>
                        <span className="text-white font-medium">{report.summary.systemName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Date:</span>
                        <span className="text-white">{report.summary.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Role:</span>
                        <span className="text-white">{report.summary.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Vendor:</span>
                        <span className="text-white">{report.summary.vendor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800 my-8" />

                {/* Classification */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-500 rounded" />
                    CLASSIFICATION
                  </h3>
                  <div className={cn(
                    "p-6 rounded-lg border-2",
                    report.summary.classification === 'PROHIBITED'
                      ? "bg-red-500/10 border-red-500/30"
                      : report.summary.classification.includes('HIGH_RISK')
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : report.summary.classification === 'LIMITED_RISK'
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-green-500/10 border-green-500/30"
                  )}>
                    <div className="flex items-center gap-3 mb-3">
                      {report.summary.classification === 'PROHIBITED' ? (
                        <AlertTriangleIcon className="w-6 h-6 text-red-400" />
                      ) : report.summary.classification.includes('HIGH_RISK') ? (
                        <AlertTriangleIcon className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                      )}
                      <span className="text-xl font-bold text-white">
                        {report.summary.classification.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm">
                      {getClassificationDescription(report.summary.classification)}
                    </p>
                  </div>
                </div>

                <Separator className="bg-zinc-800 my-8" />

                {/* Compliance Score */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-500 rounded" />
                    COMPLIANCE SCORE
                  </h3>
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-zinc-800 mb-4">
                      <div className="text-center">
                        <div className="text-4xl font-black text-white">{report.summary.score}%</div>
                        <div className={cn(
                          "text-sm font-medium",
                          report.summary.score >= 80 ? "text-green-400" :
                            report.summary.score >= 60 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {report.summary.score >= 80 ? 'EXCELLENT' :
                            report.summary.score >= 60 ? 'NEEDS WORK' : 'CRITICAL'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800 my-8" />

                {/* Deadline */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-500 rounded" />
                    DEADLINE
                  </h3>
                  <div className="bg-zinc-900 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="text-xl font-bold text-white">{report.summary.deadline}</div>
                        <div className="text-zinc-400">{report.summary.daysRemaining} days remaining</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800 my-8" />

                {/* Requirements Breakdown */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-500 rounded" />
                    REQUIREMENT BREAKDOWN
                  </h3>

                  {/* Critical Gaps */}
                  {report.requirements.critical.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                        <XCircleIcon className="w-5 h-5" />
                        CRITICAL GAPS
                      </h4>
                      <div className="space-y-4">
                        {report.requirements.critical.map((req, index) => (
                          <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-white">{req.title}</h5>
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                {req.article} • {req.score}%
                              </Badge>
                            </div>
                            {req.issue && (
                              <p className="text-sm text-zinc-300 mb-2">
                                <strong>Issue:</strong> {req.issue}
                              </p>
                            )}
                            {req.action && (
                              <p className="text-sm text-zinc-300">
                                <strong>Action:</strong> {req.action}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Needs Improvement */}
                  {report.requirements.needsWork.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5" />
                        NEEDS IMPROVEMENT
                      </h4>
                      <div className="space-y-4">
                        {report.requirements.needsWork.map((req, index) => (
                          <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-white">{req.title}</h5>
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                {req.article} • {req.score}%
                              </Badge>
                            </div>
                            {req.good && (
                              <p className="text-sm text-zinc-300 mb-2">
                                <strong>Good:</strong> {req.good}
                              </p>
                            )}
                            {req.gap && (
                              <p className="text-sm text-zinc-300 mb-2">
                                <strong>Gap:</strong> {req.gap}
                              </p>
                            )}
                            {req.action && (
                              <p className="text-sm text-zinc-300">
                                <strong>Action:</strong> {req.action}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Adequate */}
                  {report.requirements.adequate.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        ADEQUATE
                      </h4>
                      <div className="space-y-4">
                        {report.requirements.adequate.map((req, index) => (
                          <div key={index} className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-white">{req.title}</h5>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                {req.article} • {req.score}%
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-300">{req.good}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-zinc-800 my-8" />

                {/* Action Plan */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-500 rounded" />
                    📝 ACTION PLAN
                  </h3>

                  <div className="space-y-6">
                    {report.actionPlan.priority1.length > 0 && (
                      <div>
                        <h4 className="text-red-400 font-semibold mb-3">PRIORITY 1 — Do Now</h4>
                        <ul className="space-y-2">
                          {report.actionPlan.priority1.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-zinc-300">
                              <span className="text-red-400 mt-1">□</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.actionPlan.priority2.length > 0 && (
                      <div>
                        <h4 className="text-yellow-400 font-semibold mb-3">PRIORITY 2 — Do Soon</h4>
                        <ul className="space-y-2">
                          {report.actionPlan.priority2.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-zinc-300">
                              <span className="text-yellow-400 mt-1">□</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.actionPlan.priority3.length > 0 && (
                      <div>
                        <h4 className="text-blue-400 font-semibold mb-3">PRIORITY 3 — Improve</h4>
                        <ul className="space-y-2">
                          {report.actionPlan.priority3.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-zinc-300">
                              <span className="text-blue-400 mt-1">□</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendor Information */}
                {report.vendorInfo && (
                  <>
                    <Separator className="bg-zinc-800 my-8" />
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <div className="h-4 w-1 bg-blue-500 rounded" />
                        📋 VENDOR INFORMATION
                      </h3>
                      <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                        <p className="text-white">
                          <strong>Vendor:</strong> {report.vendorInfo.name}
                        </p>

                        <div>
                          <p className="text-white font-semibold mb-2">As the provider, they must:</p>
                          <ul className="space-y-1 text-zinc-300 text-sm">
                            {report.vendorInfo.obligations.map((obligation, index) => (
                              <li key={index}>• {obligation}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-white font-semibold mb-2">Request from them:</p>
                          <ul className="space-y-1 text-zinc-300 text-sm">
                            {report.vendorInfo.requests.map((request, index) => (
                              <li key={index}>• {request}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="bg-zinc-800 my-8" />

                {/* Disclaimer */}
                <div className="text-center py-6">
                  <p className="text-zinc-500 text-sm">
                    ⚖️ <strong>DISCLAIMER:</strong> This assessment is for informational purposes only and does not constitute legal advice. Consult qualified legal counsel for compliance decisions.
                  </p>
                </div>

                <Separator className="bg-zinc-800 my-8" />

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="border-zinc-800 hover:border-zinc-700"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={handleSaveToDashboard}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Save to Dashboard
                  </Button>
                  <Button
                    onClick={() => router.push('/app/assessment/new')}
                    variant="outline"
                    className="border-zinc-800 hover:border-zinc-700"
                  >
                    New Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getClassificationDescription(classification: string): string {
  switch (classification) {
    case 'PROHIBITED':
      return 'This AI practice is prohibited under EU AI Act Article 5.';
    case 'HIGH_RISK_PROVIDER':
      return 'High-risk AI system - Provider obligations under Articles 9-15.';
    case 'HIGH_RISK_DEPLOYER':
      return 'High-risk AI system - Deployer obligations under Articles 26-27.';
    case 'LIMITED_RISK':
      return 'Limited risk - Transparency obligations under Article 50.';
    case 'MINIMAL_RISK':
      return 'Minimal risk - No specific obligations, voluntary codes of conduct encouraged.';
    case 'GPAI_PROVIDER':
      return 'General Purpose AI Provider - Obligations under Articles 53-55 including technical documentation and transparency requirements.';
    case 'GPAI_DEPLOYER':
      return 'General Purpose AI Deployer - Integration obligations with potential high-risk requirements depending on use case.';
    default:
      return 'Classification pending.';
  }
}

function generateComplianceReport(assessment: any): ComplianceReport {
  const step1 = assessment.step1Data || {};
  const step2 = assessment.step2Data || {};
  const step3 = assessment.step3Data || {};
  // Classification is stored in step3Data when the assessment is completed
  const classification = step3.classification || assessment.classification || 'UNKNOWN';

  // Calculate deadline based on classification
  const deadline = calculateDeadline(classification);
  const daysRemaining = Math.floor((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Analyze requirements
  const requirements = analyzeRequirements(step1, step2, step3, classification);

  // Calculate overall score
  const score = calculateOverallScore(requirements);

  // Generate action plan
  const actionPlan = generateActionPlan(requirements, classification);

  // Vendor information - vendorName is collected in step1, not step2
  // Role is determined by ownership field: vendor/api/combination means deployer role
  const isDeployer = ['vendor', 'api', 'combination'].includes(step1.ownership);
  const vendorInfo = isDeployer && step1.vendorName ? {
    name: step1.vendorName,
    obligations: getProviderObligations(classification),
    requests: getVendorRequests(classification)
  } : undefined;

  // Determine role from step1.ownership
  const role = step1.ownership === 'inhouse' ? 'Provider' :
    step1.ownership === 'combination' ? 'Provider + Deployer' : 'Deployer';

  return {
    summary: {
      systemName: step1.systemName || 'Unnamed System',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      role: role,
      vendor: step1.vendorName || 'N/A',
      classification: classification,
      score: score,
      deadline: deadline,
      daysRemaining: daysRemaining
    },
    requirements,
    actionPlan,
    vendorInfo
  };
}

function calculateDeadline(classification: string): string {
  const baseDate = new Date('2027-08-02'); // EU AI Act full application date

  if (classification === 'PROHIBITED') {
    return new Date('2025-02-02').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } else if (classification.includes('HIGH_RISK')) {
    return baseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } else if (classification.includes('GPAI')) {
    return baseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return baseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function analyzeRequirements(step1: any, step2: any, step3: any, classification: string) {
  const critical: RequirementItem[] = [];
  const needsWork: RequirementItem[] = [];
  const adequate: RequirementItem[] = [];

  // Helper function to convert yes/partial/no to scores
  const getScore = (value: string): number => {
    if (value === 'yes' || value === 'always') return 90;
    if (value === 'partial' || value === 'usually' || value === 'informal' || value === 'identified' || value === 'basic' || value === 'limited' || value === 'approval' || value === 'some' || value === 'adhoc' || value === 'policy' || value === 'difficult' || value === 'mentioned' || value === 'sometimes') return 60;
    return 30;
  };

  // HIGH RISK PROVIDER requirements
  if (classification === 'HIGH_RISK_PROVIDER') {
    // Risk Management System (combines riskManagement and riskMitigation)
    const riskMgmtScore = getScore(step3.riskManagement);
    const riskMitigationScore = getScore(step3.riskMitigation);
    const riskScore = Math.round((riskMgmtScore + riskMitigationScore) / 2);

    if (riskScore < 60) {
      critical.push({
        title: 'Risk Management System',
        article: 'Art. 9',
        score: riskScore,
        issue: 'No comprehensive risk management system in place',
        action: 'Establish continuous risk management system with lifecycle monitoring'
      });
    } else if (riskScore < 80) {
      needsWork.push({
        title: 'Risk Management System',
        article: 'Art. 9',
        score: riskScore,
        good: 'Basic risk management exists',
        gap: 'Needs to be more comprehensive and continuous',
        action: 'Enhance risk management to cover full AI lifecycle'
      });
    } else {
      adequate.push({
        title: 'Risk Management System',
        article: 'Art. 9',
        score: riskScore,
        good: 'Comprehensive risk management system in place'
      });
    }

    // Data Governance (combines dataDocumentation and biasTest)
    const dataDocScore = getScore(step3.dataDocumentation);
    const biasScore = getScore(step3.biasTest);
    const dataScore = Math.round((dataDocScore + biasScore) / 2);

    if (dataScore < 60) {
      critical.push({
        title: 'Data Governance',
        article: 'Art. 10',
        score: dataScore,
        issue: 'Training data quality and governance insufficient',
        action: 'Implement data quality checks, bias detection, and proper data governance'
      });
    } else if (dataScore < 80) {
      needsWork.push({
        title: 'Data Governance',
        article: 'Art. 10',
        score: dataScore,
        good: 'Basic data quality measures exist',
        gap: 'Need enhanced bias detection and data governance',
        action: 'Strengthen data quality assurance and bias mitigation'
      });
    } else {
      adequate.push({
        title: 'Data Governance',
        article: 'Art. 10',
        score: dataScore,
        good: 'High-quality training data with proper governance'
      });
    }

    // Technical Documentation (technicalDocs)
    const docScore = getScore(step3.technicalDocs);

    if (docScore < 60) {
      critical.push({
        title: 'Technical Documentation',
        article: 'Art. 11',
        score: docScore,
        issue: 'Technical documentation missing or incomplete',
        action: 'Create comprehensive technical documentation per Annex IV'
      });
    } else if (docScore < 80) {
      needsWork.push({
        title: 'Technical Documentation',
        article: 'Art. 11',
        score: docScore,
        good: 'Partial documentation exists',
        gap: 'Documentation needs to be more comprehensive',
        action: 'Complete all required documentation elements'
      });
    } else {
      adequate.push({
        title: 'Technical Documentation',
        article: 'Art. 11',
        score: docScore,
        good: 'Complete technical documentation maintained'
      });
    }

    // Logging Capabilities
    const logScore = getScore(step3.logging);

    if (logScore < 60) {
      critical.push({
        title: 'Logging Capabilities',
        article: 'Art. 12',
        score: logScore,
        issue: 'Insufficient automatic logging of events',
        action: 'Implement automatic logging system for all required events'
      });
    } else if (logScore < 80) {
      needsWork.push({
        title: 'Logging Capabilities',
        article: 'Art. 12',
        score: logScore,
        good: 'Partial logging in place',
        gap: 'Needs comprehensive automatic logging capabilities',
        action: 'Upgrade to comprehensive automatic logging system'
      });
    } else {
      adequate.push({
        title: 'Logging Capabilities',
        article: 'Art. 12',
        score: logScore,
        good: 'Automatic logging system operational'
      });
    }

    // Instructions for Use
    const instructionsScore = getScore(step3.instructions);

    if (instructionsScore < 60) {
      critical.push({
        title: 'Instructions for Use',
        article: 'Art. 13',
        score: instructionsScore,
        issue: 'No clear instructions for deployers',
        action: 'Create detailed instructions covering proper use, capabilities, and limitations'
      });
    } else if (instructionsScore < 80) {
      needsWork.push({
        title: 'Instructions for Use',
        article: 'Art. 13',
        score: instructionsScore,
        good: 'Basic information provided',
        gap: 'Instructions need more detail',
        action: 'Enhance deployer documentation with comprehensive guidance'
      });
    } else {
      adequate.push({
        title: 'Instructions for Use',
        article: 'Art. 13',
        score: instructionsScore,
        good: 'Detailed instructions provided to deployers'
      });
    }

    // Human Oversight (combines oversightDesign and overrideCapability)
    const oversightDesignScore = getScore(step3.oversightDesign);
    const overrideScore = getScore(step3.overrideCapability);
    const oversightScore = Math.round((oversightDesignScore + overrideScore) / 2);

    if (oversightScore < 60) {
      critical.push({
        title: 'Human Oversight',
        article: 'Art. 14',
        score: oversightScore,
        issue: 'Inadequate human oversight measures',
        action: 'Design system to enable effective human oversight with intervention capabilities'
      });
    } else if (oversightScore < 80) {
      needsWork.push({
        title: 'Human Oversight',
        article: 'Art. 14',
        score: oversightScore,
        good: 'Some human oversight exists',
        gap: 'Override and monitoring capabilities need improvement',
        action: 'Enhance human oversight design and intervention mechanisms'
      });
    } else {
      adequate.push({
        title: 'Human Oversight',
        article: 'Art. 14',
        score: oversightScore,
        good: 'Effective human oversight with intervention capabilities'
      });
    }

    // Accuracy & Robustness (accuracySecurity)
    const accuracyScore = getScore(step3.accuracySecurity);

    if (accuracyScore < 60) {
      critical.push({
        title: 'Accuracy & Robustness',
        article: 'Art. 15',
        score: accuracyScore,
        issue: 'System accuracy and robustness below acceptable levels',
        action: 'Improve system accuracy testing and implement cybersecurity measures'
      });
    } else if (accuracyScore < 80) {
      needsWork.push({
        title: 'Accuracy & Robustness',
        article: 'Art. 15',
        score: accuracyScore,
        good: 'Partial testing and measures exist',
        gap: 'Needs improvement for high-risk context',
        action: 'Enhance accuracy testing and security measures'
      });
    } else {
      adequate.push({
        title: 'Accuracy & Robustness',
        article: 'Art. 15',
        score: accuracyScore,
        good: 'High accuracy with robust cybersecurity measures'
      });
    }
  }

  // HIGH RISK DEPLOYER requirements
  if (classification === 'HIGH_RISK_DEPLOYER') {
    // Provider Instructions
    const instructionsScore = getScore(step3.providerInstructions);

    if (instructionsScore < 60) {
      critical.push({
        title: 'Provider Documentation',
        article: 'Art. 26(1)',
        score: instructionsScore,
        issue: 'No comprehensive instructions received from provider',
        action: 'Request detailed instructions for use from AI system provider'
      });
    } else if (instructionsScore < 80) {
      needsWork.push({
        title: 'Provider Documentation',
        article: 'Art. 26(1)',
        score: instructionsScore,
        good: 'Limited documentation received',
        gap: 'Need comprehensive instructions from provider',
        action: 'Request complete documentation including limitations and proper use'
      });
    } else {
      adequate.push({
        title: 'Provider Documentation',
        article: 'Art. 26(1)',
        score: instructionsScore,
        good: 'Comprehensive documentation received from provider'
      });
    }

    // Understanding of System
    const understandingScore = getScore(step3.understanding);

    if (understandingScore < 60) {
      critical.push({
        title: 'System Understanding',
        article: 'Art. 26(2)',
        score: understandingScore,
        issue: 'Unclear understanding of system purpose and limitations',
        action: 'Obtain training and documentation to understand system capabilities and limitations'
      });
    } else if (understandingScore < 80) {
      needsWork.push({
        title: 'System Understanding',
        article: 'Art. 26(2)',
        score: understandingScore,
        good: 'Partial understanding exists',
        gap: 'Need deeper understanding of limitations',
        action: 'Enhance team knowledge of system capabilities and limitations'
      });
    } else {
      adequate.push({
        title: 'System Understanding',
        article: 'Art. 26(2)',
        score: understandingScore,
        good: 'Full understanding of system purpose, capabilities, and limitations'
      });
    }

    // Human Review
    const humanReviewScore = getScore(step3.humanReview);

    if (humanReviewScore < 60) {
      critical.push({
        title: 'Human Review of Decisions',
        article: 'Art. 26(5)',
        score: humanReviewScore,
        issue: 'Insufficient human review of AI outputs',
        action: 'Implement mandatory human review before final decisions'
      });
    } else if (humanReviewScore < 80) {
      needsWork.push({
        title: 'Human Review of Decisions',
        article: 'Art. 26(5)',
        score: humanReviewScore,
        good: 'Usually human review occurs',
        gap: 'Some automated decisions without review',
        action: 'Ensure consistent human review for all significant decisions'
      });
    } else {
      adequate.push({
        title: 'Human Review of Decisions',
        article: 'Art. 26(5)',
        score: humanReviewScore,
        good: 'Human always makes final decision with AI support'
      });
    }

    // Override Capability
    const overrideScore = getScore(step3.overrideCapability);

    if (overrideScore < 60) {
      critical.push({
        title: 'Override Capability',
        article: 'Art. 26(5)',
        score: overrideScore,
        issue: 'No real override capability for staff',
        action: 'Enable staff to easily override or disregard AI outputs'
      });
    } else if (overrideScore < 80) {
      needsWork.push({
        title: 'Override Capability',
        article: 'Art. 26(5)',
        score: overrideScore,
        good: 'Override possible with approval',
        gap: 'Process is cumbersome',
        action: 'Simplify override process for staff'
      });
    } else {
      adequate.push({
        title: 'Override Capability',
        article: 'Art. 26(5)',
        score: overrideScore,
        good: 'Staff can easily override AI outputs when needed'
      });
    }

    // Training
    const trainingScore = getScore(step3.training);

    if (trainingScore < 60) {
      critical.push({
        title: 'Staff Training',
        article: 'Art. 26(6)',
        score: trainingScore,
        issue: 'No training provided on AI system use',
        action: 'Implement formal training program on AI system operation'
      });
    } else if (trainingScore < 80) {
      needsWork.push({
        title: 'Staff Training',
        article: 'Art. 26(6)',
        score: trainingScore,
        good: 'Informal guidance provided',
        gap: 'Need formal training program',
        action: 'Develop comprehensive training curriculum'
      });
    } else {
      adequate.push({
        title: 'Staff Training',
        article: 'Art. 26(6)',
        score: trainingScore,
        good: 'Formal training provided to all relevant staff'
      });
    }

    // Monitoring
    const monitoringScore = getScore(step3.monitoring);

    if (monitoringScore < 60) {
      critical.push({
        title: 'System Monitoring',
        article: 'Art. 26(5)',
        score: monitoringScore,
        issue: 'No processes to monitor system behavior',
        action: 'Implement data quality checks and ongoing monitoring processes'
      });
    } else if (monitoringScore < 80) {
      needsWork.push({
        title: 'System Monitoring',
        article: 'Art. 26(5)',
        score: monitoringScore,
        good: 'Some informal checks exist',
        gap: 'Need formal monitoring processes',
        action: 'Establish formal monitoring and quality assurance procedures'
      });
    } else {
      adequate.push({
        title: 'System Monitoring',
        article: 'Art. 26(5)',
        score: monitoringScore,
        good: 'Formal data quality checks and ongoing monitoring in place'
      });
    }

    // Incident Reporting
    const incidentScore = getScore(step3.incidentReporting);

    if (incidentScore < 60) {
      critical.push({
        title: 'Incident Reporting',
        article: 'Art. 26(5)',
        score: incidentScore,
        issue: 'No process to report incidents to provider',
        action: 'Establish formal incident escalation process with provider'
      });
    } else if (incidentScore < 80) {
      needsWork.push({
        title: 'Incident Reporting',
        article: 'Art. 26(5)',
        score: incidentScore,
        good: 'Would figure it out if needed',
        gap: 'Need defined escalation process',
        action: 'Document formal incident reporting procedures'
      });
    } else {
      adequate.push({
        title: 'Incident Reporting',
        article: 'Art. 26(5)',
        score: incidentScore,
        good: 'Defined escalation process for incidents'
      });
    }

    // Transparency to Affected Persons
    const transparencyScore = getScore(step3.transparency);

    if (transparencyScore < 60) {
      critical.push({
        title: 'Transparency to Affected Persons',
        article: 'Art. 26(8)',
        score: transparencyScore,
        issue: 'Affected persons not informed of AI use',
        action: 'Implement clear disclosure to affected persons about AI involvement'
      });
    } else if (transparencyScore < 80) {
      needsWork.push({
        title: 'Transparency to Affected Persons',
        article: 'Art. 26(8)',
        score: transparencyScore,
        good: 'Mentioned in policy or terms',
        gap: 'Disclosure not prominent enough',
        action: 'Make AI disclosure more visible and accessible'
      });
    } else {
      adequate.push({
        title: 'Transparency to Affected Persons',
        article: 'Art. 26(8)',
        score: transparencyScore,
        good: 'Clear and prominent AI disclosure to affected persons'
      });
    }

    // Rights Assessment
    const rightsScore = getScore(step3.rightsAssessment);

    if (rightsScore < 60) {
      critical.push({
        title: 'Fundamental Rights Assessment',
        article: 'Art. 27',
        score: rightsScore,
        issue: 'No fundamental rights impact assessment conducted',
        action: 'Conduct formal assessment of AI impact on fundamental rights'
      });
    } else if (rightsScore < 80) {
      needsWork.push({
        title: 'Fundamental Rights Assessment',
        article: 'Art. 27',
        score: rightsScore,
        good: 'Informal consideration given',
        gap: 'Need documented formal assessment',
        action: 'Formalize and document fundamental rights impact assessment'
      });
    } else {
      adequate.push({
        title: 'Fundamental Rights Assessment',
        article: 'Art. 27',
        score: rightsScore,
        good: 'Documented assessment of fundamental rights impact'
      });
    }
  }

  // LIMITED RISK requirements
  if (classification === 'LIMITED_RISK') {
    // AI Disclosure (chatbot interaction)
    const aiDisclosureScore = step3.aiDisclosure === 'na' ? 90 : getScore(step3.aiDisclosure);

    if (step3.aiDisclosure !== 'na' && aiDisclosureScore < 60) {
      critical.push({
        title: 'AI Interaction Disclosure',
        article: 'Art. 50(1)',
        score: aiDisclosureScore,
        issue: 'Users not informed they are interacting with AI',
        action: 'Implement clear disclosure that users are interacting with AI'
      });
    } else if (step3.aiDisclosure !== 'na' && aiDisclosureScore < 80) {
      needsWork.push({
        title: 'AI Interaction Disclosure',
        article: 'Art. 50(1)',
        score: aiDisclosureScore,
        good: 'Mentioned but not prominent',
        gap: 'Disclosure should be clearer',
        action: 'Make AI interaction disclosure more prominent'
      });
    } else {
      adequate.push({
        title: 'AI Interaction Disclosure',
        article: 'Art. 50(1)',
        score: aiDisclosureScore,
        good: step3.aiDisclosure === 'na' ? 'N/A - No direct user interaction' : 'Clear AI disclosure provided'
      });
    }

    // Emotion Recognition Disclosure
    const emotionScore = step3.emotionDisclosure === 'na' ? 90 : getScore(step3.emotionDisclosure);

    if (step3.emotionDisclosure !== 'na' && emotionScore < 60) {
      critical.push({
        title: 'Emotion/Biometric Disclosure',
        article: 'Art. 50(2)',
        score: emotionScore,
        issue: 'Subjects not informed about emotion recognition or biometric categorization',
        action: 'Inform subjects before exposure to emotion recognition or biometric features'
      });
    } else if (step3.emotionDisclosure !== 'na' && emotionScore < 80) {
      needsWork.push({
        title: 'Emotion/Biometric Disclosure',
        article: 'Art. 50(2)',
        score: emotionScore,
        good: 'Mentioned in terms/policy',
        gap: 'Should inform before exposure',
        action: 'Provide prior notification about emotion/biometric processing'
      });
    } else {
      adequate.push({
        title: 'Emotion/Biometric Disclosure',
        article: 'Art. 50(2)',
        score: emotionScore,
        good: step3.emotionDisclosure === 'na' ? 'N/A - No emotion/biometric features' : 'Subjects informed before exposure'
      });
    }

    // Synthetic Content Labeling
    const syntheticScore = step3.syntheticLabeling === 'na' ? 90 : getScore(step3.syntheticLabeling);

    if (step3.syntheticLabeling !== 'na' && syntheticScore < 60) {
      critical.push({
        title: 'Synthetic Content Labeling',
        article: 'Art. 50(4)',
        score: syntheticScore,
        issue: 'AI-generated content not labeled',
        action: 'Label all synthetic content as AI-generated'
      });
    } else if (step3.syntheticLabeling !== 'na' && syntheticScore < 80) {
      needsWork.push({
        title: 'Synthetic Content Labeling',
        article: 'Art. 50(4)',
        score: syntheticScore,
        good: 'Sometimes labeled',
        gap: 'Labeling should be consistent',
        action: 'Ensure all AI-generated content is clearly labeled'
      });
    } else {
      adequate.push({
        title: 'Synthetic Content Labeling',
        article: 'Art. 50(4)',
        score: syntheticScore,
        good: step3.syntheticLabeling === 'na' ? 'N/A - No synthetic content generation' : 'All synthetic content clearly labeled'
      });
    }
  }

  // GPAI requirements
  if (classification.includes('GPAI')) {
    // Compute threshold check
    const computeInfo = step3.compute;
    if (computeInfo === 'more') {
      critical.push({
        title: 'Systemic Risk Assessment',
        article: 'Art. 51',
        score: 40,
        issue: 'Model exceeds systemic risk compute threshold (10^25 FLOPS)',
        action: 'Conduct systemic risk assessment and implement additional safeguards per Article 55'
      });
    }

    // GPAI Documentation
    const gpaiDocScore = getScore(step3.documentation);

    if (gpaiDocScore < 60) {
      critical.push({
        title: 'GPAI Technical Documentation',
        article: 'Art. 53',
        score: gpaiDocScore,
        issue: 'General purpose AI model requires specific documentation',
        action: 'Prepare technical documentation per Annex XI requirements'
      });
    } else if (gpaiDocScore < 80) {
      needsWork.push({
        title: 'GPAI Technical Documentation',
        article: 'Art. 53',
        score: gpaiDocScore,
        good: 'Partial documentation exists',
        gap: 'Documentation needs to be more comprehensive',
        action: 'Complete GPAI documentation requirements'
      });
    } else {
      adequate.push({
        title: 'GPAI Technical Documentation',
        article: 'Art. 53',
        score: gpaiDocScore,
        good: 'Comprehensive GPAI documentation maintained'
      });
    }

    // Training Data Summary
    const trainingDataScore = getScore(step3.trainingSummary);

    if (trainingDataScore < 60) {
      critical.push({
        title: 'Training Data Summary',
        article: 'Art. 53(1)(d)',
        score: trainingDataScore,
        issue: 'Cannot provide training data summary to authorities',
        action: 'Prepare detailed training data content summary for regulatory requests'
      });
    } else if (trainingDataScore < 80) {
      needsWork.push({
        title: 'Training Data Summary',
        article: 'Art. 53(1)(d)',
        score: trainingDataScore,
        good: 'Partial summary available',
        gap: 'Needs to be more detailed',
        action: 'Enhance training data documentation'
      });
    } else {
      adequate.push({
        title: 'Training Data Summary',
        article: 'Art. 53(1)(d)',
        score: trainingDataScore,
        good: 'Detailed training data summary available'
      });
    }

    // Copyright Compliance
    const copyrightScore = getScore(step3.copyrightPolicy);

    if (copyrightScore < 60) {
      critical.push({
        title: 'Copyright Compliance',
        article: 'Art. 53(1)(c)',
        score: copyrightScore,
        issue: 'No copyright compliance policy',
        action: 'Develop and publish copyright compliance policy for training data'
      });
    } else if (copyrightScore < 80) {
      needsWork.push({
        title: 'Copyright Compliance',
        article: 'Art. 53(1)(c)',
        score: copyrightScore,
        good: 'Internal policy exists',
        gap: 'Should be publicly available',
        action: 'Make copyright compliance policy publicly accessible'
      });
    } else {
      adequate.push({
        title: 'Copyright Compliance',
        article: 'Art. 53(1)(c)',
        score: copyrightScore,
        good: 'Public copyright compliance policy in place'
      });
    }
  }

  return { critical, needsWork, adequate };
}

function calculateOverallScore(requirements: any): number {
  const allReqs = [
    ...requirements.critical,
    ...requirements.needsWork,
    ...requirements.adequate
  ];

  if (allReqs.length === 0) return 100;

  const totalScore = allReqs.reduce((sum, req) => sum + req.score, 0);
  return Math.round(totalScore / allReqs.length);
}

function generateActionPlan(requirements: any, classification: string) {
  const priority1: string[] = [];
  const priority2: string[] = [];
  const priority3: string[] = [];

  // Priority 1: Critical gaps
  requirements.critical.forEach((req: RequirementItem) => {
    if (req.action) priority1.push(req.action);
  });

  // Priority 2: Needs work
  requirements.needsWork.forEach((req: RequirementItem) => {
    if (req.action) priority2.push(req.action);
  });

  // Priority 3: General improvements
  if (classification.includes('HIGH_RISK')) {
    priority3.push('Conduct regular compliance audits');
    priority3.push('Establish incident response procedures');
    priority3.push('Train staff on EU AI Act requirements');
  }

  if (classification.includes('GPAI')) {
    priority3.push('Monitor for systemic risks');
    priority3.push('Engage with AI Office on compliance');
  }

  priority3.push('Stay updated on EU AI Act guidance and standards');
  priority3.push('Consider voluntary codes of conduct');

  return { priority1, priority2, priority3 };
}

function getProviderObligations(classification: string): string[] {
  if (classification.includes('HIGH_RISK')) {
    return [
      'Establish risk management system (Art. 9)',
      'Ensure data governance and quality (Art. 10)',
      'Maintain technical documentation (Art. 11)',
      'Implement automatic logging (Art. 12)',
      'Enable human oversight (Art. 14)',
      'Ensure accuracy and robustness (Art. 15)',
      'Undergo conformity assessment (Art. 43)',
      'Register system in EU database (Art. 71)'
    ];
  }
  return [];
}

function getVendorRequests(classification: string): string[] {
  if (classification.includes('HIGH_RISK')) {
    return [
      'Copy of EU Declaration of Conformity',
      'Technical documentation (summary)',
      'Instructions for use',
      'Information on logging capabilities',
      'Information on human oversight measures',
      'Conformity assessment certificate',
      'EU database registration number'
    ];
  }
  return [];
}
