export interface ProgramAdmissionConfig {
    configId: number;
    programId: number;
    programName: string;
    campusId: number;
    campusName: string;
    admissionTypeId: number;
    admissionTypeName: string;
    quota: number;
    isActive: boolean;
    createdAt: string;
}