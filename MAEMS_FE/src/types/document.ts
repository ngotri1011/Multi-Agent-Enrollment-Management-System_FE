import type { DocumentStatus } from "./enums";

export type Document = {
    documentId: number,
    applicantId: number,
    documentType: string,
    filePath: string,
    uploadedAt: string,
    fileName: string,
    fileFormat: string,
    verificationResult: DocumentStatus,
    verificationDetails: string | null,
}