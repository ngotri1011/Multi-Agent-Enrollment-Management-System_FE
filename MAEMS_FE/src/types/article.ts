import type { ArticleStatus } from "./enums";

export type UrlImageArticle = {
  url: string;
};

export type CreateArticleRequest = {
  title: string;
  content: string;
  thumbnail: string;
  status: ArticleStatus;
  isRegisterable: boolean;
};

export type Article = {
  articleId: number;
  title: string;
  content: string;
  thumbnail: string;
  authorName: string | null;
  status: ArticleStatus;
  isRegisterable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ArticleApiResponse = {
  articleId: number;
  title: string;
  content: string;
  thumbnail: string;
  authorname: string | null;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  isRegisterable: boolean;
};

export type ArticleBasic = {
  articleId: number;
  title: string;
  thumbnail: string;
  updatedAt: string;
  status: ArticleStatus;
};

export type GetPublishedArticlesBasicQuery = {
  searchTitle?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
};

export type GetArticlesBasicQuery = {
  searchTitle?: string;
  status?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
};