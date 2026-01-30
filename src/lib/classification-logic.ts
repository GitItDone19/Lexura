// EU AI Act Classification Logic

export type ClassificationType =
  | 'PROHIBITED'
  | 'HIGH_RISK_PROVIDER'
  | 'HIGH_RISK_DEPLOYER'
  | 'GPAI_PROVIDER'
  | 'GPAI_DEPLOYER'
  | 'LIMITED_RISK'
  | 'MINIMAL_RISK';

export type RoleType = 'PROVIDER' | 'DEPLOYER' | 'BOTH';

export interface ClassificationResult {
  classification: ClassificationType;
  role: RoleType;
  reasons: string[];
}

export function classifyAISystem(step1Data: any, step2Data: any): ClassificationResult {
  const role = determineRole(step1Data);

  // Check EU Scope first (now in step1Data)
  if (step1Data.euScope === 'no') {
    return {
      classification: 'MINIMAL_RISK',
      role,
      reasons: ['AI system does not affect people in the EU - EU AI Act may not apply'],
    };
  }

  // Check PROHIBITED first (most critical)
  const prohibitedCheck = checkProhibited(step2Data);
  if (prohibitedCheck.isProhibited) {
    return {
      classification: 'PROHIBITED',
      role,
      reasons: prohibitedCheck.reasons,
    };
  }

  // Check HIGH-RISK
  const highRiskCheck = checkHighRisk(step1Data, step2Data);
  if (highRiskCheck.isHighRisk) {
    return {
      classification: role === 'PROVIDER' ? 'HIGH_RISK_PROVIDER' : 'HIGH_RISK_DEPLOYER',
      role,
      reasons: highRiskCheck.reasons,
    };
  }

  // Check GPAI
  const gpaiCheck = checkGPAI(step1Data);
  if (gpaiCheck.isGPAI) {
    if (step1Data.gpaiCheck === 'develop') {
      return {
        classification: 'GPAI_PROVIDER',
        role,
        reasons: ['Develops/trains foundation model'],
      };
    } else {
      return {
        classification: 'GPAI_DEPLOYER',
        role,
        reasons: ['Integrates foundation model into product'],
      };
    }
  }

  // Check LIMITED RISK
  const limitedRiskCheck = checkLimitedRisk(step2Data);
  if (limitedRiskCheck.isLimitedRisk) {
    return {
      classification: 'LIMITED_RISK',
      role,
      reasons: limitedRiskCheck.reasons,
    };
  }

  // Default to MINIMAL RISK
  return {
    classification: 'MINIMAL_RISK',
    role,
    reasons: ['No high-risk, limited-risk, or prohibited characteristics identified'],
  };
}

function checkGPAI(step1Data: any): { isGPAI: boolean } {
  return {
    isGPAI: step1Data.gpaiCheck === 'develop' || step1Data.gpaiCheck === 'integrate',
  };
}

function checkProhibited(step2Data: any): { isProhibited: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Social scoring by government
  if (step2Data.sensitiveCaps?.includes('social_scoring') &&
    step2Data.sector === 'government') {
    reasons.push('⛔ Social scoring by government authorities (Article 5)');
  }

  // 2. Biometric categorization by sensitive attributes
  if (step2Data.sensitiveCaps?.includes('categorization')) {
    reasons.push('⛔ Biometric categorization by race, ethnicity, or religion (Article 5)');
  }

  // 3. Real-time biometric identification in public spaces
  if (step2Data.biometricProcessing === 'realtime_public') {
    reasons.push('⛔ Real-time biometric identification in publicly accessible spaces (Article 5)');
  }

  // 4. Criminal behavior prediction (ANY sector)
  if (step2Data.sensitiveCaps?.includes('criminal_prediction')) {
    reasons.push('⛔ Predicting criminal behavior based on profiling (Article 5)');
  }

  // 5. Emotion recognition in workplace/education
  if (step2Data.sensitiveCaps?.includes('emotion') &&
    (step2Data.sector === 'employment' || step2Data.sector === 'education')) {
    reasons.push('⛔ Emotion recognition in workplace/education (Article 5)');
  }

  return {
    isProhibited: reasons.length > 0,
    reasons,
  };
}

function checkHighRisk(step1Data: any, step2Data: any): { isHighRisk: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Employment + hiring/evaluation
  if (step2Data.sector === 'employment' &&
    (step2Data.decisionImpact?.includes('hiring') ||
      step2Data.decisionImpact?.includes('employee_eval'))) {
    reasons.push('Employment: Recruitment or worker management - Annex III(4)');
  }

  // Education + admissions/grading
  if (step2Data.sector === 'education' &&
    (step2Data.decisionImpact?.includes('admissions') ||
      step2Data.decisionImpact?.includes('grading'))) {
    reasons.push('Education: Admissions or assessment - Annex III(3)');
  }

  // Financial + credit/insurance
  if (step2Data.sector === 'financial' &&
    (step2Data.decisionImpact?.includes('credit') ||
      step2Data.decisionImpact?.includes('insurance'))) {
    reasons.push('Financial services: Credit or insurance decisions - Annex III(5)');
  }

  // Access to public benefits (any sector)
  if (step2Data.decisionImpact?.includes('benefits')) {
    reasons.push('Access to essential public services - Annex III(5)');
  }

  // Healthcare + medical device
  if (step2Data.sector === 'healthcare' && step2Data.productType === 'medical') {
    reasons.push('Healthcare: Medical device - Annex III(1)');
  }

  // Healthcare + medical diagnosis
  if (step2Data.sector === 'healthcare' &&
    step2Data.decisionImpact?.includes('medical')) {
    reasons.push('Healthcare: Medical diagnosis or treatment - Annex III(1)');
  }

  // Law enforcement + risk assessment
  if (step2Data.sector === 'law_enforcement' &&
    step2Data.decisionImpact?.includes('criminal_risk')) {
    reasons.push('Law enforcement: Risk assessment - Annex III(6)');
  }

  // Immigration + visa/border
  if (step2Data.sector === 'immigration' &&
    step2Data.decisionImpact?.includes('visa')) {
    reasons.push('Immigration: Visa or border control - Annex III(7)');
  }

  // Legal + criminal proceedings
  if (step2Data.sector === 'legal' &&
    step2Data.decisionImpact?.includes('criminal_risk')) {
    reasons.push('Legal: Criminal proceedings - Annex III(8)');
  }

  // Critical infrastructure
  if (step2Data.sector === 'infrastructure') {
    reasons.push('Critical infrastructure: Safety component - Annex III(2)');
  }

  // Remote biometric identification
  if (step2Data.biometricProcessing === 'remote') {
    reasons.push('Remote biometric identification - Annex III(1)');
  }

  // Embedded in regulated product
  if (step2Data.productType && ['medical', 'machinery', 'vehicle'].includes(step2Data.productType)) {
    reasons.push('Embedded in regulated product - Annex I');
  }

  return {
    isHighRisk: reasons.length > 0,
    reasons,
  };
}

function checkLimitedRisk(step2Data: any): { isLimitedRisk: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Chatbot/conversational agent
  if (step2Data.sensitiveCaps?.includes('chatbot')) {
    reasons.push('Chatbot or conversational agent - Article 50(1)');
  }

  // Synthetic content generation
  if (step2Data.sensitiveCaps?.includes('synthetic')) {
    reasons.push('Generates synthetic content - Article 50(4)');
  }

  // Emotion recognition - ONLY if NOT in workplace/education (those are prohibited)
  if (step2Data.sensitiveCaps?.includes('emotion') &&
    step2Data.sector !== 'employment' &&
    step2Data.sector !== 'education') {
    reasons.push('Emotion recognition - Article 50(2)');
  }

  // Biometric verification (1:1)
  if (step2Data.biometricProcessing === 'verification') {
    reasons.push('Biometric verification (1:1 matching) - Article 50(2)');
  }

  return {
    isLimitedRisk: reasons.length > 0,
    reasons,
  };
}

function determineRole(step1Data: any): RoleType {
  if (step1Data.ownership === 'inhouse') {
    return 'PROVIDER';
  } else if (step1Data.ownership === 'vendor' || step1Data.ownership === 'api') {
    return 'DEPLOYER';
  } else if (step1Data.ownership === 'combination') {
    return 'BOTH';
  }
  return 'DEPLOYER';
}