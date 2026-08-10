import { useState, useEffect } from 'react';
import { 
  Search, BookOpen, ChevronRight, FileText, 
  Download, Sparkles, X, ArrowLeft, Loader2, Info, Pencil, Trash2, Plus, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKnowledge } from '../context/KnowledgeContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

export default function KnowledgeBase() {
  const { t, i18n } = useTranslation();
  const tCategories = t('kb.categories', { returnObjects: true });
  const tArticles = t('kb.articles', { returnObjects: true });
  const categories = Array.isArray(tCategories) ? tCategories : [];
  const { user } = useAuth();
  const isResearcher = user?.role === 'researcher';
  
  const { publishedArticles, submitArticle, updateArticle, deleteArticle } = useKnowledge();
  const articles = publishedArticles || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(t('kb.allArticles'));
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  
  // Reset category when language changes to prevent empty states
  useEffect(() => {
    setActiveCategory(t('kb.allArticles'));
  }, [i18n.language, t]);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const { showToast } = useToast();
  
  // AI State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiState, setAiState] = useState('idle'); // idle, thinking, complete
  const [aiResponse, setAiResponse] = useState('');

  // Scroll to top when view changes (opening or closing an article/editor)
  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainer = document.querySelector('main .flex-1.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo(0, 0);
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
      <div className="max-w-2xl mx-auto space-y-6 flat-card p-8 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('kb.editArticle')}</h2>
          <button 
            onClick={() => setEditingArticleId(null)}
            className="p-2 text-gray-400 hover:text-forest bg-sand rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editTitle')}</label>
            <input name="title" defaultValue={articleToEdit.title} className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editCategory')}</label>
            <select name="category" defaultValue={articleToEdit.category} className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm">
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editExcerpt')}</label>
            <textarea name="excerpt" defaultValue={articleToEdit.excerpt} rows={3} className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editContent')}</label>
            <textarea name="content" defaultValue={articleToEdit.content} rows={10} className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm" required />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setEditingArticleId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent font-medium cursor-pointer">{t('kb.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest hover:opacity-90 font-medium cursor-pointer">{t('kb.saveChanges')}</button>
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
      showToast(t('kb.articleSubmitted'), 'It is now pending admin approval.', 'success');
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 flat-card p-8 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('kb.createNewArticle')}</h2>
          <button 
            onClick={() => setIsCreatingArticle(false)}
            className="p-2 text-gray-400 hover:text-forest bg-sand rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreateSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editTitle')}</label>
            <input name="title" className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editCategory')}</label>
            <select name="category" className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm">
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editExcerpt')}</label>
            <textarea name="excerpt" rows={3} className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('kb.editContent')}</label>
            <textarea name="content" rows={10} className="w-full px-4 py-2 border border-earth bg-sand rounded-xl focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal transition-colors shadow-sm" required />
          </div>
          <div className="flex justify-end gap- pt-4">
            <button type="button" onClick={() => setIsCreatingArticle(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent font-medium cursor-pointer">{t('kb.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest hover:opacity-90 font-medium cursor-pointer">{t('kb.submitForApproval')}</button>
          </div>
        </form>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 flat-card p-8">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-forest transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" /> {t('kb.back')}
        </button>
        
        <div className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
            <span className="bg-forest text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">{selectedArticle.category}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center whitespace-nowrap"><BookOpen className="w-4 h-4 me-1"/> {selectedArticle.author}</span>
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-nowrap">{selectedArticle.date}</span>
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
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('kb.title')}</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">{t('kb.subtitle')}</p>
        </div>
        {isResearcher && (
          <button 
            onClick={() => setIsCreatingArticle(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto flex justify-center items-center px-4 py-2.5 sm:py-2 bg-forest text-white font-bold rounded-xl shadow-sm hover:bg-forest hover:opacity-90 transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5 rtl:ml-2 ltr:mr-2" /> {t('kb.createArticle')}
          </button>
        )}
      </div>

      {/* Search Bar & AI Toggle */}
      <div className="flat-card p-2">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row relative">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 flex items-center pointer-events-none">
              {isAiMode ? <Sparkles className="h-5 w-5 text-forest" /> : <Search className="h-5 w-5 text-slate-400" />}
            </div>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full ps-12 pe-4 sm:pe-44 py-3 sm:py-4 rounded-xl leading-5 bg-transparent placeholder-slate-500 focus:outline-none text-base text-slate-900 font-medium" 
              placeholder={isAiMode ? t('kb.searchAiPlaceholder') : t('kb.searchPlaceholder')} 
              type="search" 
            />
          </div>
          <div className="flex sm:absolute sm:end-2 sm:top-1/2 sm:-translate-y-1/2 items-center bg-sand p-1 rounded-lg border border-slate-200 shadow-sm mt-1 sm:mt-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAiMode(false)}
              className={`flex-1 sm:flex-none justify-center px-4 py-2 sm:py-1.5 text-sm font-bold rounded-md transition-all duration-300 flex items-center ${!isAiMode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-forest'}`}
            >
              {t('kb.searchBtn')}
            </button>
            <button
              type="button"
              onClick={() => setIsAiMode(true)}
              className={`flex-1 sm:flex-none justify-center px-4 py-2 sm:py-1.5 text-sm font-bold rounded-md transition-all duration-300 flex items-center ${isAiMode ? 'bg-forest shadow-sm text-white' : 'text-slate-600 hover:text-forest'}`}
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

      <div className="flex flex-col lg:flex-row gap-6 mt-6 items-start">
        {/* Sidebar Categories */}
        <div className="w-full lg:w-64 flex-shrink-0 lg:flat-card lg:p-5 relative lg:sticky lg:top-28 z-20 bg-sand lg:bg-transparent -mx-4 px-4 lg:mx-0 lg:px-5 pb-2 lg:pb-0">
          <h3 className="hidden lg:block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('kb.categoriesTitle')}</h3>
          <ul className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap- lg:space-x-0 lg:space-y-2 pb-2 lg:pb-0 no-scrollbar">
            <li 
              onClick={() => setActiveCategory(t('kb.allArticles'))}
              className={`${activeCategory === t('kb.allArticles') ? 'bg-forest text-white shadow-md' : 'text-charcoal bg-white lg:bg-transparent border border-earth lg:border-transparent hover:bg-forest/10 hover:text-forest'} rounded-xl px-4 lg:px-3 py-2 flex-shrink-0 flex items-center justify-between gap-3 text-sm font-bold cursor-pointer transition-all duration-300`}
            >
              <span>{t('kb.allArticles')}</span>
              <span className={`${activeCategory === t('kb.allArticles') ? 'bg-white text-forest shadow-sm ring-1 ring-black/5' : 'bg-earth text-forest'} text-xs py-0.5 px-2 rounded-full font-semibold`}>
                {articles.length}
              </span>
            </li>
            {categories.map((category) => (
              <li 
                key={category.id} 
                onClick={() => setActiveCategory(category.name)}
                className={`${activeCategory === category.name ? 'bg-forest text-white shadow-md' : 'text-charcoal bg-white lg:bg-transparent border border-earth lg:border-transparent hover:bg-forest/10 hover:text-forest'} rounded-xl px-4 lg:px-3 py-2 flex-shrink-0 flex items-center justify-between gap-3 text-sm font-bold cursor-pointer transition-all duration-300`}
              >
                <span>{category.name}</span>
                <span className={`${activeCategory === category.name ? 'bg-white text-forest shadow-sm ring-1 ring-black/5' : 'bg-earth text-forest'} text-xs py-0.5 px-2 rounded-full font-semibold`}>
                  {articles.filter(a => a.category === category.name).length}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article List */}
        <div className="flex-1 space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 flat-card">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">{t('kb.noArticles')}</h3>
              <p className="text-slate-500 font-medium mt-1">{t('kb.tryAdjusting')}</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div 
                key={article.id} 
                onClick={() => setSelectedArticle(article)}
                className="relative bg-white border border-earth rounded-2xl p-6 cursor-pointer group shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-shadow duration-300 flex flex-col overflow-hidden"
              >
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-32 h-32 bg-forest/5 rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full z-0"></div>

                <div className="flex flex-wrap items-center justify-between gap-y-3 mb-5 z-10 relative">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center text-white bg-forest px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {article.category}
                    </span>
                    <span className="flex items-center text-xs font-bold text-slate-500">
                      <BookOpen className="w-4 h-4 me-1.5 text-forest/70"/> {article.author}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-sand px-2.5 py-1.5 rounded-md border border-slate-100">{article.date}</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-forest transition-colors leading-snug mb-3 z-10 relative">{article.title}</h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed line-clamp-2 mb-6 z-10 relative">
                  {article.excerpt}
                </p>
                
                <div className="mt-auto pt-5 border-t border-earth/60 flex items-center justify-between z-10 relative">
                  <span className="inline-flex items-center text-sm font-bold text-forest group-hover:text-[#254736] transition-colors">
                    Read Article 
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-all duration-300">
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </span>
                  </span>
                  {(user?.role === 'admin' || article.author === user?.name) && (
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingArticleId(article.id); }} className="p-2 text-slate-600 hover:text-forest bg-slate-100 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent border border-transparent hover:border-earth transition-colors cursor-pointer" title={t('kb.editArticle')}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        if(window.confirm(t('kb.deleteConfirm'))) deleteArticle(article.id);
                      }} className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer" title={t('kb.deleteArticle')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
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
