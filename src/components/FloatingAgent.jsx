import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Mic, Zap, Camera, Image as ImageIcon, Clock, Play, Pause, Trash2, Send, Square, X, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchApi } from '../config/api';
import './FloatingAgent.css';

import RobotFace from './RobotFace';
const Waveform = () => (
  <div className="flex items-center justify-center gap-[3px] h-6 w-full">
    {[...Array(15)].map((_, i) => (
      <div 
        key={i} 
        className="w-[3px] bg-[#f0c169] rounded-full animate-wave"
        style={{ 
          height: `${Math.max(30, Math.random() * 100)}%`,
          animationDelay: `${Math.random() * -1.2}s`
        }}
      />
    ))}
  </div>
);

export default function FloatingAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [recordState, setRecordState] = useState('idle'); // 'idle', 'recording', 'reviewing', 'reviewingImage'
  const [previewImage, setPreviewImage] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(new Audio());
  const [language, setLanguage] = useState('en');
  const [sessionTime, setSessionTime] = useState(0);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'ai', isGreeting: true }
  ]);
  const [textInput, setTextInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const { user } = useAuth();
  const { showToast } = useToast();
  const userName = user?.name || (language === 'ur' ? 'کسان' : 'Farmer'); 
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setLanguage('en');
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatHistory, isOpen]);

  useEffect(() => {
    const handleOpenRobot = () => setIsOpen(true);
    window.addEventListener('open-robot', handleOpenRobot);
    return () => window.removeEventListener('open-robot', handleOpenRobot);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);
    
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    
    const audioEl = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audioEl.addEventListener('ended', handleEnded);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      audioEl.removeEventListener('ended', handleEnded);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleListen = async (e) => {
    e.stopPropagation();
    if (recordState === 'idle') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioBlobUrl(url);
          audioRef.current.src = url;
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setRecordState('recording');
      } catch (err) {
        console.error("Microphone access denied or not supported:", err);
        setRecordState('recording'); // Fallback to UI fake recording
      }
    }
    else if (recordState === 'recording') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setRecordState('reviewing');
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioBlobUrl) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        setIsPlaying(!isPlaying); // fallback
      }
    }
  };

  const handleDiscard = (e) => {
    e.stopPropagation();
    setRecordState('idle');
    setIsPlaying(false);
    setPreviewImage(null);
    setFullscreenImage(null);
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      setAudioBlobUrl(null);
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const handleSend = (e) => {
    if (e) e.stopPropagation();
    setRecordState('idle');
    setIsPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setAudioBlobUrl(null);
    
    const logActivity = async (action, details) => {
      try {
        await fetchApi('/dashboard/activities', {
          method: 'POST',
          body: JSON.stringify({ action, details })
        });
      } catch (e) {
        console.error('Failed to log activity', e);
      }
    };

    if (previewImage) {
      logActivity('Query Copilot', 'Sent an image for analysis');
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        sender: 'user',
        type: 'image',
        imageUrl: previewImage
      }]);
      
      const analyzingId = Date.now() + 1;
      setTimeout(() => {
        setChatHistory(prev => [...prev, { id: analyzingId, sender: 'ai', key: 'analyzingImage' }]);
      }, 500);

      setTimeout(() => {
        setChatHistory(prev => prev.map(msg => msg.id === analyzingId ? { ...msg, key: 'imageResult' } : msg));
      }, 3500);
      
      setPreviewImage(null);
    } else if (textInput.trim()) {
      const msgText = textInput.trim();
      logActivity('Text Interactions', msgText.length > 30 ? msgText.substring(0, 30) + '...' : msgText);
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        sender: 'user',
        type: 'text',
        text: msgText
      }]);
      setTextInput('');
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: language === 'ur' 
            ? 'میں آپ کے کھیت کا ڈیٹا چیک کر رہا ہوں۔ فصل کی موجودہ حالت کے مطابق، یہ بہترین ہے...' 
            : 'I am checking your field data. Based on current crop conditions, it is optimal to...'
        }]);
      }, 1500);
    } else if (audioBlobUrl) {
      logActivity('Voice Advisory', 'Completed');
      // Add user message
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        sender: 'user',
        type: 'audio',
        audioUrl: audioBlobUrl,
        text: language === 'ur' ? '🎤 آواز کا پیغام بھیجا گیا' : '🎤 Voice message sent'
      }]);
      setAudioBlobUrl(null);
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: language === 'ur' 
            ? 'میں آپ کے کھیت کا ڈیٹا چیک کر رہا ہوں۔ فصل کی موجودہ حالت کے مطابق، یہ بہترین ہے...' 
            : 'I am checking your field data. Based on current crop conditions, it is optimal to...'
        }]);
      }, 1500);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast(language === 'ur' ? 'کیمرہ کھولنے میں مسئلہ درپیش ہے' : 'Unable to access camera.', '', 'error');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      
      setPreviewImage(dataUrl);
      setRecordState('reviewingImage');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setRecordState('reviewingImage');
    e.target.value = null; // Reset input
  };


  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ur' ? 'en' : 'ur');
  };

  // Translations
  const t = {
    ur: {
      langBtn: 'اردو',
      title: 'لائیو گفتگو',
      recordVoice: 'آواز ریکارڈ کریں',
      listening: 'سن رہا ہوں...',
      liveListening: 'لائیو سن رہا ہے',
      reviewReady: 'ریکارڈنگ تیار ہے',
      liveCallBtn: 'لائیو گفتگو',
      greeting: (name) => `خوش آمدید <span class="text-[#f0c169] font-bold">${name}</span>! میں آپ کا سمارٹ زرعی اسسٹنٹ ہوں۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟`,
      analyzingImage: 'تصویر کا تجزیہ کر رہا ہوں...',
      imageResult: 'میں دیکھ سکتا ہوں کہ فصل میں نائٹروجن کی کمی کے آثار ہیں۔ آپ کو فوراً یوریا کھاد کا استعمال کرنا چاہیے۔',
      chatQ: 'آج پانی دینا چاہیے یا کل؟',
      chatA: 'آج نہیں — جمعہ کو بارش متوقع ہے۔ <span class="text-[#f0c169] font-bold">1,200L</span> پانی اور <span class="text-earth font-bold">340Rs</span> بچ جائیں گے۔'
    },
    en: {
      langBtn: 'EN',
      title: 'Live Chat',
      recordVoice: 'Record Voice',
      listening: 'Listening...',
      liveListening: 'LIVE LISTENING',
      reviewReady: 'Recording Ready',
      liveCallBtn: 'LIVE CHAT',
      greeting: (name) => `Welcome <span class="text-[#f0c169] font-bold">${name}</span>! I am your smart agricultural assistant. How can I help you today?`,
      analyzingImage: 'Analyzing image...',
      imageResult: 'I can see signs of nitrogen deficiency in the crop. You should apply Urea fertilizer immediately.',
      chatQ: 'Should I water today or tomorrow?',
      chatA: 'Not today — rain expected on Friday. You will save <span class="text-[#f0c169] font-bold">1,200L</span> water and <span class="text-earth font-bold">340Rs</span>.'
    }
  };

  const currT = t[language];

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-[9999] flex flex-col items-end rtl:items-start pointer-events-none print:hidden">
      {isOpen ? (
        <div 
          className="bg-forest rounded-[2rem] border border-white/20 w-[90vw] sm:w-[420px] h-[75vh] sm:h-[85vh] max-h-[600px] sm:max-h-[850px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto relative overflow-hidden origin-bottom-right rtl:origin-bottom-left"
        >

          {/* Camera UI Modal */}
          {showCamera && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center rounded-[2rem] overflow-hidden">
              <button 
                onClick={stopCamera}
                className="absolute top-6 right-6 bg-white/20 p-2 rounded-full text-white z-[60] hover:bg-white/40 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute bottom-10 left-0 right-0 flex justify-center z-[60]">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full bg-white rounded-full"></div>
                </button>
              </div>
            </div>
          )}

          {/* Fullscreen Image Preview Modal */}
          {fullscreenImage && (
            <div 
              className="absolute inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center rounded-[2rem] overflow-hidden backdrop-blur-sm cursor-pointer"
              onClick={() => setFullscreenImage(null)}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
                className="absolute top-6 right-6 bg-white/20 p-2 rounded-full text-white z-[80] hover:bg-white/40 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              
              <img 
                src={fullscreenImage} 
                alt="Fullscreen Preview" 
                className="w-full h-full object-contain p-4"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Header (Upper Section) */}
          <div className="flex-shrink-0 flex justify-between items-center px-6 py-2 border-b border-white/10">
            <div className="flex flex-col items-start gap-1">
              <div className="bg-[#f0c169]/10 text-[#f0c169] px-4 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-sm">
                {currT.liveCallBtn} <span className="w-1.5 h-1.5 rounded-full bg-[#f0c169] animate-pulse"></span>
              </div>
              <span className="text-earth/70 text-[10px] font-mono ml-2">{formatTime(sessionTime)}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleLanguage}
                className="bg-white/10 border border-white/30 text-earth px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 min-w-[40px] hover:bg-[#254736] transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                {currT.langBtn}
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="text-earth hover:text-white transition-colors cursor-pointer ml-1 p-1 rounded-full hover:bg-white/10 flex items-center justify-center"
                title={language === 'ur' ? 'بند کریں' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Enhanced Big Robot Section (Upper Section) */}
          <div className="flex-shrink-0 flex flex-row items-center justify-start px-6 pt-2 pb-1 relative z-10 overflow-hidden gap-4">
            <div 
              onClick={toggleListen}
              className={`relative z-10 flex-shrink-0 transition-all duration-500 cursor-pointer animate-float ${recordState === 'recording' ? 'scale-110' : 'hover:scale-110'}`}
            >
              {/* Animated Background Glowing Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#f0c169]/10 rounded-full blur-2xl animate-pulse pointer-events-none"></div>

              {/* Rotating Technical Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/10 border-dashed pointer-events-none animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/5 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-t border-b border-[#f0c169]/30 pointer-events-none animate-[spin_15s_linear_infinite_reverse]"></div>

              {/* Glassmorphism wrapper for robot */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 ${recordState === 'recording' ? 'bg-[#f0c169]/20 border-[#f0c169]/50 shadow-[0_0_40px_rgba(240,193,105,0.4)]' : 'bg-white/5 border-white/20'}`}>
                <RobotFace className="w-7 h-7 drop-shadow-lg" />
              </div>
              
              {/* Recording waves */}
              {recordState === 'recording' && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-[#f0c169] animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75 pointer-events-none"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-[#f0c169] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                </>
              )}
            </div>
            
            <p className={`text-base font-bold tracking-wider transition-colors duration-300 ${recordState === 'recording' ? 'text-[#f0c169] animate-pulse drop-shadow-md' : 'text-white/90 drop-shadow-sm'}`} dir={language === 'ur' ? 'rtl' : 'ltr'}>
              {recordState === 'recording' ? currT.listening : currT.recordVoice}
            </p>
          </div>

          {/* Chat History Section */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-4 flex flex-col bg-black/15 rounded-t-[2rem] border-t border-white/10 mt-2 relative z-20 shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col space-y-4">
              {chatHistory.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`} dir="ltr">
                  {msg.sender === 'user' ? (
                    <div dir={language === 'ur' ? 'rtl' : 'ltr'} className="bg-earth text-forest p-3 rounded-3xl rounded-tr-sm max-w-[85%] font-bold text-sm shadow-lg overflow-hidden">
                      {msg.type === 'image' ? (
                        <img src={msg.imageUrl} alt="Uploaded" onClick={() => setFullscreenImage(msg.imageUrl)} className="w-full h-auto max-w-[200px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                      ) : msg.type === 'audio' ? (
                        <div className="flex flex-col gap-2">
                          <span>{msg.text}</span>
                          <audio controls src={msg.audioUrl} className="w-[250px] max-w-full h-10" onMouseLeave={(e) => e.target.blur()} />
                        </div>
                      ) : (
                        msg.key ? currT[msg.key] : msg.text
                      )}
                    </div>
                  ) : (
                    <div 
                      dir={language === 'ur' ? 'rtl' : 'ltr'}
                      className="bg-black/20 border border-white/20 text-sand p-4 rounded-3xl rounded-tl-sm max-w-[90%] leading-relaxed shadow-lg text-sm"
                      dangerouslySetInnerHTML={{ __html: msg.isGreeting ? currT.greeting(userName) : (msg.key ? currT[msg.key] : msg.text) }}
                    />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Action Panel */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 bg-forest z-30">
            <div className="flex flex-col gap-3">

              {/* Text Input Row */}
              {recordState !== 'recording' && recordState !== 'reviewing' && recordState !== 'reviewingImage' && (
                <form 
                  dir={language === 'ur' ? 'rtl' : 'ltr'}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (textInput.trim()) handleSend();
                  }}
                  className={`bg-black/30 rounded-[1.5rem] border border-white/10 py-1 ${language === 'ur' ? 'pl-1 pr-4' : 'pl-4 pr-1'} flex items-center justify-between gap-2 shadow-inner transition-all focus-within:border-white/30 focus-within:bg-black/40`}
                >
                  <input 
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                    type="text" 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={language === 'ur' ? 'یہاں لکھیں...' : 'Type your message...'}
                    className="no-global-focus flex-1 bg-transparent !border-0 !outline-none !ring-0 !shadow-none text-white placeholder:text-white/40 text-sm py-2 w-full"
                  />
                  <div className={`transition-all duration-300 ${textInput.trim() ? 'opacity-100 scale-100 w-10' : 'opacity-0 scale-50 w-0'} overflow-hidden flex-shrink-0`}>
                    {textInput.trim() && (
                      <button 
                        type="submit"
                        className="w-10 h-10 rounded-full bg-[#f0c169] flex items-center justify-center text-forest cursor-pointer shadow-sm hover:scale-105 transition-transform"
                      >
                        <Send className="w-4 h-4 rtl:-scale-x-100 ltr:-translate-x-0.5 translate-y-0.5 rtl:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                </form>
              )}
              {/* Row 2: Live Listening Pill / Reviewing Pill */}
              {recordState === 'reviewing' || recordState === 'reviewingImage' ? (
                <div className="bg-white/10 rounded-[2.5rem] border border-white/30 p-2 flex flex-row items-center justify-between gap-3 shadow-[0_0_30px_rgba(27,59,44,0.5)] relative overflow-hidden">
                  <button 
                    onClick={handleDiscard} 
                    className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center z-10 bg-terracotta text-sand hover:bg-terracotta/80 transition-colors shadow-lg cursor-pointer"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                  
                  <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                    {recordState === 'reviewingImage' ? (
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        onClick={() => setFullscreenImage(previewImage)}
                        className="h-12 w-auto min-w-[80px] max-w-[120px] object-cover rounded-lg border border-white/20 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-1">
                          <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-forest text-[#f0c169] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                          </button>
                          <span className="text-earth text-base font-bold">{currT.reviewReady}</span>
                        </div>
                        {isPlaying && <div className="w-24 opacity-70"><Waveform /></div>}
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleSend} 
                    className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center z-10 bg-[#f0c169] text-forest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(240,193,105,0.4)] cursor-pointer"
                  >
                    <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5" />
                  </button>
                </div>
              ) : (
                <div className="bg-black/20 rounded-[2.5rem] border border-white/20 p-2 flex flex-row items-center justify-between gap-3 relative overflow-hidden">
                  {/* Action Icons Group */}
                  <div className="flex items-center gap-1.5 sm:gap-2 z-10">
                    <button 
                      onClick={toggleListen} 
                      className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${recordState === 'recording' ? 'bg-[#f0c169] text-forest animate-pulse shadow-[0_0_20px_rgba(240,193,105,0.4)]' : 'bg-sand text-forest'}`}
                    >
                      {recordState === 'recording' ? <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                    
                    {recordState !== 'recording' && (
                      <>
                        <button 
                          onClick={startCamera}
                          className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 border border-white/20 flex items-center justify-center text-earth hover:bg-white/10 transition-colors shadow-lg cursor-pointer"
                        >
                          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <label className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 border border-white/20 flex items-center justify-center text-earth hover:bg-white/10 transition-colors shadow-lg cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </label>
                      </>
                    )}
                  </div>
                  
                  {/* Middle Text/Waveform */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center z-10 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${recordState === 'recording' ? 'bg-[#f0c169] animate-pulse' : 'bg-white/10'}`}></span>
                      <span className={`text-[9px] sm:text-xs font-bold tracking-normal sm:tracking-[0.1em] uppercase whitespace-nowrap ${recordState === 'recording' ? 'text-[#f0c169]' : 'text-earth'}`}>
                        {currT.liveListening}
                      </span>
                    </div>
                    <div className={`w-36 scale-110 transition-opacity duration-300 ${recordState === 'recording' ? 'opacity-100' : 'opacity-20'}`}>
                      <Waveform />
                    </div>
                  </div>
                  
                  {/* Robot */}
                  <div 
                    className="flex-shrink-0 relative z-10 cursor-pointer hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center relative overflow-hidden">
                      <RobotFace className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" />
                    </div>
                    {recordState === 'recording' && (
                      <div className="absolute inset-0 rounded-full border-2 border-[#f0c169] animate-ring-pulse pointer-events-none"></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="animate-float relative group cursor-pointer pointer-events-auto"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-forest border-2 border-white/20 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
            <RobotFace className="w-10 h-10 sm:w-14 sm:h-14 scale-110" />
          </div>
          <div className="absolute inset-0 rounded-full bg-earth opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
        </button>
      )}
    </div>
  );
}
