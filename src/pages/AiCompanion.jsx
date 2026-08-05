import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, Bot, User, Loader2 } from 'lucide-react';

export default function AiCompanion() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: t('aiCompanion.mockAiGreeting'),
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: t('aiCompanion.mockAiResponse'),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, integrate with SpeechRecognition API here
  };

  // Simple Markdown renderer for bold and lists
  const renderText = (text) => {
    const parts = text.split('\n');
    return parts.map((part, index) => {
      let formattedPart = part;
      // Bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(formattedPart)) {
        const segments = formattedPart.split(boldRegex);
        return (
          <p key={index} className="mb-2">
            {segments.map((segment, i) => (
              i % 2 === 1 ? <strong key={i} className="font-bold">{segment}</strong> : segment
            ))}
          </p>
        );
      }
      
      // List items
      if (formattedPart.startsWith('- ')) {
        return <li key={index} className="ms-4 list-disc">{formattedPart.substring(2)}</li>;
      }
      
      return <p key={index} className="mb-2">{formattedPart}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('aiCompanion.title')}</h2>
            <p className="text-xs text-emerald-600 font-medium">{t('aiCompanion.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end space-x-3 rtl:space-x-reverse ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-sm rtl:rounded-bl-sm rtl:rounded-br-2xl' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm rtl:rounded-br-sm rtl:rounded-bl-2xl'
            }`}>
              <div className="text-sm leading-relaxed">
                {msg.sender === 'user' ? msg.text : renderText(msg.text)}
              </div>
              <span className={`text-[10px] mt-2 block ${msg.sender === 'user' ? 'text-emerald-100 text-right rtl:text-left' : 'text-slate-400 text-left rtl:text-right'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-end space-x-3 rtl:space-x-reverse justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex space-x-2 rtl:space-x-reverse items-center">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 relative z-10">
        <form onSubmit={handleSend} className="flex items-center space-x-2 rtl:space-x-reverse max-w-4xl mx-auto">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-full flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
              isRecording 
                ? 'bg-rose-100 text-rose-600 animate-pulse' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
            title="Voice Input"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('aiCompanion.inputPlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full focus:ring-emerald-500 focus:border-emerald-500 block px-5 py-3.5 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-emerald-600 text-white rounded-full flex-shrink-0 hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 rtl:-scale-x-100" />
          </button>
        </form>
      </div>
    </div>
  );
}
