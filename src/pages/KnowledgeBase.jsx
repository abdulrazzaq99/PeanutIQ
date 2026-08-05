import { useState, useEffect } from 'react';
import { 
  Search, BookOpen, ChevronRight, FileText, 
  Download, Sparkles, X, ArrowLeft, Loader2, Info, Pencil, Trash2, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKnowledge } from '../context/KnowledgeContext';
import { useTranslation } from 'react-i18next';

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const tCategories = t('kb.categories', { returnObjects: true });
  const tArticles = t('kb.articles', { returnObjects: true });
  const categories = Array.isArray(tCategories) ? tCategories : [];
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'researcher';
  
  const { publishedArticles, submitArticle, updateArticle, deleteArticle } = useKnowledge();
  const articles = publishedArticles || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(t('kb.allArticles'));
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  
  // AI State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiState, setAiState] = useState('idle'); // idle, thinking, complete
  const [aiResponse, setAiResponse] = useState('');

  // Scroll to top when an article is selected for reading or editing
  useEffect(() => {
    if (selectedArticle || editingArticleId || isCreatingArticle) {
      window.scrollTo(0, 0);
    }
  }, [selectedArticle, editingArticleId, isCreatingArticle]);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === t('kb.allArticles') || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (isAiMode) {
      setAiState('thinking');
      setTimeout(() => {
        // Mock AI response logic
        if (searchQuery.toLowerCase().includes('leaf spot') || searchQuery.toLowerCase().includes('بیماری') || searchQuery.toLowerCase().includes('دھبے')) {
          setAiResponse(t('kb.aiResponses.disease'));
        } else if (searchQuery.toLowerCase().includes('seed') || searchQuery.toLowerCase().includes('sow') || searchQuery.toLowerCase().includes('بیج')) {
          setAiResponse(t('kb.aiResponses.seed'));
        } else {
          setAiResponse(t('kb.aiResponses.general'));
        }
        setAiState('complete');
      }, 2000);
    }
  };

  if (editingArticleId) {
    const articleToEdit = articles.find(a => a.id === editingArticleId);
    
    const handleSave = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const updatedArticle = {
        ...articleToEdit,
        title: formData.get('title'),
        category: formData.get('category'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
      };
      updateArticle(editingArticleId, updatedArticle);
      setEditingArticleId(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('kb.editArticle')}</h2>
          <button 
            onClick={() => setEditingArticleId(null)}
            className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editTitle')}</label>
            <input name="title" defaultValue={articleToEdit.title} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editCategory')}</label>
            <select name="category" defaultValue={articleToEdit.category} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editExcerpt')}</label>
            <textarea name="excerpt" defaultValue={articleToEdit.excerpt} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editContent')}</label>
            <textarea name="content" defaultValue={articleToEdit.content} rows={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setEditingArticleId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer">{t('kb.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer">{t('kb.saveChanges')}</button>
          </div>
        </form>
      </div>
    );
  }

  if (isCreatingArticle) {
    const handleCreateSave = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newArticle = {
        title: formData.get('title'),
        category: formData.get('category'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        author: user?.name || 'Researcher',
      };
      
      submitArticle(newArticle);
      setIsCreatingArticle(false);
      alert(t('kb.articleSubmitted'));
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('kb.createNewArticle')}</h2>
          <button 
            onClick={() => setIsCreatingArticle(false)}
            className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreateSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editTitle')}</label>
            <input name="title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editCategory')}</label>
            <select name="category" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editExcerpt')}</label>
            <textarea name="excerpt" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editContent')}</label>
            <textarea name="content" rows={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <button type="button" onClick={() => setIsCreatingArticle(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer">{t('kb.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer">{t('kb.submitForApproval')}</button>
          </div>
        </form>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-screen">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" /> {t('kb.back')}
        </button>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{selectedArticle.category}</span>
            <span>•</span>
            <span className="flex items-center"><BookOpen className="w-4 h-4 me-1"/> {selectedArticle.author}</span>
            <span>•</span>
            <span>{selectedArticle.date}</span>
          </div>
          
          <h1 className="text-3xl font-black text-gray-900">{selectedArticle.title}</h1>
          <p className="text-lg text-gray-600 italic border-s-4 border-gray-200 ps-4">{selectedArticle.excerpt}</p>
        </div>

        <div className="mt-8 prose prose-green max-w-none">
          <p className="text-gray-800 leading-loose text-lg">
            {selectedArticle.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('kb.title')}</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">{t('kb.subtitle')}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsCreatingArticle(true)}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5 rtl:ml-2 ltr:mr-2" /> {t('kb.createArticle')}
          </button>
        )}
      </div>

      {/* Search Bar & AI Toggle */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
            {isAiMode ? <Sparkles className="h-5 w-5 text-indigo-500" /> : <Search className="h-5 w-5 text-slate-400" />}
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full ps-12 pe-44 py-4 rounded-xl leading-5 bg-transparent placeholder-slate-500 focus:outline-none text-base text-slate-900 font-medium" 
            placeholder={isAiMode ? t('kb.searchAiPlaceholder') : t('kb.searchPlaceholder')} 
            type="search" 
          />
          <div className="absolute end-2 flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setIsAiMode(false)}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 ${!isAiMode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t('kb.searchBtn')}
            </button>
            <button
              type="button"
              onClick={() => setIsAiMode(true)}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 flex items-center ${isAiMode ? 'bg-indigo-500 shadow-sm text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Sparkles className="w-4 h-4 me-1" /> {t('kb.askAiBtn')}
            </button>
          </div>
        </form>
      </div>

      {/* AI Reasoning State */}
      {isAiMode && aiState !== 'idle' && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 shadow-sm">
          {aiState === 'thinking' ? (
            <div className="flex items-center text-purple-700">
              <Loader2 className="w-5 h-5 me-3 animate-spin" />
              <span className="font-medium">{t('kb.aiThinking')}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-purple-900 flex items-center">
                  <Sparkles className="w-5 h-5 me-2" /> {t('kb.aiRec')}
                </h3>
                <button onClick={() => setAiState('idle')} className="text-purple-400 hover:text-purple-700"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-purple-800 leading-relaxed text-sm">{aiResponse}</p>
              <div className="flex items-center text-xs text-purple-600 mt-4">
                <Info className="w-4 h-4 me-1" /> {t('kb.derivedInfo')}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mt-8 items-start">
        {/* Sidebar Categories */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-28">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('kb.categoriesTitle')}</h3>
          <ul className="space-y-2">
            <li 
              onClick={() => setActiveCategory(t('kb.allArticles'))}
              className={`${activeCategory === t('kb.allArticles') ? 'bg-emerald-500/10 text-emerald-700' : 'text-slate-600 hover:bg-slate-500/5'} rounded-xl px-3 py-2 flex items-center justify-between text-sm font-bold cursor-pointer transition-all duration-300`}
            >
              <span>{t('kb.allArticles')}</span>
              <span className={`${activeCategory === t('kb.allArticles') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/50 text-slate-600'} text-xs py-0.5 px-2 rounded-full font-semibold`}>
                {articles.length}
              </span>
            </li>
            {categories.map((category) => (
              <li 
                key={category.id} 
                onClick={() => setActiveCategory(category.name)}
                className={`${activeCategory === category.name ? 'bg-emerald-500/10 text-emerald-700' : 'text-slate-600 hover:bg-slate-500/5'} rounded-xl px-3 py-2 flex items-center justify-between text-sm font-bold cursor-pointer transition-all duration-300`}
              >
                <span>{category.name}</span>
                <span className={`${activeCategory === category.name ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/50 text-slate-600'} text-xs py-0.5 px-2 rounded-full font-semibold`}>
                  {articles.filter(a => a.category === category.name).length}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article List */}
        <div className="flex-1 space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">{t('kb.noArticles')}</h3>
              <p className="text-slate-500 font-medium mt-1">{t('kb.tryAdjusting')}</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div 
                key={article.id} 
                onClick={() => setSelectedArticle(article)}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer shadow-sm group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
                      <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-xs font-bold uppercase">{article.category}</span>
                      <span>•</span>
                      <span className="flex items-center font-medium"><BookOpen className="w-3.5 h-3.5 me-1.5"/> {article.author}</span>
                      <span>•</span>
                      <span className="font-medium">{article.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors pe-8 leading-tight">{article.title}</h3>
                    <p className="mt-3 text-sm font-medium text-slate-600 leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  {(user?.role === 'admin' || article.author === user?.name) ? (
                    <div className="flex mt-4 space-x-2 rtl:space-x-reverse">
                      <button onClick={(e) => { e.stopPropagation(); setEditingArticleId(article.id); }} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer" title={t('kb.editArticle')}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        if(window.confirm(t('kb.deleteConfirm'))) deleteArticle(article.id);
                      }} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" title={t('kb.deleteArticle')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="ms-4 flex-shrink-0 pt-2 bg-slate-50 rounded-full p-2 group-hover:bg-emerald-50 transition-colors shadow-sm border border-slate-200">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors rtl:rotate-180" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
