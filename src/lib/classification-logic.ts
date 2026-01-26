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
  prohibitedReason?: string;
}

export function classifyAISystem(step1Data: any, step2Data: any): ClassificationResult {
  const reasons: string[] = [];

  // Check PROHIBITED first (highest priority)
  const prohibitedCheck = checkProhibited(step2Data);
  if (prohibitedCheck.isProhibited) {
    return {
      classification: 'PROHIBITED',
      role: determineRole(step1Data),
      reasons: prohibitedCheck.reasons,
      prohibitedReason: prohibitedCheck.specificReason,
    };
  }

  // Check GPAI
  const gpaiCheck = checkGPAI(step1Data);
  if (gpaiCheck.isGPAI) {
    const role = determineRole(step1Data);
    if (step1Data.gpaiCheck === 'develop') {
      return {
        classification: 'GPAI_PROVIDER',
        role,
        reasons: ['Develops/trains foundation model'],
      };
    } else {
      // Continue to check if also high-risk
      const highRiskCheck = checkHighRisk(step1Data, step2Data);
      if (highRiskCheck.isHighRisk) {
        return {
          classification: role === 'PROVIDER' ? 'HIGH_RISK_PROVIDER' : 'HIGH_RISK_DEPLOYER',
          role,
          reasons: [...highRiskCheck.reasons, 'Also integrates GPAI model'],
        };
      }
      return {
        classification: 'GPAI_DEPLOYER',
        role,
        reasons: ['Integrates foundation model into product'],
      };
    }
  }

  // Check HIGH-RISK
  const highRiskCheck = checkHighRisk(step1Data, step2Data);
  if (highRiskCheck.isHighRisk) {
    const role = determineRole(step1Data);
    return {
      classification: role === 'PROVIDER' ? 'HIGH_RISK_PROVIDER' : 'HIGH_RISK_DEPLOYER',
      role,
      reasons: highRiskCheck.reasons,
    };
  }

  // Check LIMITED RISK
  const limitedRiskCheck = checkLimitedRisk(step2Data);
  if (limitedRiskCheck.isLimitedRisk) {
    return {
      classification: 'LIMITED_RISK',
      role: determineRole(step1Data),
      reasons: limitedRiskCheck.reasons,
    };
  }

  // Default to MINIMAL RISK
  return {
    classification: 'MINIMAL_RISK',
    role: determineRole(step1Data),
    reasons: ['No high-risk, limited-risk, or prohibited characteristics identified'],
  };
}

function checkProhibited(step2Data: any): { isProhibited: boolean; reasons: string[]; specificReason?: string } {
  const reasons: string[] = [];

  // Social scoring by government
  if (step2Data.sensitiveCaps?.includes('social_scoring') &&
    step2Data.sector === 'government') {
    return {
      isProhibited: true,
      reasons: ['Social scoring by government authorities'],
      specificReason: 'Social scoring (rating citizens based on behavior) - Article 5(1)(c)',
    };
  }

  // Biometric categorization by sensitive attributes
  if (step2Data.sensitiveCaps?.includes('categorization')) {
    return {
      isProhibited: true,
      reasons: ['Biometric categorization by race, ethnicity, or religion'],
      specificReason: 'Biometric categorization by race, ethnicity, or religion - Article 5(1)(b)',
    };
  }

  // Real-time biometric identification in public spaces
  if (step2Data.biometricProcessing === 'realtime_public') {
    return {
      isProhibited: true,
      reasons: ['Real-time biometric identification in publicly accessible spaces'],
      specificReason: 'Real-time remote biometric identification in publicly accessible spaces - Article 5(1)(d)',
    };
  }

  // Predicting criminal behavior based solely on profiling (outside law enforcement context)
  if (step2Data.sensitiveCaps?.includes('criminal_prediction') &&
    step2Data.sector !== 'law_enforcement') {
    return {
      isProhibited: true,
      reasons: ['Predicting criminal behavior based on profiling outside law enforcement context'],
      specificReason: 'AI systems predicting criminal behavior based solely on profiling or personality traits - Article 5(1)(d)',
    };
  }

  return { isProhibited: false, reasons: [] };
}

function checkGPAI(step1Data: any): { isGPAI: boolean } {
  return {
    isGPAI: step1Data.gpaiCheck === 'develop' || step1Data.gpaiCheck === 'integrate',
  };
}

function checkHighRisk(step1Data: any, step2Data: any): { isHighRisk: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Employment + hiring/evaluation
  if (step2Data.sector === 'employment' &&
    (step2Data.decisionImpact?.includes('hiring') || step2Data.decisionImpact?.includes('employee_eval'))) {
    reasons.push('Employment: Recruitment or worker management - Annex III(4)');
  }

  // Education + admissions/grading
  if (step2Data.sector === 'education' &&
    (step2Data.decisionImpact?.includes('admissions') || step2Data.decisionImpact?.includes('grading'))) {
    reasons.push('Education: Admissions or assessment - Annex III(3)');
  }

  // Financial + credit/insurance
  if (step2Data.sector === 'financial' &&
    (step2Data.decisionImpact?.includes('credit') || step2Data.decisionImpact?.includes('insurance'))) {
    reasons.push('Financial services: Credit or insurance decisions - Annex III(5)');
  }

  // Healthcare + medical device
  if (step2Data.sector === 'healthcare' && step2Data.productType === 'medical') {
    reasons.push('Healthcare: Medical device - Annex III(1)');
  }

  // Law enforcement + risk assessment
  if (step2Data.sector === 'law_enforcement' && step2Data.decisionImpact?.includes('criminal_risk')) {
    reasons.push('Law enforcement: Risk assessment - Annex III(6)');
  }

  // Immigration + visa/border
  if (step2Data.sector === 'immigration' && step2Data.decisionImpact?.includes('visa')) {
    reasons.push('Immigration: Visa or border control - Annex III(7)');
  }

  // Legal + criminal proceedings
  if (step2Data.sector === 'legal' && step2Data.decisionImpact?.includes('criminal_risk')) {
    reasons.push('Legal: Criminal proceedings - Annex III(8)');
  }

  // Critical infrastructure
  if (step2Data.sector === 'infrastructure') {
    reasons.push('Critical infrastructure: Safety component - Annex III(2)');
  }

  // Biometric identification (not prohibited)
  if (step2Data.biometricProcessing === 'remote' || step2Data.biometricProcessing === 'verification') {
    reasons.push('Biometric identification system - Annex III(1)');
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

  // Emotion recognition (not in high-risk context)
  if (step2Data.sensitiveCaps?.includes('emotion')) {
    reasons.push('Emotion recognition - Article 50(2)');
  }

  // Biometric verification only (1:1) - only if NOT already high-risk
  // Note: This is transparency-oriented, high-risk biometric handled separately
  // Only add to limited risk if it's pure verification without other high-risk factors
  if (step2Data.biometricProcessing === 'verification' &&
    !step2Data.sensitiveCaps?.includes('categorization')) {
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
  return 'DEPLOYER'; // Default
}
