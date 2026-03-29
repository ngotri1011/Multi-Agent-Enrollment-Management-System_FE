import { apiClient } from "../services/axios";
import type {
  Article,
  ArticleApiResponse,
  ArticleBasic,
  CreateArticleRequest,
  GetArticlesBasicQuery,
  GetPublishedArticlesBasicQuery,
  UrlImageArticle,
} from "../types/article";
import type { ApiWrapper, PagedResult } from "../types/api.wrapper";

//Tải ảnh article lên firebasestorage
export async function uploadImageArticle(formData: FormData): Promise<UrlImageArticle> {
  const res = await apiClient.post<UrlImageArticle>(
    "/api/Articles/upload-image",
    formData,
  );
  const url = res.data?.url;
  if (typeof url === "string" && url.trim()) {
    return { url };
  }
  throw new Error("Upload image response không có trường url.");
}

//Tạo article
export async function createArticle(payload: CreateArticleRequest): Promise<Article> {
  const res = await apiClient.post<ApiWrapper<ArticleApiResponse>>(
    "/api/Articles",
    payload
  );
  const article = res.data.data;
  return {
    articleId: article.articleId,
    title: article.title,
    content: article.content,
    thumbnail: article.thumbnail,
    authorName: article.authorname,
    status: article.status,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
} 

//Lấy danh sách article publish basic
export async function getPublishedArticlesBasic(
  query: GetPublishedArticlesBasicQuery = {}
): Promise<ArticleBasic[]> {
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    params[key] = value;
  }

  const res = await apiClient.get<ApiWrapper<PagedResult<ArticleBasic>>>(
    "/api/Articles/publish/basic",
    {
      params: Object.keys(params).length ? params : undefined,
    }
  );
  return res.data.data.items.map((article) => ({
    articleId: article.articleId,
    title: article.title,
    thumbnail: article.thumbnail,
    updatedAt: article.updatedAt,
    status: article.status,
  }));
}

//Lấy danh sách article basic
export async function getArticlesBasic(
  query: GetArticlesBasicQuery = {}
): Promise<ArticleBasic[]> {
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    params[key] = value;
  }

  const res = await apiClient.get<ApiWrapper<PagedResult<ArticleBasic>>>(
    "/api/Articles/basic",
    {
      params: Object.keys(params).length ? params : undefined,
    }
  );

  return res.data.data.items.map((article) => ({
    articleId: article.articleId,
    title: article.title,
    thumbnail: article.thumbnail,
    updatedAt: article.updatedAt,
    status: article.status,
  }));
}

//Lấy article by id
export async function getArticleById(id: number): Promise<Article> {
  const res = await apiClient.get<ApiWrapper<ArticleApiResponse>>(
    `/api/Articles/${id}`
  );
  const article = res.data.data;
  return {
    articleId: article.articleId,
    title: article.title,
    content: article.content,
    thumbnail: article.thumbnail,
    authorName: article.authorname,
    status: article.status,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

//Cập nhật article
export async function patchArticle(id: number, payload: CreateArticleRequest): Promise<Article> {
  const res = await apiClient.patch<ApiWrapper<Article>>(
    `/api/Articles/${id}`,
    payload
  );
  return res.data.data;
}