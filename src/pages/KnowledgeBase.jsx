import { useState } from 'react';
import { 
  Search, BookOpen, ChevronRight, FileText, 
  Download, Sparkles, X, ArrowLeft, Loader2, Info, Pencil, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categories = [
  { id: 1, name: 'Cultivation Practices', count: 24 },
  { id: 2, name: 'Disease Management', count: 18 },
  { id: 3, name: 'Seed Quality Standards', count: 12 },
  { id: 4, name: 'Historical Records', count: 8 },
  { id: 5, name: 'Disease Forecasting', count: 5 },
];

const initialArticles = [
  { 
    id: 1, 
    title: 'NARC Recommended Groundnut Varieties for Pothwar', 
    category: 'Cultivation Practices',
    date: 'Aug 1, 2026',
    author: 'NARC Islamabad',
    excerpt: 'Detailed guide on high-yielding peanut varieties suited for rainfed conditions of the Pothwar region including BARI-2016.',
    content: 'The Pothwar region accounts for the majority of groundnut production in Pakistan. The National Agricultural Research Centre (NARC) highly recommends the BARI-2016 variety due to its high yield potential and resistance to drought conditions. Farmers are advised to maintain a seed rate of 25-30 kg per acre and ensure sowing between April and May. Proper land preparation, including deep ploughing and planking, is crucial for moisture conservation.'
  },
  { 
    id: 2, 
    title: 'Early Leaf Spot (Cercospora arachidicola) Management Protocol', 
    category: 'Disease Management',
    date: 'Jul 28, 2026',
    author: 'BARI Chakwal',
    excerpt: 'Preventive measures and fungicidal recommendations for controlling Early Leaf Spot in peanut crops during monsoon season.',
    content: 'Early Leaf Spot is a devastating fungal disease that thrives in high humidity (>80%) and temperatures between 25-30°C. Initial symptoms include brown circular spots surrounded by yellow halos on the upper leaf surface. Management protocols dictate prophylactic spraying of systemic fungicides such as Chlorothalonil (2ml/L) immediately upon symptom onset. Cultural practices like crop rotation and deep burying of crop residues significantly reduce primary inoculum.'
  },
  { 
    id: 3, 
    title: 'Seed Viability and Germination Testing Guidelines', 
    category: 'Seed Quality Standards',
    date: 'Jun 15, 2026',
    author: 'Agricultural Extension Dept',
    excerpt: 'Standard procedures for testing peanut seed germination rates before sowing to ensure optimal plant density.',
    content: 'To achieve optimal plant density (approx. 60,000 plants/acre), seed viability testing must be conducted 2 weeks prior to sowing. Select 100 random seeds from the batch. Soak them overnight and place them in moist paper towels at room temperature. A germination rate of >85% within 7 days is considered standard for certified seeds. Treat seeds with Imidacloprid and Thiram before planting to prevent soil-borne pests and seedling rot.'
  },
  { 
    id: 4, 
    title: 'Historical Outbreak Analysis: Pothwar Region 2022-2025', 
    category: 'Historical Records',
    date: 'Jan 10, 2026',
    author: 'Crop Reporting Service',
    excerpt: 'A retrospective analysis of the severe Rosette Virus and Late Leaf Spot outbreaks and their economic impact.',
    content: 'Between 2022 and 2025, the Pothwar region experienced unusually heavy late-monsoon showers, triggering widespread outbreaks of Late Leaf Spot and Groundnut Rosette Virus (GRV). GRV, transmitted by the aphid Aphis craccivora, caused up to 40% yield loss in late-sown fields. Data analysis reveals that fields planted early (mid-April) experienced significantly lower vector pressure, highlighting the importance of adjusting planting windows in response to changing climatic patterns.'
  },
  { 
    id: 5, 
    title: 'Predictive Modeling for Fungal Pathogen Spores', 
    category: 'Disease Forecasting',
    date: 'May 05, 2026',
    author: 'Agri-Tech AI Lab',
    excerpt: 'Using micro-climate data to predict the dispersion of fungal spores for precision fungicide application.',
    content: 'Our latest predictive models integrate real-time field telemetry (temperature, leaf wetness duration, and relative humidity) to forecast spore germination events. We found that 12 consecutive hours of leaf wetness combined with temperatures above 22°C triggers massive spore release. By applying protective fungicides exactly 48 hours prior to these predicted events, farmers can reduce chemical usage by 30% while maintaining complete crop protection.'
  }
];

export default function KnowledgeBase() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'researcher';
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Articles');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  
  // AI State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiState, setAiState] = useState('idle'); // idle, thinking, complete
  const [aiResponse, setAiResponse] = useState('');

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'All Articles' || article.category === activeCategory;
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
        if (searchQuery.toLowerCase().includes('leaf spot')) {
          setAiResponse("Based on BARI's Disease Management Protocol, Early Leaf Spot loves high humidity. You should spray a fungicide like Chlorothalonil (2ml per Litre of water) as soon as you see brown spots with yellow rings. Also, remember to clear out old plant debris from your field to stop the fungus from surviving the winter.");
        } else if (searchQuery.toLowerCase().includes('seed') || searchQuery.toLowerCase().includes('sow')) {
          setAiResponse("According to NARC and Extension guidelines, you should use the BARI-2016 variety. Use 25-30 kg of seeds per acre and sow between April and May. Before planting, test your seeds by sprouting 100 of them in wet paper towels—if 85 sprout, you're good to go! Don't forget to treat them with fungicide before putting them in the soil.");
        } else {
          setAiResponse("I couldn't find specific institutional research for that exact query. However, generally, ensuring good drainage, timely weeding, and using certified NARC/BARI seed varieties will protect your yield. Try asking about 'leaf spot', 'seeds', or 'sowing times'.");
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
      setArticles(articles.map(a => a.id === editingArticleId ? updatedArticle : a));
      setEditingArticleId(null);
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-screen">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Article</h2>
          <button 
            onClick={() => setEditingArticleId(null)}
            className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" defaultValue={articleToEdit.title} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" defaultValue={articleToEdit.category} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea name="excerpt" defaultValue={articleToEdit.excerpt} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea name="content" defaultValue={articleToEdit.content} rows={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setEditingArticleId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer">Save Changes</button>
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
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
        </button>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{selectedArticle.category}</span>
            <span>•</span>
            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1"/> {selectedArticle.author}</span>
            <span>•</span>
            <span>{selectedArticle.date}</span>
          </div>
          
          <h1 className="text-3xl font-black text-gray-900">{selectedArticle.title}</h1>
          <p className="text-lg text-gray-600 italic border-l-4 border-gray-200 pl-4">{selectedArticle.excerpt}</p>
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Knowledge Base & Research</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Institutional peanut cultivation guidelines and AI assistance</p>
        </div>
      </div>

      {/* Search Bar & AI Toggle */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isAiMode ? <Sparkles className="h-5 w-5 text-indigo-500" /> : <Search className="h-5 w-5 text-slate-400" />}
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-32 py-4 rounded-xl leading-5 bg-transparent placeholder-slate-500 focus:outline-none text-base text-slate-900 font-medium" 
            placeholder={isAiMode ? "Ask Agentic AI about peanut farming..." : "Search research papers and protocols..."} 
            type="search" 
          />
          <div className="absolute right-2 flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setIsAiMode(false)}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 ${!isAiMode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsAiMode(true)}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 flex items-center ${isAiMode ? 'bg-indigo-500 shadow-sm text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Sparkles className="w-4 h-4 mr-1" /> Ask AI
            </button>
          </div>
        </form>
      </div>

      {/* AI Reasoning State */}
      {isAiMode && aiState !== 'idle' && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 shadow-sm">
          {aiState === 'thinking' ? (
            <div className="flex items-center text-purple-700">
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              <span className="font-medium">Agentic AI is retrieving NARC/BARI research and reasoning...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-purple-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" /> Farmer-Friendly AI Recommendation
                </h3>
                <button onClick={() => setAiState('idle')} className="text-purple-400 hover:text-purple-700"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-purple-800 leading-relaxed text-sm">{aiResponse}</p>
              <div className="flex items-center text-xs text-purple-600 mt-4">
                <Info className="w-4 h-4 mr-1" /> Derived from official institutional protocols.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mt-8 items-start">
        {/* Sidebar Categories */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-28">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-2">
            <li 
              onClick={() => setActiveCategory('All Articles')}
              className={`${activeCategory === 'All Articles' ? 'bg-emerald-500/10 text-emerald-700' : 'text-slate-600 hover:bg-slate-500/5'} rounded-xl px-3 py-2 flex items-center justify-between text-sm font-bold cursor-pointer transition-all duration-300`}
            >
              <span>All Articles</span>
              <span className={`${activeCategory === 'All Articles' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/50 text-slate-600'} text-xs py-0.5 px-2 rounded-full font-semibold`}>
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
              <h3 className="text-xl font-bold text-slate-900">No articles found</h3>
              <p className="text-slate-500 font-medium mt-1">Try adjusting your search or category filter.</p>
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
                      <span className="flex items-center font-medium"><BookOpen className="w-3.5 h-3.5 mr-1.5"/> {article.author}</span>
                      <span>•</span>
                      <span className="font-medium">{article.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors pr-8 leading-tight">{article.title}</h3>
                    <p className="mt-3 text-sm font-medium text-slate-600 leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  {isAdmin ? (
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2 pt-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingArticleId(article.id); }}
                        className="p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer shadow-sm border border-slate-200"
                        title="Edit Article"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if(window.confirm('Are you sure you want to delete this article?')) {
                            setArticles(articles.filter(a => a.id !== article.id));
                          }
                        }}
                        className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shadow-sm border border-slate-200"
                        title="Delete Article"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="ml-4 flex-shrink-0 pt-2 bg-slate-50 rounded-full p-2 group-hover:bg-emerald-50 transition-colors shadow-sm border border-slate-200">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
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
