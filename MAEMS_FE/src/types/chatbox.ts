export type ChatboxResponse = {
  chatId: number;
  question: string;
  answer: string;
  createdAt: string;
};

export type ChatboxHistoryResponse = {
  messages: ChatboxResponse[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
};