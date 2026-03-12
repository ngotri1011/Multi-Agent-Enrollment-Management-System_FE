export interface Document {
    documentId: number,
    applicantId: number,
    documentType: string,
    filePath: string,
    uploadedAt: string,
    fileName: string,
    fileFormat: string,
    verificationResult: string,
    verificationDetails: string | null,
}