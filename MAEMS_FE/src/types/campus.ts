import type { AdmissionConfig } from './config';

export interface Campus {
  campusId: number;
  name: string;
  campusName: string;
  address: string;
  description: string;
  isActive: boolean;
  admissions: AdmissionConfig[];
}

export interface CampusBasic {
  campusId: number;
  name: string;
}