
export interface StudentData {
  subjectStream: string;
  zscore: number;
  district: string;
  name: string;
}

export interface StudentFormErrors {
  subjectStream?: string;
  zscore?: string;
  district?: string;
  name?: string;
}

export interface UniversityProgram {
  id: string;
  name: string;
  university: string;
  faculty: string;
  minZScore: number;
  subjectStreams: string[];
  district?: string;
  duration: number;
  type: 'undergraduate' | 'postgraduate';
}

export interface RecommendationResult {
  eligiblePrograms: UniversityProgram[];
  nearMissPrograms: UniversityProgram[];
  totalPrograms: number;
}

// Main DegreeProgram interface that matches what the components and API use
export interface DegreeProgram {
  id: string;
  degreeName: string;
  university: string;
  description: string;
  district: string;
  duration: number;
  previousCutoff: number;
  subjectStreams: string[];
  type: 'undergraduate' | 'postgraduate';
  subjectStream?: string; // For backward compatibility with existing code
}

// API response interface
export interface RecommendationResponse {
  recommendations: DegreeProgram[];
  nearbyRecommendations: DegreeProgram[];
  totalCount: number;
}
