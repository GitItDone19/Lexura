"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';

export default function NewAssessmentPage() {
  const router = useRouter();

  useEffect(() => {
    const createAssessment = async () => {
      try {
        const response = await fetch('/api/assessments', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/app/assessment/${data.id}/step1`);
        } else {
          console.error('Failed to create assessment');
          router.push('/app');
        }
      } catch (error) {
        console.error('Error creating assessment:', error);
        router.push('/app');
      }
    };

    createAssessment();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2Icon className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Creating new assessment...</p>
      </div>
    </div>
  );
}
