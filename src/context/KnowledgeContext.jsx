import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const KnowledgeContext = createContext();

export function KnowledgeProvider({ children }) {
  const { t } = useTranslation();
  const [publishedArticles, setPublishedArticles] = useState([]);
  
  // Pending articles start with some mock ones for demonstration
  const [pendingArticles, setPendingArticles] = useState([
    { id: 'p1', title: 'Updated Seed Treatment Protocol 2026', titleKey: 'seedProtocol', author: 'Dr. Faisal', authorKey: 'faisal', type: 'Knowledge Base', typeKey: 'knowledgeBase', category: 'Cultivation Practices', date: '2 hours ago', dateKey: 'hrs2', excerpt: 'New protocols for seed treatment before sowing.', excerptKey: 'seedExcerpt', content: 'Detailed content about seed treatment...', contentKey: 'seedContent' },
    { id: 'p2', title: 'Late Leaf Spot Fungicide Efficacy Data', titleKey: 'leafSpot', author: 'Dr. Zoya', authorKey: 'zoya', type: 'Research Data', typeKey: 'researchData', category: 'Disease Management', date: '5 hours ago', dateKey: 'hrs5', excerpt: 'Research data on fungicide efficacy.', excerptKey: 'leafExcerpt', content: 'The efficacy of the new fungicidal spray showed a 34% reduction in late leaf spot severity...', contentKey: 'leafContent' },
  ]);

  // Load initial published articles from translations
  useEffect(() => {
    const articles = t('kb.articles', { returnObjects: true });
    if (Array.isArray(articles)) {
      setPublishedArticles(articles);
    }
  }, [t]);

  const submitArticle = (articleData) => {
    const newPending = {
      ...articleData,
      id: `p-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Knowledge Base',
    };
    setPendingArticles([...pendingArticles, newPending]);
  };

  const approveArticle = (id) => {
    const articleToApprove = pendingArticles.find(a => a.id === id);
    if (articleToApprove) {
      setPublishedArticles([...publishedArticles, articleToApprove]);
      setPendingArticles(pendingArticles.filter(a => a.id !== id));
    }
  };

  const rejectArticle = (id) => {
    setPendingArticles(pendingArticles.filter(a => a.id !== id));
  };

  const updateArticle = (id, updatedData) => {
    setPublishedArticles(publishedArticles.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const deleteArticle = (id) => {
    setPublishedArticles(publishedArticles.filter(a => a.id !== id));
  };

  return (
    <KnowledgeContext.Provider value={{
      publishedArticles,
      pendingArticles,
      submitArticle,
      approveArticle,
      rejectArticle,
      updateArticle,
      deleteArticle
    }}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export const useKnowledge = () => useContext(KnowledgeContext);
