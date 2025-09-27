// Predefined mock benefits for specific categories used instead of AI generation.
// All coverage values are illustrative and aligned with common Indian group health / OPD add‑on ranges.
export interface MockBenefit {
  title: string;
  coverage: string; // Always include INR coverage wording
  description: string;
}

export const MOCK_BENEFIT_CATEGORIES = ['Vision','OPD','Mental Health','Dental'] as const;

export const mockBenefits: Record<string, MockBenefit[]> = {
  Vision: [
    {
      title: 'Annual Eye Examination',
      coverage: 'Covers one comprehensive eye exam up to ₹1,200 per policy year',
      description: 'Routine ophthalmic check including refraction, vision acuity, and basic retina screening once a year.'
    },
    {
      title: 'Prescription Lenses & Frames',
      coverage: 'Reimburses corrective lenses / frames up to ₹2,000 every 24 months',
      description: 'Support for upgrading prescribed spectacles or lenses when power changes or frames wear out.'
    },
    {
      title: 'Computer Vision Support',
      coverage: 'Specialist consultation for digital eye strain up to ₹800 per visit (2 visits)',
      description: 'Addresses dry eyes, headaches, or screen fatigue with ergonomic and ocular surface guidance.'
    }
  ],
  OPD: [
    {
      title: 'General Physician Consultation',
      coverage: 'Up to 4 GP consultations per year (max ₹600 per visit)',
      description: 'Covers routine evaluation of fever, infections, mild respiratory or digestive issues at network clinics.'
    },
    {
      title: 'Preventive Health Check',
      coverage: 'Basic panel (CBC, FBS, Lipids) once annually up to ₹2,500',
      description: 'Encourages proactive screening for metabolic risks and early detection of lifestyle diseases.'
    },
    {
      title: 'Vaccination Allowance',
      coverage: 'Eligible adult / booster vaccines reimbursed up to ₹3,000 yearly',
      description: 'Supports immunization continuity (e.g., influenza, tetanus) subject to medical recommendation.'
    }
  ],
  'Mental Health': [
    {
      title: 'Therapy / Counseling Sessions',
      coverage: 'Up to 6 psychologist sessions per year (₹1,500 cap each)',
      description: 'Structured mental wellbeing support for anxiety, stress management, or mood stabilization.'
    },
    {
      title: 'Tele‑Mental Health Access',
      coverage: 'Unlimited chat + 2 video consults per month (₹1,200 each cap)',
      description: 'Remote continuity of care with licensed professionals while reducing travel and wait time.'
    },
    {
      title: 'Mindfulness & Resilience Program',
      coverage: 'Workshop / guided modules reimbursement up to ₹2,000 annually',
      description: 'Evidence‑based group sessions focusing on stress buffering, breath work, and emotional regulation.'
    }
  ],
  Dental: [
    {
      title: 'Preventive Dental Care',
      coverage: 'Scaling, polishing & exam once every 6 months (₹1,200 cap each visit)',
      description: 'Reduces tartar, bleeding gums, and early periodontal issues through professional cleaning.'
    },
    {
      title: 'Basic Restorative Procedures',
      coverage: 'Simple fillings / temporary dressing coverage up to ₹3,000 yearly',
      description: 'Addresses early caries or minor tooth structural loss before complex intervention is needed.'
    },
    {
      title: 'Emergency Dental Relief',
      coverage: 'Urgent pain management / infection control up to ₹2,500 per event',
      description: 'Supports acute dental crises (pain, swelling) until definitive treatment planning.'
    }
  ]
};
