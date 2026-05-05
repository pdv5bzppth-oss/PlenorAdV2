import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectId } from '/utils/supabase/info';

export type ArticleStatus = 'idea' | 'drafting' | 'finished' | 'submitted' | 'published';
export type Theme = 'housing' | 'school' | 'transport' | 'healthcare' | 'environment' | 'economy' | 'culture' | 'labor' | 'other';
export type Strategy = 'progressive' | 'moderate' | 'heavy-left';

export interface ArticleAuthor {
  name: string;
  location?: string;
  title?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  selection?: { from: number; to: number; text: string };
  createdAt: string;
  replies: Comment[];
}

export interface Article {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  body: string;
  coverImage?: string;
  status: ArticleStatus;
  themes: Theme[];
  targetKrets: string[];
  strategies: Strategy[];
  problem: string;
  direction: string;
  targetGroup: string;
  coreMessage: string;
  hook: string;
  opponent: string;
  goal: string;
  tags: string[];
  author: ArticleAuthor;
  publishedAt?: string;
  publishedIn?: string;
  collaborators: string[];
  comments: Comment[];
  successScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface ArticleContextType {
  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'collaborators' | 'comments'>) => Promise<void>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  addComment: (articleId: string, text: string, selection?: { from: number; to: number; text: string }) => Promise<void>;
  getArticleById: (id: string) => Article | undefined;
  loading: boolean;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9a7b4805`;

export function ArticleProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && accessToken) {
      fetchArticles();
    } else {
      setArticles([]);
    }
  }, [user, accessToken]);

  const fetchArticles = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/articles`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`Error fetching articles: ${error.error}`);
        return;
      }

      const { articles } = await response.json();
      setArticles(articles || []);
    } catch (error) {
      console.log(`Exception fetching articles: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const addArticle = async (article: Omit<Article, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'collaborators' | 'comments'>) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(article)
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`Error creating article: ${error.error}`);
        return;
      }

      const { article: newArticle } = await response.json();
      setArticles(prev => [...prev, newArticle]);
    } catch (error) {
      console.log(`Exception creating article: ${error}`);
    }
  };

  const updateArticle = async (id: string, updates: Partial<Article>) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`Error updating article: ${error.error}`);
        return;
      }

      const { article: updatedArticle } = await response.json();
      setArticles(prev => prev.map(a => a.id === id ? updatedArticle : a));
    } catch (error) {
      console.log(`Exception updating article: ${error}`);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`Error deleting article: ${error.error}`);
        return;
      }

      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.log(`Exception deleting article: ${error}`);
    }
  };

  const addComment = async (articleId: string, text: string, selection?: { from: number; to: number; text: string }) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ text, selection })
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`Error adding comment: ${error.error}`);
        return;
      }

      await fetchArticles();
    } catch (error) {
      console.log(`Exception adding comment: ${error}`);
    }
  };

  const getArticleById = (id: string) => {
    return articles.find(article => article.id === id);
  };

  return (
    <ArticleContext.Provider value={{
      articles,
      addArticle,
      updateArticle,
      deleteArticle,
      addComment,
      getArticleById,
      loading
    }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error('useArticles must be used within ArticleProvider');
  }
  return context;
}
