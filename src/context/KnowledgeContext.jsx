import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchApi } from '../config/api';

const KnowledgeContext = createContext();

export function KnowledgeProvider({ children }) {
  const { user } = useAuth();
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);

  const fetchArticles = async () => {
    const token = localStorage.getItem('peanutiq_token');
    if (!token || !user) return;
    
    try {
      if (user.role === 'farmer') {
        const res = await fetchApi('/knowledge/articles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPublishedArticles(data.map(a => ({ ...a, date: new Date(a.created_at).toLocaleDateString() })));
        }
      } else {
        const pubRes = await fetchApi('/knowledge/articles?is_published=true', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pubRes.ok) {
          const data = await pubRes.json();
          setPublishedArticles(data.map(a => ({ ...a, date: new Date(a.created_at).toLocaleDateString() })));
        }
        
        const pendRes = await fetchApi('/knowledge/articles?is_published=false', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pendRes.ok) {
          const data = await pendRes.json();
          setPendingArticles(data.map(a => ({ ...a, date: new Date(a.created_at).toLocaleDateString() })));
        }
      }
    } catch (e) {
      console.error("Failed to fetch articles:", e);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [user]);

  const submitArticle = async (articleData) => {
    const token = localStorage.getItem('peanutiq_token');
    try {
      const res = await fetchApi('/knowledge/articles', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(articleData)
      });
      if (res.ok) {
        fetchArticles(); // refresh lists
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const approveArticle = async (id) => {
    const token = localStorage.getItem('peanutiq_token');
    try {
      const res = await fetchApi(`/knowledge/articles/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: true })
      });
      if (res.ok) fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  const rejectArticle = async (id) => {
    deleteArticle(id);
  };

  const updateArticle = async (id, updatedData) => {
    const token = localStorage.getItem('peanutiq_token');
    try {
      const res = await fetchApi(`/knowledge/articles/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteArticle = async (id) => {
    const token = localStorage.getItem('peanutiq_token');
    try {
      const res = await fetchApi(`/knowledge/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <KnowledgeContext.Provider value={{
      publishedArticles,
      pendingArticles,
      submitArticle,
      approveArticle,
      rejectArticle,
      updateArticle,
      deleteArticle,
      refreshArticles: fetchArticles
    }}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export const useKnowledge = () => useContext(KnowledgeContext);
