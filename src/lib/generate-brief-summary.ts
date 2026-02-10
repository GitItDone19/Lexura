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
Generate a comprehensive EU AI Act compliance report with the following structure. Use proper markdown formatting with headers, bullet points, tables where appropriate, and clear visual hierarchy.

## Required Sections:

### 1. 📋 Executive Summary
- Provide a high-level overview (3-4 paragraphs)
- State the classification result and key implications
- Highlight the most critical compliance gaps
- Include an overall compliance readiness score (percentage estimate)

### 2. ⚖️ Classification Analysis
- Explain WHY this system received its classification
- Reference specific EU AI Act articles (Article 5, 6, 7, etc.)
- Detail the risk factors that influenced the classification
- Note any borderline considerations or edge cases

### 3. 📊 Compliance Requirements Matrix
Create a structured overview of ALL applicable requirements:
- List each requirement with its corresponding EU AI Act Article
- Indicate requirement priority (Critical/High/Medium/Low)
- Show current status vs. required status
- Use a table format for clarity

### 4. 🔍 Gap Analysis
For each compliance area:
- Current State: What exists today
- Required State: What the EU AI Act mandates
- Gap: What's missing or inadequate
- Impact: Consequences of non-compliance

### 5. 🚨 Critical Actions Required
Provide a prioritized action plan:
- Immediate Actions (0-3 months): Urgent compliance gaps
- Short-term Actions (3-6 months): Important improvements
- Medium-term Actions (6-12 months): Full compliance maturity
Include estimated effort and resources for each action

### 6. 📅 Compliance Timeline & Deadlines
- Key EU AI Act implementation dates
- Organization-specific milestones
- Recommended internal deadlines
- Grace periods and transition provisions

### 7. 💰 Risk & Penalty Assessment
- Potential fines for non-compliance (cite Article 99)
- Reputational and operational risks
- Market access implications
- Civil liability considerations

### 8. ✅ Recommendations
- Strategic recommendations for compliance program
- Quick wins for immediate improvement
- Long-term governance structure suggestions
- Best practices and industry standards to adopt

### 9. 📎 Reference Appendix
- List all cited EU AI Act articles with brief descriptions
- Key definitions from Article 3
- Relevant annexes (Annex I, II, III, IV, etc.)
- Useful external resources and guidance documents
</REPORT_REQUIREMENTS>

<OUTPUT_FORMAT>
- Use markdown formatting throughout
- Use headers (##, ###) for section hierarchy
- Use bullet points and numbered lists for clarity
- Include tables where data comparison is helpful
- Use **bold** for emphasis on key terms
- Use \`code formatting\` for article references
- Use blockquotes for important warnings or notes
- Ensure the report is scannable and professionally formatted
- Aim for comprehensive coverage while remaining actionable
</OUTPUT_FORMAT>

<QUALITY_GUIDELINES>
- Be specific and cite exact article numbers
- Provide actionable, practical guidance
- Consider the organization's role (Provider vs Deployer)
- Account for the classification level in all recommendations
- Balance regulatory compliance with business practicality
- Use professional but accessible language
- Avoid generic or boilerplate content
</QUALITY_GUIDELINES>

Generate the complete compliance report now.`;
}
