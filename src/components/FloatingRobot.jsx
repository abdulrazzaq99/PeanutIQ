import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function FloatingRobot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Only trigger greeting once per session after login
    const hasGreeted = sessionStorage.getItem('robotGreeted');
    
    if (user && !hasGreeted) {
      // Simulate a small delay after login
      const timer = setTimeout(() => {
        setMessages([
          { id: 1, sender: 'bot', translationKey: 'robot.greeting', translationParams: { name: user.name || 'User' } }
        ]);
        setIsOpen(true);
        sessionStorage.setItem('robotGreeted', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    } else if (user && hasGreeted && messages.length === 0) {
      setMessages([
        { id: 1, sender: 'bot', translationKey: 'robot.greeting', translationParams: { name: user.name || 'User' } }
      ]);
    }
  }, [user, t, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    // Simulate bot response
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, sender: 'bot', translationKey: 'robot.defaultReply' };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50 flex flex-col items-end rtl:items-start">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-earth w-80 sm:w-96 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-forest p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold">{t('robot.title')}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-sand/30">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-forest text-white rounded-br-sm rtl:rounded-bl-sm rtl:rounded-br-2xl' : 'bg-white border border-earth text-charcoal rounded-bl-sm rtl:rounded-br-sm rtl:rounded-bl-2xl'}`}>
                  <p className="text-sm">{msg.translationKey ? t(msg.translationKey, msg.translationParams) : msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-earth flex items-center gap-">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('robot.placeholder')}
              className="flex-1 bg-sand border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-forest focus:outline-none"
            />
            <button type="submit" disabled={!inputValue.trim()} className="bg-forest text-white p-2 rounded-xl hover:bg-forest/90 disabled:opacity-50 transition-colors cursor-pointer">
              <Send className="w-5 h-5 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}
      
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-forest text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-forest/30 cursor-pointer relative"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!isOpen && messages.length > 0 && (
          <span className="absolute top-0 ltr:right-0 rtl:left-0 block h-3 w-3 rounded-full bg-terracotta ring-2 ring-white animate-pulse"></span>
        )}
      </button>
    </div>
  );
}
