export interface Feedback {
    id: number;
    userId: number;
    username: string;
    title: string;
    content: string;
    createdAt?: Date; 
    totalCount?: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
}

export interface FeedbackQueryParams {
    pageNumber?: number;
    pageSize?: number;
}

export interface createFeedbackRequest {
    title: string;
    content: string;
}
export interface PagedFeedbackResponse {
    items: Feedback[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}