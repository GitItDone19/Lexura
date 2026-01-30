import { ClassificationType } from './classification-logic';

interface AssessmentData {
  step1Data: any;
  step2Data: any;
  step3Data: any;
  classification: ClassificationType;
}

export function generateReportPrompt(data: AssessmentData): string {
  const { step1Data, step2Data, step3Data, classification } = data;

  // Build context from user responses
  const systemName = step1Data?.systemName || 'Unnamed AI System';
  const description = step1Data?.description || 'No description provided';
  const euScope = step1Data?.euScope;
  const technologyTypes = step1Data?.technologyType || [];
  const gpaiCheck = step1Data?.gpaiCheck;
  const ownership = step1Data?.ownership;

  const sector = step2Data?.sector;
  const decisionImpact = step2Data?.decisionImpact || [];
  const affectedPersons = step2Data?.affectedPersons || [];
  const productType = step2Data?.productType;
  const biometricProcessing = step2Data?.biometricProcessing;
  const sensitiveCaps = step2Data?.sensitiveCaps || [];

  // Build the prompt
  let prompt = `You are an EU AI Act compliance expert. Generate a comprehensive compliance report for the following AI system.

# AI System Information
- **System Name**: ${systemName}
- **Description**: ${description}
- **EU Scope**: ${euScope === 'yes' ? 'Affects people in the EU' : euScope === 'no' ? 'Does not affect people in the EU' : 'Uncertain'}
- **Technology Types**: ${technologyTypes.join(', ')}
- **Development Type**: ${gpaiCheck === 'develop' ? 'Develops foundation model' : gpaiCheck === 'integrate' ? 'Integrates foundation model' : 'Purpose-built'}
- **Ownership**: ${ownership}

# Use Case Details
- **Sector**: ${sector}
- **Decision Impact**: ${decisionImpact.join(', ')}
- **Affected Persons**: ${affectedPersons.join(', ')}
- **Product Type**: ${productType}
- **Biometric Processing**: ${biometricProcessing}
- **Sensitive Capabilities**: ${sensitiveCaps.join(', ')}

# Classification Result
**${classification.replace(/_/g, ' ')}**

`;

  // Add classification-specific context
  if (classification === 'PROHIBITED') {
    prompt += `
# Compliance Assessment
This AI system has been classified as **PROHIBITED** under Article 5 of the EU AI Act.

Please provide:
1. **Prohibition Explanation**: Explain which specific prohibited practice(s) this system falls under
2. **Legal Implications**: Detail the penalties and enforcement timeline
3. **Immediate Actions Required**: List urgent steps the organization must take
4. **Redesign Recommendations**: Suggest how the system could be fundamentally redesigned to avoid prohibition
5. **Legal Resources**: Recommend consulting with legal counsel specializing in EU AI Act

Keep the tone serious and urgent. This is a critical compliance issue.
`;
  } else if (classification === 'MINIMAL_RISK') {
    prompt += `
# Compliance Assessment
This AI system has been classified as **MINIMAL RISK**.

Please provide:
1. **Classification Explanation**: Explain why this system is minimal risk
2. **Voluntary Best Practices**: Recommend voluntary codes of conduct and trustworthy AI principles
3. **Future Considerations**: Advise on monitoring for changes that could increase risk level
4. **Documentation Recommendations**: Suggest basic documentation practices
5. **Competitive Advantages**: Explain how following voluntary standards can benefit the organization

Keep the tone positive and encouraging.
`;
  } else if (classification === 'LIMITED_RISK') {
    prompt += `
# Step 3 Responses (Transparency Requirements)
${Object.entries(step3Data || {}).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

# Compliance Assessment
This AI system has been classified as **LIMITED RISK** with transparency obligations.

Please provide:
1. **Transparency Requirements**: Detail the specific transparency obligations under Article 50
2. **Current Compliance Status**: Assess their responses to transparency questions
3. **Implementation Guidance**: Provide practical steps to meet transparency requirements
4. **User Communication Templates**: Suggest how to inform users about AI usage
5. **Labeling Requirements**: Explain how to properly label AI-generated content
6. **Compliance Timeline**: Outline when these requirements take effect
7. **Penalties for Non-Compliance**: Explain consequences of failing to meet transparency obligations

Keep the tone practical and actionable.
`;
  } else if (classification.includes('HIGH_RISK')) {
    const isProvider = classification === 'HIGH_RISK_PROVIDER';
    
    prompt += `
# Step 3 Responses (${isProvider ? 'Provider' : 'Deployer'} Requirements)
${Object.entries(step3Data || {}).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

# Compliance Assessment
This AI system has been classified as **HIGH-RISK** (${isProvider ? 'Provider' : 'Deployer'} role).

Please provide:
1. **High-Risk Classification Explanation**: Explain which Annex III category this falls under
2. **Compliance Requirements**: Detail all mandatory requirements (Articles 8-15 for providers, Article 26 for deployers)
3. **Current Compliance Gap Analysis**: Assess their Step 3 responses and identify gaps
4. **Risk Management System**: ${isProvider ? 'Explain requirements for establishing a risk management system' : 'Explain how to work with provider\'s risk management'}
5. **Data Governance**: Detail requirements for training data quality and documentation
6. **Technical Documentation**: Specify what documentation must be maintained
7. **Transparency and Human Oversight**: Explain requirements for human oversight and user information
8. **Conformity Assessment**: Explain the conformity assessment procedure required
9. **Implementation Roadmap**: Provide a phased approach to achieving compliance
10. **Timeline and Penalties**: Explain enforcement dates and penalties for non-compliance

Keep the tone detailed and technical but accessible.
`;
  } else if (classification.includes('GPAI')) {
    const isProvider = classification === 'GPAI_PROVIDER';
    
    prompt += `
# Step 3 Responses (GPAI ${isProvider ? 'Provider' : 'Deployer'} Requirements)
${Object.entries(step3Data || {}).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

# Compliance Assessment
This AI system has been classified as **GENERAL PURPOSE AI** (${isProvider ? 'Provider' : 'Deployer'} role).

Please provide:
1. **GPAI Classification Explanation**: Explain what qualifies as general-purpose AI
2. **Specific Requirements**: Detail obligations under Chapter V (Articles 51-56)
3. **Current Compliance Status**: Assess their Step 3 responses
4. **Technical Documentation**: Explain documentation requirements for GPAI models
5. **Copyright Compliance**: Detail requirements for respecting copyright in training data
6. **Transparency Obligations**: Explain requirements for publishing training data summaries
7. **Systemic Risk Assessment**: If applicable, explain requirements for GPAI with systemic risk
8. **Implementation Steps**: Provide practical guidance for compliance
9. **Timeline**: Explain when GPAI requirements take effect

Keep the tone specialized for foundation model developers/deployers.
`;
  }

  prompt += `

# Report Format Requirements
Structure the report with:
- **Executive Summary** (2-3 paragraphs)
- **Classification Details** (detailed explanation)
- **Compliance Requirements** (comprehensive list with article references)
- **Gap Analysis** (based on their responses)
- **Recommendations** (prioritized action items)
- **Timeline** (enforcement dates and milestones)
- **Resources** (links to official EU AI Act resources)

Use clear headings, bullet points, and make it actionable. Reference specific articles of the EU AI Act where relevant.
`;

  return prompt;
}
