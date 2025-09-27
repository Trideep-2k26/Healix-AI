import { GoogleGenerativeAI } from '@google/generative-ai';

interface BenefitCard {
  title: string;
  description: string;
  coverage?: string;
  note?: string;
}

interface ConsultantInfo {
  name: string;
  specialty: string;
  hospital: string;
  distance: string;
  phone?: string;
  address?: string;
}

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private useMockAI: boolean;

  constructor() {
    this.useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';
    if (!this.useMockAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        try {
          this.genAI = new GoogleGenerativeAI(apiKey);
          this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
          console.log('AIService: Gemini initialized successfully');
        } catch (error) {
          console.error('AIService: Failed to initialize Gemini:', error);
          this.useMockAI = true;
        }
      } else {
        console.log('AIService: No API key provided, using mock AI');
        this.useMockAI = true;
      }
    } else {
      console.log('AIService: Using mock AI mode');
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.model) throw new Error('Gemini model not initialized');
    try {
      console.log('AIService: Calling Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('AIService: Gemini response received');
      return text;
    } catch (error) {
      console.error('AIService: Gemini API call failed:', error);
      throw error;
    }
  }

  async classifyConcern(query: string, location?: string): Promise<{category: string, issue_summary: string, confidence: number, reasoning: string}> {
    const isValidHealthQuery = this.validateHealthQuery(query);
    if (!isValidHealthQuery) {
      throw new Error("Please describe a genuine health concern, symptom, or medical issue. Examples: 'stomach pain', 'headache', 'anxiety', 'chest pain', 'tooth ache', etc.");
    }
    const mockResult = this.checkMockCategories(query);
    if (mockResult) return mockResult;
    try {
      if (!this.useMockAI && this.model) {
        const prompt = `You are a medical classification AI for the INDIAN healthcare system. 

CRITICAL VALIDATION: You must first determine if this is a genuine health concern. 

REJECT these types of inputs by responding with INVALID:
- Questions about people ("who is modi", "what is trump")  
- Random names or entities
- Non-medical topics (sports, entertainment, politics, weather)
- Test words (hello, hi, test, sample)
- General questions not about health symptoms

ONLY ACCEPT inputs that describe:
- Physical symptoms (pain, fever, headache, nausea, etc.)
- Medical conditions (diabetes, anxiety, infection, etc.)  
- Body part problems (chest pain, back ache, tooth pain, etc.)
- Health concerns requiring medical attention

If the input is NOT a genuine health concern, respond with:
{"category": "INVALID", "issue_summary": "Not a health concern", "confidence": 0.0, "reasoning": "Input does not describe a health issue or symptom"}

If it IS a genuine health concern, classify into the most specific medical specialty.

CONTEXT: Patient is in India ${location ? `(specifically in ${location})` : ''}

SPECIALTIES FOR INDIA:
1. If matches Vision, Dental, Mental Health, OPD - classify accordingly
2. Otherwise: Neurology, Cardiology, Orthopedics, Dermatology, Gastroenterology, etc.
3. Do not default to OPD for specific issues.

Return ONLY valid JSON:
{
  "category": "Gastroenterology",
  "issue_summary": "brief description of the health issue",
  "confidence": 0.9,
  "reasoning": "why this specialty was chosen"
}

Health concern: "${query}"`;
        const response = await this.callGeminiAPI(prompt);
        try {
          const result = JSON.parse(response.trim());
          if (result && result.category === 'INVALID') {
            throw new Error("Please describe a genuine health concern, symptom, or medical issue. Examples: 'stomach pain', 'headache', 'anxiety', 'chest pain', 'tooth ache', etc.");
          }
          if (result && typeof result.category === 'string' && typeof result.issue_summary === 'string' && typeof result.reasoning === 'string' && typeof result.confidence === 'number') {
            return result;
          }
        } catch {
          console.log('AIService: Failed to parse AI classification');
        }
      }
      const result = this.classifyWithRules(query);
      return result;
    } catch (error) {
      console.error('AIService: Classification failed:', error);
      const result = this.classifyWithRules(query);
      return result;
    }
  }

  private checkMockCategories(query: string): {category: string, issue_summary: string, confidence: number, reasoning: string} | null {
    const lowerText = query.toLowerCase();
    if (!this.validateHealthQuery(query)) return null;
    if (lowerText.includes('anxiety') || lowerText.includes('depression') || 
        lowerText.includes('stress') || lowerText.includes('mental') ||
        lowerText.includes('mood') || lowerText.includes('panic') || 
        lowerText.includes('worried') || lowerText.includes('therapy')) {
      return { category: 'Mental Health', issue_summary: 'Mental health concern requiring psychological support', confidence: 0.9, reasoning: 'Mental health symptoms detected' };
    }
    if (lowerText.includes('tooth') || lowerText.includes('dental') || 
        lowerText.includes('gum') || lowerText.includes('toothache') ||
        lowerText.includes('jaw pain') || lowerText.includes('aching')) {
      return { category: 'Dental', issue_summary: 'Dental problem requiring dental specialist consultation', confidence: 0.95, reasoning: 'Dental-related concern identified' };
    }
    if (lowerText.includes('eye') || lowerText.includes('vision') || 
        lowerText.includes('sight') || lowerText.includes('blurry') ||
        lowerText.includes('glasses') || lowerText.includes('lens')) {
      return { category: 'Vision', issue_summary: 'Eye or vision-related issue needing examination', confidence: 0.85, reasoning: 'Vision-related symptoms detected' };
    }
    if (lowerText.includes('fever') || lowerText.includes('cold') || 
        lowerText.includes('cough') || lowerText.includes('general checkup') ||
        lowerText.includes('routine checkup')) {
      return { category: 'OPD', issue_summary: 'General health concern suitable for outpatient consultation', confidence: 0.8, reasoning: 'General symptoms suitable for OPD' };
    }
    return null;
  }

  private validateHealthQuery(query: string): boolean {
    const lowerText = query.toLowerCase().trim();
    if (lowerText.length < 3) return false;
    const nonHealthPatterns = [
      /^(who is|what is|where is|when is|how is)/i,
      /^(hello|hi|hey|test|testing|sample|demo)$/i,
      /^\d+$/,
      /^[!@#$%^&*()]+$/,
      /^[a-z]{1,4}$/i,
      /(modi|trump|biden|celebrity|politician|actor|singer)/i,
      /(football|cricket|movie|song|game|weather|news)/i,
    ];
    if (nonHealthPatterns.some(pattern => pattern.test(lowerText))) return false;
    const healthKeywords = [
      'pain', 'ache', 'hurt', 'sore', 'burning', 'itching', 'swelling', 'fever', 'headache', 'migraine',
      'nausea', 'vomiting', 'diarrhea', 'constipation', 'cough', 'cold', 'flu', 'fatigue', 'tired',
      'dizzy', 'weakness', 'shortness', 'breathing', 'chest', 'heart', 'stomach', 'abdomen', 'back',
      'neck', 'shoulder', 'joint', 'muscle', 'skin', 'rash', 'allergy', 'infection', 'wound',
      'head', 'eye', 'ear', 'nose', 'throat', 'mouth', 'tooth', 'teeth', 'gum', 'tongue',
      'arm', 'leg', 'hand', 'foot', 'finger', 'toe', 'knee', 'elbow', 'wrist', 'ankle',
      'diabetes', 'hypertension', 'asthma', 'arthritis', 'depression', 'anxiety', 'stress',
      'insomnia', 'sleep', 'blood', 'sugar', 'pressure', 'cholesterol', 'weight', 'obesity',
      'medical', 'health', 'doctor', 'treatment', 'medicine', 'prescription', 'checkup',
      'symptoms', 'diagnosis', 'therapy', 'surgery', 'hospital', 'clinic', 'emergency',
      'sick', 'ill', 'disease', 'condition', 'problem', 'issue', 'concern', 'trouble',
      'uncomfortable', 'discomfort', 'bleeding', 'discharge', 'swollen', 'inflammation',
      'feel', 'feeling', 'hurt', 'hurting', 'bothering', 'suffering'
    ];
    return healthKeywords.some(keyword => lowerText.includes(keyword));
  }

  private classifyWithRules(text: string): {category: string, issue_summary: string, confidence: number, reasoning: string} {
    const lowerText = text.toLowerCase();
    if (!this.validateHealthQuery(text)) {
      throw new Error("Please describe a genuine health concern, symptom, or medical issue. Examples: 'stomach pain', 'headache', 'anxiety', 'chest pain', 'tooth ache', etc.");
    }
    if (lowerText.includes('nerve') || lowerText.includes('neurological') || 
        lowerText.includes('seizure') || lowerText.includes('brain') ||
        lowerText.includes('migraine') || lowerText.includes('neurology')) {
      return { category: 'Neurology', issue_summary: 'Neurological concern requiring specialist evaluation', confidence: 0.9, reasoning: 'Neurological symptoms detected requiring neurology consultation' };
    }
    if (lowerText.includes('back pain') || lowerText.includes('joint pain') ||
        lowerText.includes('spine') || lowerText.includes('orthopedic')) {
      return { category: 'Orthopedics', issue_summary: 'Musculoskeletal concern requiring orthopedic evaluation', confidence: 0.9, reasoning: 'Musculoskeletal symptoms detected' };
    }
    if (lowerText.includes('heart') || lowerText.includes('chest pain') ||
        lowerText.includes('cardiac') || lowerText.includes('palpitation')) {
      return { category: 'Cardiology', issue_summary: 'Cardiac concern requiring cardiologist consultation', confidence: 0.85, reasoning: 'Cardiac symptoms detected' };
    }
    if (lowerText.includes('skin') || lowerText.includes('rash') ||
        lowerText.includes('acne') || lowerText.includes('dermatology')) {
      return { category: 'Dermatology', issue_summary: 'Skin condition requiring dermatologist consultation', confidence: 0.8, reasoning: 'Dermatological symptoms detected' };
    }
    return { category: 'General Medicine', issue_summary: 'Health concern requiring medical evaluation', confidence: 0.6, reasoning: 'General health concern requiring professional assessment' };
  }

  async generateBenefits(issue: string, category: string): Promise<BenefitCard[]> {
    const mockCategories = ['Mental Health', 'Dental', 'Vision', 'OPD'];
    if (mockCategories.includes(category)) {
      console.log(`AIService: Using mock benefits for ${category}`);
      return this.generateMockBenefits(category);
    }
    console.log(`AIService: Using AI benefits generation for ${category}`);
    let lastError: any;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (!this.useMockAI && this.model) {
          console.log(`AIService: Benefits generation attempt ${attempt} for ${category}`);
          const prompt = `Generate 3-4 healthcare benefits for "${issue}" classified as ${category} specialty.

Return ONLY a valid JSON array with this exact structure:
[
  {"title": "Benefit Name", "description": "Detailed benefit description"},
  {"title": "Another Benefit", "description": "Another detailed description"}
]

Requirements:
- Focus on medical treatments, consultations, and wellness programs
- Be specific to ${category} specialty
- Each description should be 15-25 words
- No insurance or payment information

Health issue: "${issue}"
Medical specialty: ${category}`;
          const response = await this.callGeminiAPI(prompt);
          console.log(`AIService: Raw response:`, response.substring(0, 200));
          let cleanResponse = response.trim();
          const jsonStart = cleanResponse.indexOf('[');
          const jsonEnd = cleanResponse.lastIndexOf(']') + 1;
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
          }
          const result = JSON.parse(cleanResponse);
          if (Array.isArray(result) && result.length > 0) {
            console.log(`AIService: Successfully generated ${result.length} benefits for ${category}`);
            return result;
          }
        }
        throw new Error(`No valid benefits generated for ${category}`);
      } catch (error) {
        console.error(`AIService: Benefits generation attempt ${attempt} failed:`, error);
        lastError = error;
        if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error(`AI benefits generation failed after 3 attempts for ${category}: ${lastError ? (lastError as Error).message : 'Unknown error'}`);
  }

  private generateMockBenefits(category: string): BenefitCard[] {
    const benefitsMap: Record<string, BenefitCard[]> = {
      'Mental Health': [
        { title: 'Counseling & Therapy Sessions', description: 'Professional mental health support including individual counseling, group therapy, and cognitive behavioral therapy.', coverage: 'Individual therapy, group counseling, stress management, anxiety treatment' },
        { title: 'Mental Health Assessment', description: 'Comprehensive psychological evaluation to assess mental health status and create personalized treatment plans.', coverage: 'Psychological testing, mental health screening, treatment planning' },
        { title: 'Wellness & Mindfulness Programs', description: 'Programs focused on mental wellness including meditation, yoga, stress reduction techniques.', coverage: 'Meditation sessions, yoga classes, stress management workshops' },
        { title: '24/7 Mental Health Support', description: 'Round-the-clock crisis intervention and mental health support hotline.', coverage: 'Crisis counseling, emergency mental health support, helpline access' }
      ],
      'Dental': [
        { title: 'Preventive Dental Care', description: 'Regular dental checkups, cleaning, and preventive treatments to maintain oral health.', coverage: 'Dental cleaning, oral examination, fluoride treatment, dental X-rays' },
        { title: 'Restorative Dental Treatment', description: 'Treatment for dental problems including fillings, root canal therapy, and tooth restoration.', coverage: 'Dental fillings, root canal treatment, crown placement, tooth extraction' },
        { title: 'Emergency Dental Care', description: '24/7 emergency dental services for urgent dental problems and pain relief.', coverage: 'Emergency dental consultation, pain management, urgent dental procedures' }
      ],
      'Vision': [
        { title: 'Eye Consultation', description: 'Consult with an ophthalmologist for vision-related concerns.' },
        { title: 'Glasses & Lenses Coverage', description: 'Access to corrective eyewear and optometry services.' }
      ],
      'Ophthalmology': [
        { title: 'Eye Consultation', description: 'Consult with an ophthalmologist for vision-related concerns.' },
        { title: 'Glasses & Lenses Coverage', description: 'Access to corrective eyewear and optometry services.' }
      ],
      'OPD': [
        { title: 'General Physician Consultation', description: 'Meet a general doctor for primary care checkups.' },
        { title: 'Specialist Referral', description: 'Referral services for advanced specialty care if needed.' }
      ],
      'Orthopedics': [
        { title: 'Orthopedic Assessment', description: 'Evaluation by an orthopedic specialist for back, neck, and joint pain including baseline tests.', coverage: 'Physical exam, posture analysis, initial imaging recommendations' },
        { title: 'Physiotherapy & Rehab', description: 'Targeted physiotherapy sessions for musculoskeletal pain and mobility issues.', coverage: 'Stretching, strengthening, posture correction, ergonomic guidance' },
        { title: 'Pain Management Support', description: 'Guided pain management plan including hot/cold therapy and safe medication advice.', coverage: 'Lifestyle modifications, home program, follow-ups' }
      ],
      'Sexual Health': [
        { title: 'STD Testing & Consultation', description: 'Confidential testing and consultation for sexually transmitted diseases.' },
        { title: 'Preventive Guidance', description: 'Educational support and safe health practices counseling.' },
        { title: 'Confidential Care', description: 'Private consultations with specialized healthcare providers.' }
      ],
      'Cardiology': [
        { title: 'Heart Health Assessment', description: 'Comprehensive cardiac screening including ECG and stress tests.', coverage: 'Annual checkup, monitoring, blood pressure tracking' },
        { title: 'Cardiac Rehabilitation', description: 'Supervised exercise and lifestyle modification programs.', coverage: 'Exercise sessions, dietary counseling, progress monitoring' }
      ],
      'Emergency': [
        { title: 'Emergency Medical Care', description: '24/7 emergency medical services for urgent health situations.', coverage: 'Emergency room access, trauma care, critical care services' },
        { title: 'Ambulance Services', description: 'Emergency transportation and pre-hospital care.', coverage: 'Ambulance transport, emergency medical technician care' }
      ]
    };

    return benefitsMap[category] || [
      { title: 'General Health Consultation', description: 'Comprehensive health consultation with medical professionals.', coverage: 'Medical consultation, health assessment, treatment recommendations' },
      { title: 'Preventive Health Screening', description: 'Regular health checkups and early detection screenings.', coverage: 'Basic health checkup, blood tests, preventive screenings' }
    ];
  }

  async generateActionPlan(issue: string, category: string): Promise<string[]> {
    const mockCategories = ['Mental Health', 'Dental', 'Vision', 'OPD'];
    if (mockCategories.includes(category)) {
      return this.createSimplePlanFromIssue(issue, category);
    }
    console.log(`AIService: Using AI action plan generation for ${category}`);
    try {
      if (!this.useMockAI && this.model) {
        const prompt = `You are a professional Indian healthcare guidance assistant. Create a patient-friendly, safety-first, encouraging ACTION PLAN for:
Issue: "${issue}"  |  Specialty: ${category}

Output Requirements:
- Return ONLY a JSON array (no wrapper object, no prose) of 5–7 strings.
- Each string MUST follow the pattern: "Short Heading: human-friendly guidance sentence (concise, 18–28 words)".
- Tone: supportive, clear, non-alarming, like a compassionate clinician-coach.
- Absolutely DO NOT include: specific medicine or drug names, dosages, brand names, injections, or prescriptions.
- Instead of naming a drug say: "use doctor-advised medication if previously recommended".
- Include ONE step that lists monitored warning signs (red flags) and what to do if they appear.
- Include ONE step that focuses on lifestyle / daily habits.
- Include ONE step that emphasizes professional follow-up or reassessment timeline.
- Focus order (example structure): 1) Initial professional evaluation, 2) Immediate self-care / symptom tracking, 3) Diagnostics if indicated, 4) Lifestyle & prevention, 5) Monitoring & red flags, 6) Follow‑up & escalation (optional 7th: emotional wellbeing / support if relevant).
- No step should start with verbs like "Avoid" repeatedly—vary language.
- Keep content specific to ${category} context.
- Do not fabricate impossible diagnostics; keep generic but realistic.
- Language: English, neutral Indian context.

Return ONLY the JSON array, e.g.:
[
  "Initial Evaluation: Book a qualified ${category.toLowerCase()} consultation to review your symptoms, history, and risk factors; carry any prior reports for context.",
  "Symptom Tracking: Maintain a simple daily log (onset, triggers, severity, related factors) to help the clinician identify patterns and prioritize investigations.",
  "Diagnostics & Tests: Complete only recommended baseline tests; discuss rationale before advanced imaging to avoid unnecessary procedures.",
  "Lifestyle Foundation: Support recovery with balanced meals, regular hydration, consistent sleep, gentle movement, and stress reduction techniques as tolerated.",
  "Red Flag Monitoring: Seek urgent care for sudden severe worsening, fainting, uncontrolled fever, breathing difficulty, new neurological changes, or persistent chest discomfort.",
  "Structured Follow-Up: Reassess with your clinician if symptoms persist beyond 2–3 weeks or earlier if red flags arise; refine plan collaboratively."
]`;
        const response = await this.callGeminiAPI(prompt);
        try {
          const result = JSON.parse(response.trim());
          if (Array.isArray(result) && result.length >= 5) {
            return this.sanitizeActionPlanItems(result).slice(0, 7);
          }
        } catch {
          console.error('AIService: Failed to parse action plan response');
        }
      }
      throw new Error(`AI action plan generation failed for ${category}`);
    } catch (error) {
      console.error('AIService: Action plan generation failed:', error);
      throw error;
    }
  }

  async assessSeverity(issue: string, category: string): Promise<{ level: 'low' | 'moderate' | 'high'; red_flags: string[]; rationale: string }> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (!this.useMockAI && this.model) {
          const prompt = `Assess clinical severity for the patient's concern.
Issue: "${issue}"
Specialty: ${category}

Rules:
- Output JSON only with keys: level ('low'|'moderate'|'high'), red_flags (array of 2-5 strings), rationale (short 1 sentence)
- Consider Indian context and primary-care triage; mark 'high' only for danger signs.

Example:
{"level":"moderate","red_flags":["worsening pain","fever>101F"],"rationale":"Symptoms suggest evaluation but not emergent."}`;
          const text = await this.callGeminiAPI(prompt);
          const trimmed = text.trim();
          const start = trimmed.indexOf('{');
          const end = trimmed.lastIndexOf('}') + 1;
          const json = start !== -1 && end > start ? trimmed.substring(start, end) : trimmed;
          const parsed = JSON.parse(json);
            if (parsed && (parsed.level === 'low' || parsed.level === 'moderate' || parsed.level === 'high') && Array.isArray(parsed.red_flags)) {
            return parsed;
          }
        }
        throw new Error('No valid severity JSON');
      } catch {
        if (attempt < 2) await new Promise(r => setTimeout(r, 500));
      }
    }
    return { level: 'moderate', red_flags: [ 'worsening symptoms', 'new severe pain', 'fever or fainting' ], rationale: 'Default safety-first guidance' };
  }

  async generateModalPerspectives(issue: string, category: string): Promise<{ allopathy: string[]; ayurveda: string[]; homeopathy: string[] }> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (!this.useMockAI && this.model) {
          const prompt = `For Indian patients, provide short supportive measures from three perspectives for:
Issue: "${issue}" (Specialty: ${category})

Perspectives required (English, patient-safe, no prescriptions or doses):
- Allopathy: 2-4 practical steps (consultation, tests, over-the-counter care where safe)
- Ayurveda: 2-4 gentle lifestyle/herbal adjuncts (avoid specific formulations and dosing)
- Homeopathy: 2-4 supportive general measures (do not prescribe remedies)

Return ONLY JSON with keys: allopathy, ayurveda, homeopathy; each value is an array of strings.`;
          const text = await this.callGeminiAPI(prompt);
          const trimmed = text.trim();
          const start = trimmed.indexOf('{');
          const end = trimmed.lastIndexOf('}') + 1;
          const json = start !== -1 && end > start ? trimmed.substring(start, end) : trimmed;
          const parsed = JSON.parse(json);
          if (parsed && Array.isArray(parsed.allopathy) && Array.isArray(parsed.ayurveda) && Array.isArray(parsed.homeopathy)) {
            return { allopathy: parsed.allopathy.slice(0, 4), ayurveda: parsed.ayurveda.slice(0, 4), homeopathy: parsed.homeopathy.slice(0, 4) };
          }
        }
        throw new Error('No valid perspectives JSON');
      } catch {
        if (attempt < 2) await new Promise(r => setTimeout(r, 500));
      }
    }
    return {
      allopathy: [
        'Consult a qualified clinician; follow recommended tests as advised.',
        'Use rest, hydration, and basic analgesia only if previously well-tolerated.',
        'Track symptoms (onset, triggers, severity) to share with your doctor.'
      ],
      ayurveda: [
        'Adopt regular sleep, light meals, and warm water sipping for comfort.',
        'Gentle yoga and breathing (pranayama) as tolerated; avoid strain.',
        'Use home kitchen herbs (ginger, turmeric in food) as supportive, not curative.'
      ],
      homeopathy: [
        'Focus on overall wellbeing: hydration, rest, stress reduction.',
        'Avoid self-medication; consult a registered practitioner if choosing this route.'
      ]
    };
  }

  async generateProTips(issue: string, category: string): Promise<string[]> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (!this.useMockAI && this.model) {
          const prompt = `Create 4 concise "Pro Tips" for a patient with the following:
Issue: "${issue}"
Specialty: ${category}

Rules:
- English only, patient-friendly
- Each tip 8–16 words, specific and practical
- No insurance, payments, or claims
- No diagnosis; safety-first guidance

Return ONLY a valid JSON array of strings like:
[
  "Tip 1...",
  "Tip 2...",
  "Tip 3...",
  "Tip 4..."
]`;
          const response = await this.callGeminiAPI(prompt);
          const trimmed = response.trim();
          const start = trimmed.indexOf('[');
          const end = trimmed.lastIndexOf(']') + 1;
          const json = start !== -1 && end > start ? trimmed.substring(start, end) : trimmed;
          const parsed = JSON.parse(json);
          if (Array.isArray(parsed) && parsed.length >= 3) return parsed.slice(0, 5);
        }
        throw new Error('No valid pro tips generated');
      } catch (err: any) {
        if (attempt < 3) await new Promise(res => setTimeout(res, 800 * attempt));
      }
    }
    return [
      'Write symptoms, duration, and triggers before your appointment.',
      'Avoid heavy exertion until a clinician evaluates your condition.',
      'Stay hydrated and follow a balanced, low-processed diet.',
      'Note alarming signs (worsening pain, fever, fainting) and seek urgent care.'
    ];
  }

  private createSimplePlanFromIssue(issue: string, category: string): string[] {
    // Expanded fallback (no AI) still returns rich, safe guidance.
    const generic = category.toLowerCase();
    const steps = [
      `Initial Evaluation: Schedule a qualified ${generic} consultation for '${issue}' and bring any prior reports or notes for context.`,
      `Symptom Log: Note timing, triggers, severity, and associated factors daily; this helps tailor assessment and avoid unnecessary procedures.`,
      `Baseline Actions: Maintain hydration, balanced meals, gentle movement, and ergonomic posture; avoid overexertion or untested home remedies.`,
      `Diagnostics: Complete only clinician-recommended basic tests first; discuss benefits before advanced or expensive imaging.`,
      `Lifestyle Focus: Support recovery with consistent sleep, stress management (breathing, mindfulness), and reduction of ultra-processed foods.`,
      `Red Flag Monitoring: Seek urgent evaluation for sudden severe worsening, loss of consciousness, high persistent fever, breathing trouble, or new neurological symptoms.`,
      `Follow-Up: Reassess in 2–3 weeks if symptoms persist or sooner if red flags develop; refine plan with your clinician.`
    ];
    return steps;
  }

  private sanitizeActionPlanItems(items: string[]): string[] {
    const bannedPatterns = /(mg\b|tablet|capsule|syrup|injection|paracetamol|ibuprofen|diclofenac|azithromycin|amoxicillin|omeprazole|metformin|insulin|antibiotic|drug|medicine)/gi;
    return items.map(raw => {
      let line = raw.trim();
      // Remove any trailing periods duplication
      line = line.replace(/\.{2,}$/g, '.');
      // Replace banned medication mentions with a safe placeholder
      line = line.replace(bannedPatterns, 'doctor-advised medication');
      // Ensure heading pattern exists; if missing colon, add generic heading
      if (!/^[A-Z0-9][^:]{2,40}:/.test(line)) {
        line = `Guidance: ${line}`;
      }
      // Limit length softly (defensive) – avoid extremely long items
      if (line.length > 260) line = line.slice(0, 255).trimEnd() + '…';
      return line;
    });
  }

  async suggestConsultants(category: string, location?: string): Promise<ConsultantInfo[]> {
    if (!location || !location.trim()) return [];
    try {
      if (!this.useMockAI && this.model) {
        const prompt = `List up to 4 nearby real-world healthcare providers (India) for category "${category}" in or near "${location}".

STRICT RULES:
- Output ONLY valid JSON array (no prose) of objects with: name, specialty, hospital, distance, address, phone.
- Keep distance approximate (e.g., "2.5 km", "3 km").
- If exact distance unknown, use "--".
- Do NOT fabricate unrealistic hospitals; prefer well‑known chains (Apollo, Fortis, Max, AIIMS, government hospital) or plausible local clinic names.
- Phone may be blank if unsure.

Example format:
[
  {"name":"Dr. A. Sharma","specialty":"Cardiology","hospital":"Fortis Hospital","distance":"2.1 km","phone":"+91-xxxx","address":"Sector 62, Noida"}
]
`;
        const response = await this.callGeminiAPI(prompt);
        const trimmed = response.trim();
        const start = trimmed.indexOf('[');
        const end = trimmed.lastIndexOf(']') + 1;
        if (start !== -1 && end > start) {
          const json = trimmed.substring(start, end);
          const parsed = JSON.parse(json);
          if (Array.isArray(parsed)) return parsed.slice(0, 4);
        }
      }
    } catch (e) {
      console.log('AIService: suggestConsultants AI path failed, returning empty list');
    }
    return [];
  }

  async generateChatResponse(_messages: any[], userQuery: string): Promise<string> {
    const lowerQuery = userQuery.toLowerCase();
    try {
      if (!this.useMockAI && this.model) {
        const prompt = `You are a health benefits assistant. Answer this health-related question focusing on health benefits, wellness, and care guidance. Do NOT discuss insurance claims, payments, or reimbursements. Keep response helpful and under 150 words.

Question: "${userQuery}"`;
        const response = await this.callGeminiAPI(prompt);
        return response.trim();
      }
    } catch {
      console.log('AIService: Failed to get AI response, using fallback');
    }
    if (lowerQuery.includes('benefit') || lowerQuery.includes('help') || lowerQuery.includes('treatment')) {
      return 'I can help you understand health benefits available for your condition, find nearby healthcare providers, create action plans for managing your health concerns, and provide guidance on wellness programs. What specific health concern can I assist you with?';
    }
    if (lowerQuery.includes('doctor') || lowerQuery.includes('hospital') || lowerQuery.includes('clinic')) {
      return 'I can help you find nearby healthcare providers based on your location and health concern. Please describe your health issue and provide your location (city or area) so I can suggest appropriate doctors, hospitals, or clinics near you.';
    }
    if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent')) {
      return 'For medical emergencies, call 108 (free) or 102 (ambulance) immediately. Visit the nearest hospital emergency room. I can help you find emergency care facilities near your location if you provide your area details.';
    }
    if (lowerQuery.includes('symptoms') || lowerQuery.includes('pain') || lowerQuery.includes('feeling')) {
      return 'Please describe your symptoms in detail so I can help classify your health concern and suggest appropriate next steps. Include when symptoms started, severity, and any other relevant details for better assistance.';
    }
    if (lowerQuery.includes('wellness') || lowerQuery.includes('prevention') || lowerQuery.includes('healthy')) {
      return 'I can provide information about preventive health measures, wellness programs, regular health checkups, and lifestyle recommendations based on your health concerns. What aspect of wellness are you interested in?';
    }
    return 'I\'m your health benefits assistant. I can help you with: finding healthcare providers near you, understanding health benefits for your condition, creating action plans for health concerns, and providing wellness guidance. Please describe your health concern or ask a specific question about your wellbeing.';
  }

  async analyzeIssueEndToEnd(query: string): Promise<{category: string, benefits: BenefitCard[], action_plan: string[]}> {
    if (!this.useMockAI && this.model) {
      const prompt = `You are an AI assistant that helps classify health concerns, generate relevant benefits, and provide simple actionable steps.

Rules:
1. Classification
   - Input: a free-text health issue (e.g., "back pain").
   - Output: a medical category (e.g., Orthopedics, Physiotherapy, Mental Health, Dermatology).
   - Be specific: "back pain" → "Orthopedics" (not generic OPD).

2. Benefits Generation
   - Generate 2–4 benefit cards in JSON format.
   - Benefits must be directly relevant to the classified issue.

3. Action Plan Generation
   - Generate 3–4 action steps in JSON format.
   - Keep them simple, practical, and health-oriented.

4. Output Format
   - Always return valid JSON. No extra text outside JSON.
   - Structure:
   {
     "category": "Orthopedics",
     "benefits": [ ... ],
     "action_plan": [ ... ]
   }

6. Important Constraints
   - Do NOT mention reimbursements, billing, or payments.
   - Always align benefits and action plan with the user’s issue and category.
   - Each benefit and action plan must make sense for the health concern.

Input: "${query}"

Good output example for "I have back pain":
{
  "category": "Orthopedics",
  "benefits": [
    { "title": "Orthopedic Consultation", "description": "Consult with a specialist to check spinal health." },
    { "title": "Physiotherapy Sessions", "description": "Targeted exercises to relieve chronic back pain." }
  ],
  "action_plan": [
    "Schedule a visit to an orthopedic doctor.",
    "Perform daily stretching as advised.",
    "Use ergonomic seating and posture correction."
  ]
}`;
      try {
        const response = await this.callGeminiAPI(prompt);
        const parsed = JSON.parse(response.trim());
        if (parsed && typeof parsed.category === 'string' && Array.isArray(parsed.benefits) && Array.isArray(parsed.action_plan)) {
          localStorage.setItem('lastEndToEnd', JSON.stringify({ query, ...parsed, timestamp: Date.now() }));
          return parsed;
        }
      } catch {
        console.log('AIService: analyzeIssueEndToEnd AI path failed, using composed fallback');
      }
    }
    try {
      const klass = await this.classifyConcern(query);
      const benefits = await this.generateBenefits(klass.issue_summary, klass.category);
      const action_plan = await this.generateActionPlan(klass.issue_summary, klass.category);
      const result = { category: klass.category, benefits, action_plan };
      localStorage.setItem('lastEndToEnd', JSON.stringify({ query, ...result, timestamp: Date.now() }));
      return result;
    } catch {
      const mock = {
        category: 'General OPD',
        benefits: [ { title: 'General Consultation', description: 'Meet a doctor for a general check-up.' } ],
        action_plan: ['Schedule a basic check-up.', 'Follow doctor’s advice.']
      };
      localStorage.setItem('lastEndToEnd', JSON.stringify({ query, ...mock, timestamp: Date.now() }));
      return mock;
    }
  }

  async findNearbyDoctors(category: string, location: string): Promise<ConsultantInfo[]> {
    if (!location.trim()) return [];
    try {
      if (!this.useMockAI && this.model) {
        const prompt = `Find nearby doctors/consultants in India for ${category} specialty in ${location}.

REQUIREMENTS:
- Only doctors/hospitals in INDIA
- Focus on ${location} area or nearby cities in India  
- Include mix of government and private hospitals
 
- For severe conditions, include government hospital references

Return ONLY valid JSON array:
[
  {
    "name": "Dr. Ram Sharma",
    "specialty": "${category}",
  "hospital": "All India Institute of Medical Sciences, Delhi",
    "distance": "2.5 km",
    "phone": "+91-11-26588500",
    "address": "Ansari Nagar, New Delhi"
  }
]

Location: ${location}
Specialty: ${category}
Language: English`;
        const response = await this.callGeminiAPI(prompt);
        let cleanResponse = response.trim();
        const jsonStart = cleanResponse.indexOf('[');
        const jsonEnd = cleanResponse.lastIndexOf(']') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
        const result = JSON.parse(cleanResponse);
        if (Array.isArray(result) && result.length > 0) return result.slice(0, 4);
      }
      return [];
    } catch (error) {
      console.error('AIService: Doctor search failed:', error);
      return [];
    }
  }
}

export default new AIService();