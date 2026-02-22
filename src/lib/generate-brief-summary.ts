import { ClassificationType } from './classification-logic';

interface AssessmentData {
  step1Data: any;
  step2Data: any;
  step3Data: any;
  classification: ClassificationType;
}

// Map technical field names to human-readable labels
const fieldLabels: Record<string, string> = {
  // Step 1 fields
  systemName: 'The company name',
  description: 'The description',
  euScope: 'EU scope',
  technologyType: 'Technology type',
  gpaiCheck: 'General purpose AI',
  ownership: 'Ownership',

  // Step 2 fields
  sector: 'Sector',
  decisionImpact: 'Decision impact',
  affectedPersons: 'Affected persons',
  productType: 'Product type',
  biometricProcessing: 'Biometric processing',
  sensitiveCaps: 'Sensitive capabilities',

  // Step 3 fields (compliance questions)
  riskManagement: 'Risk management',
  dataDocumentation: 'Data documentation',
  biasTest: 'Bias testing',
  technicalDocs: 'Technical documentation',
  logging: 'Logging',
  instructions: 'Instructions',
  oversightDesign: 'Oversight design',
  overrideCapability: 'Override capability',
  accuracySecurity: 'Accuracy and security',
};

export function generateBriefSummary(data: AssessmentData): string {
  const { step1Data, step2Data, step3Data, classification } = data;

  // Build structured assessment data
  const systemInfo = step1Data ? {
    name: step1Data.systemName || 'Unnamed System',
    description: step1Data.description || 'No description provided',
    technology: Array.isArray(step1Data.technologyType)
      ? step1Data.technologyType.join(', ')
      : step1Data.technologyType || 'Unknown',
    role: step1Data.ownership === 'inhouse' ? 'Provider (Developer)' : 'Deployer (User)',
    euScope: step1Data.euScope || 'Unknown',
    gpai: step1Data.gpaiCheck === 'yes' ? 'Yes' : 'No',
  } : null;

  const useCaseInfo = step2Data ? {
    sector: step2Data.sector || 'Unknown',
    decisionImpact: step2Data.decisionImpact || 'Unknown',
    affectedPersons: step2Data.affectedPersons?.join(', ') || 'Not specified',
    productType: step2Data.productType || 'Unknown',
    biometricProcessing: step2Data.biometricProcessing === 'yes' ? 'Yes' : 'No',
    sensitiveCaps: Array.isArray(step2Data.sensitiveCaps) && step2Data.sensitiveCaps.length > 0
      ? step2Data.sensitiveCaps.join(', ')
      : 'None identified',
  } : null;

  const complianceStatus = step3Data ? {
    riskManagement: step3Data.riskManagement || 'Not assessed',
    dataDocumentation: step3Data.dataDocumentation || 'Not assessed',
    biasTest: step3Data.biasTest || 'Not assessed',
    technicalDocs: step3Data.technicalDocs || 'Not assessed',
    logging: step3Data.logging || 'Not assessed',
    instructions: step3Data.instructions || 'Not assessed',
    oversightDesign: step3Data.oversightDesign || 'Not assessed',
    overrideCapability: step3Data.overrideCapability || 'Not assessed',
    accuracySecurity: step3Data.accuracySecurity || 'Not assessed',
  } : null;

  const classificationLabel = classification?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN';

  // Create enhanced prompt optimized for Gemini 2.5 Flash
  return `<ROLE>
You are a senior EU AI Act compliance consultant with deep expertise in AI regulation, risk assessment, and enterprise compliance frameworks. Your role is to analyze AI systems and produce comprehensive, actionable compliance reports that meet regulatory standards.
</ROLE>

<CONTEXT>
You are generating a formal EU AI Act compliance report for an organization. The report will be used by legal, technical, and executive stakeholders to understand their compliance obligations and required actions.
</CONTEXT>

<AI_SYSTEM_DATA>
## System Information
- **System Name:** ${systemInfo?.name}
- **Description:** ${systemInfo?.description}
- **Technology Type:** ${systemInfo?.technology}
- **Organization Role:** ${systemInfo?.role}
- **EU Market Scope:** ${systemInfo?.euScope}
- **General Purpose AI (GPAI):** ${systemInfo?.gpai}

## Risk Classification
- **Classification Level:** ${classificationLabel}

## Use Case Profile
- **Sector:** ${useCaseInfo?.sector}
- **Decision Impact Level:** ${useCaseInfo?.decisionImpact}
- **Affected Persons:** ${useCaseInfo?.affectedPersons}
- **Product Type:** ${useCaseInfo?.productType}
- **Biometric Data Processing:** ${useCaseInfo?.biometricProcessing}
- **Sensitive Capabilities:** ${useCaseInfo?.sensitiveCaps}

## Current Compliance Status
- **Risk Management System:** ${complianceStatus?.riskManagement}
- **Data Governance & Documentation:** ${complianceStatus?.dataDocumentation}
- **Bias Testing & Fairness:** ${complianceStatus?.biasTest}
- **Technical Documentation:** ${complianceStatus?.technicalDocs}
- **Logging & Traceability:** ${complianceStatus?.logging}
- **User Instructions & Transparency:** ${complianceStatus?.instructions}
- **Human Oversight Design:** ${complianceStatus?.oversightDesign}
- **Override Capability:** ${complianceStatus?.overrideCapability}
- **Accuracy & Security Measures:** ${complianceStatus?.accuracySecurity}
</AI_SYSTEM_DATA>

<REPORT_REQUIREMENTS>
Generate a concise and highly consistent EU AI Act compliance report. The report must be brief, directly addressing the key points without unnecessary fluff. Use proper markdown formatting. Keep the output strictly to these 4 sections:

## Required Sections:

### 1. 📋 Executive Summary
- Provide a brief 1-2 paragraph overview.
- State the classification result and key implications.
- Give a quick readiness assessment.

### 2. ⚖️ Classification & Risk Analysis
- Briefly explain the reasoning for the classification.
- Note the primary risk factors (bullet points).

### 3. � Compliance Gap Analysis
- Use a markdown table to summarize critical gaps.
- Columns: Requirement area, Current State, Missing Action, Impact.

### 4. 🚨 Action Plan
- List 3-5 prioritized, specific next steps.
- Keep recommendations brief and actionable.
</REPORT_REQUIREMENTS>

<OUTPUT_FORMAT>
- Stay strictly within the requested 4-section structure.
- Always use the exact section headers provided above.
- Be extremely brief and avoid generic filler text.
- Use bullet points and tables to maximize readability and conciseness.
</OUTPUT_FORMAT>

<QUALITY_GUIDELINES>
- Never add external sections or appendices.
- Ensure the tone is direct, professional, and consistent across generations.
- Only reference exact article numbers if highly relevant to a critical gap.
- Focus strictly on practical, actionable insights relevant to the organization's role.
</QUALITY_GUIDELINES>

Generate the complete compliance report now.`;
}
