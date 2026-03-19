import type { Campus } from './campus';

export interface Program {
  programId: number;
  programName: string;
  majorName: string;
  enrollmentYear: string;
  description: string;
  careerProspects: string;
  duration: string;
  isActive: boolean;
  campuses: Campus[];
}


export interface CreateProgramRequest {
  programName: string;
  majorId: number;
  enrollmentYearId: number;
  description: string;
  careerProspects: string;
  duration: string;
  isActive: boolean;
}

export interface UpdateProgramRequest {
  programId: number;
  programName: string;
  description: string;
  careerProspects: string;
  duration: string;
  isActive: boolean;
}