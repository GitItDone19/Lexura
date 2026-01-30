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
  const { step1Data, step2Data, step3Data } = data;

  // Collect all responses as they are, without shortening
  const responses: string[] = [];

  // Step 1 responses
  if (step1Data) {
    Object.entries(step1Data).forEach(([key, value]) => {
      if (value && key !== 'classification') {
        const label = fieldLabels[key] || key;
        responses.push(
          `${label}: ${Array.isArray(value) ? value.join(', ') : value}`
        );
      }
    });
  }

  // Step 2 responses
  if (step2Data) {
    Object.entries(step2Data).forEach(([key, value]) => {
      if (value && key !== 'classification') {
        const label = fieldLabels[key] || key;
        responses.push(
          `${label}: ${Array.isArray(value) ? value.join(', ') : value}`
        );
      }
    });
  }

  // Step 3 responses
  if (step3Data) {
    Object.entries(step3Data).forEach(([key, value]) => {
      if (value && key !== 'classification') {
        const label = fieldLabels[key] || key;
        responses.push(
          `${label}: ${Array.isArray(value) ? value.join(', ') : value}`
        );
      }
    });
  }

  // Join all responses
  return responses.join('. ');
}
