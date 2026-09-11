"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, RefreshCw, PhoneCall, ExternalLink, Bot, ChevronRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const I18N_CONTENT = {
  es: {
    quickQuestions: [
      "🌸 Ver arreglos de cumpleaños",
      "🌹 Ramos de rosas románticos",
      "🚚 ¿Cómo funciona el delivery en Houston?",
      "💍 Arreglos para aniversarios"
    ],
    previewTickers: [
      "¿Buscas flores hoy? Te ayudo a elegir 🌸",
      "🚚 Delivery el mismo día en Houston",
      "🌹 Rosas de lujo y arreglos exclusivos",
      "💬 Consulta precios y disponibilidad aquí"
    ],
    welcomeMessage: "¡Hola! 🌸 Soy **Gabriela** de *Gabriela's Flowers* en Houston.\n\n¿Para qué ocasión especial estás buscando flores hoy?",
    resetMessage: "¡Hola de nuevo! 🌸 ¿En qué te puedo ayudar?",
    errorMessage: "🌸 Hubo un pequeño inconveniente de conexión. Puedes escribirnos directo a nuestro WhatsApp [+1 832 391-1835](https://wa.me/18323911835) para asistirte de inmediato.",
    defaultErrorResponse: "Disculpa, no pude procesar tu solicitud. Por favor intenta nuevamente.",
    advisorRole: "GABRIELA • ASESORA FLORAL",
    liveBadge: "EN LÍNEA",
    headerStatus: "Asesora Floral • En línea 🌸",
    ariaOpen: "Abrir Asistente Floral Gabriela",
    ariaRestart: "Reiniciar chat",
    ariaClose: "Cerrar chat",
    ariaSend: "Enviar mensaje",
    searchingCatalog: "Gabriela está escribiendo...",
    popularQuestions: "Consultas populares:",
    inputPlaceholder: "Escribe tu consulta aquí...",
    poweredBy: "Asistente Floral • Gabriela's Flowers",
  },
  en: {
    quickQuestions: [
      "🌸 View birthday arrangements",
      "🌹 Romantic rose bouquets",
      "🚚 How does Houston delivery work?",
      "💍 Anniversary floral designs"
    ],
    previewTickers: [
      "Looking for flowers today? I'll help you choose 🌸",
      "🚚 Same-day delivery in Houston",
      "🌹 Luxury roses & exclusive arrangements",
      "💬 Check prices & availability here"
    ],
    welcomeMessage: "Hello! 🌸 I'm **Gabriela** at *Gabriela's Flowers* in Houston.\n\nWhat special occasion are you looking for flowers for today?",
    resetMessage: "Hello again! 🌸 How can I help you today?",
    errorMessage: "🌸 There was a brief connection issue. You can message us directly on WhatsApp [+1 832 391-1835](https://wa.me/18323911835) for instant assistance.",
    defaultErrorResponse: "Sorry, I couldn't process your request. Please try again.",
    advisorRole: "GABRIELA • FLORAL ADVISOR",
    liveBadge: "ONLINE",
    headerStatus: "Floral Advisor • Online 🌸",
    ariaOpen: "Open Gabriela Floral Assistant",
    ariaRestart: "Restart chat",
    ariaClose: "Close chat",
    ariaSend: "Send message",
    searchingCatalog: "Gabriela is typing...",
    popularQuestions: "Popular questions:",
    inputPlaceholder: "Type your message here...",
    poweredBy: "Floral Advisor • Gabriela's Flowers",
  }
};

const CHAT_STORAGE_KEY = "gf_chat_history_v1";
const CHAT_STORAGE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export const ChatbotModal = () => {
  const pathname = usePathname();

  // No renderizar el chatbot en el panel de administración
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  let currentLocale = "es";
  try {
    const intlLocale = useLocale();
    if (intlLocale === "en" || intlLocale === "es") {
      currentLocale = intlLocale;
    }
  } catch (e) {}

  if (pathname?.startsWith("/en")) {
    currentLocale = "en";
  }

  const content = currentLocale === "en" ? I18N_CONTENT.en : I18N_CONTENT.es;

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const isHydratedRef = useRef(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "model",
      text: content.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Cargar historial persistido al montar en el navegador
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          const isExpired = Date.now() - (parsed.savedAt || 0) > CHAT_STORAGE_TTL;
          if (!isExpired) {
            setMessages(parsed.messages);
          } else {
            localStorage.removeItem(CHAT_STORAGE_KEY);
          }
        }
      }
    } catch (e) {
      console.warn("Error cargando historial de chat:", e);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Guardar historial en localStorage ante cualquier cambio
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      if (messages.length === 1 && messages[0].id === "welcome-msg") {
        return;
      }
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
        savedAt: Date.now(),
        messages
      }));
    } catch (e) {
      console.warn("Error guardando historial de chat:", e);
    }
  }, [messages]);

  // Sincronizar mensaje de bienvenida si cambia el idioma y no hay historial previo
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "welcome-msg") {
        return [{
          id: "welcome-msg",
          role: "model",
          text: content.welcomeMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [currentLocale]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotador automático de mensajes en el mini-reproductor
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % content.previewTickers.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [content.previewTickers.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const startTime = Date.now();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      let clientContext: { customerName?: string; lastOrderId?: string } = {};
      try {
        const customerName = localStorage.getItem("customerName") || "";
        const lastOrderId = localStorage.getItem("lastOrderId") || "";
        if (customerName || lastOrderId) {
          clientContext = {
            customerName: customerName || undefined,
            lastOrderId: lastOrderId || undefined
          };
        }
      } catch (e) {}

      const apiHistory = newMessages.map(m => ({
        role: m.role,
        text: m.text
      })).slice(-16);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiHistory,
          locale: currentLocale,
          clientContext: Object.keys(clientContext).length > 0 ? clientContext : undefined
        })
      });

      if (!res.ok) throw new Error("Error en la respuesta");
      const data = await res.json();

      // Simular delay humano de digitación (1.2s - 1.8s proporcional al texto)
      // mientras se mantiene visible la animación de "Gabriela está escribiendo..."
      const responseLen = (data.text || "").length || 60;
      const targetDelay = Math.min(2000, Math.max(1200, responseLen * 12));
      const elapsed = Date.now() - startTime;
      if (elapsed < targetDelay) {
        await new Promise(resolve => setTimeout(resolve, targetDelay - elapsed));
      }

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text || content.defaultErrorResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: content.errorMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (e) {}
    setMessages([
      {
        id: Date.now().toString(),
        role: "model",
        text: content.resetMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormattedText = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const [, label, url] = match;
      parts.push(
        url.startsWith('/') ? (
          <Link
            key={match.index}
            href={url}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 font-bold text-[#8B0024] dark:text-pink-300 underline hover:text-[#5a0014] bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded transition-colors my-0.5"
          >
            {label} <ExternalLink size={12} />
          </Link>
        ) : (
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#25D366] underline hover:text-[#1da851] bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded transition-colors my-0.5"
          >
            {label} <ExternalLink size={12} />
          </a>
        )
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Botón Flotante Estilo Mini-Reproductor / Thumbnail Visual Preview */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
          aria-label={content.ariaOpen}
          className="fixed bottom-5 right-4 sm:right-6 z-40 cursor-pointer group select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-md pl-2 pr-3.5 sm:pr-4 py-2 rounded-2xl shadow-[0px_10px_35px_rgba(139,0,36,0.25)] border-2 border-[#D4AF37]/80 hover:border-[#D4AF37] hover:shadow-[0px_12px_40px_rgba(139,0,36,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] max-w-[310px] sm:max-w-none">
            
            {/* Thumbnail / Portada estilo Mini-Player */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-[#D4AF37] shadow-sm relative group-hover:scale-105 transition-transform duration-300 bg-[#2a0002]">
                <img
                  src="/logo.jpg"
                  alt="Gabriela Asesora IA"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-0.5 right-0.5">
                  <Sparkles size={11} className="text-[#D4AF37] animate-pulse" />
                </div>
              </div>

              {/* Indicador de Estado En Vivo con Ondas */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#25D366] border-2 border-white dark:border-[#12131a]"></span>
              </span>
            </div>

            {/* Texto y Ticker Dinámico estilo Mini-Player */}
            <div className="flex flex-col text-left overflow-hidden min-w-[155px] sm:min-w-[200px]">
              <div className="flex items-center gap-1.5 leading-none mb-1">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black dark:text-pink-400">
                  {content.advisorRole}
                </span>
                <span className="flex items-center gap-0.5 text-[8px] bg-green-100 dark:bg-green-950/60 text-green-900 dark:text-green-300 font-extrabold px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span>
                  {content.liveBadge}
                </span>
              </div>

              {/* Ticker de mensaje animado */}
              <div className="h-4 overflow-hidden relative">
                <p 
                  key={tickerIndex} 
                  className="text-[11px] sm:text-xs font-bold text-black dark:text-gray-200 truncate animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  {content.previewTickers[tickerIndex]}
                </p>
              </div>
            </div>

            {/* Botón Acción Mini-Player (Ícono de Chat / Play) */}
            <div className="flex-shrink-0 bg-gradient-to-r from-[#8B0024] to-[#a81436] text-white p-2 rounded-xl shadow-md group-hover:bg-[#70001d] transition-colors flex items-center justify-center">
              <MessageSquare size={16} className="text-white group-hover:scale-110 transition-transform" />
            </div>

          </div>
        </div>
      )}

      {/* Ventana Modal del Chatbot */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[410px] h-[560px] max-h-[85vh] bg-white dark:bg-[#12131a] rounded-3xl shadow-[0px_20px_50px_rgba(0,0,0,0.35)] border-2 border-[#D4AF37]/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header del Chatbot */}
          <div className="bg-gradient-to-r from-[#2a0002] via-[#8B0024] to-[#2a0002] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/40 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="Gabriela's Flowers"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2a0002]"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">Gabriela</span>
                  <span className="text-[9px] bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/40 px-1.5 py-0.2 rounded font-black tracking-wider">IA</span>
                </div>
                <span className="text-[11px] text-pink-200/90 font-medium flex items-center gap-1">
                  {content.headerStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title={content.ariaRestart}
                className="p-1.5 hover:bg-white/10 rounded-xl text-pink-200 hover:text-white transition-colors"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title={content.ariaClose}
                className="p-1.5 hover:bg-white/10 rounded-xl text-pink-200 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#fffaf9] dark:bg-[#0d0e14] text-sm leading-relaxed">
            
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm whitespace-pre-line shadow-sm ${
                      isUser
                        ? 'bg-[#8B0024] text-white rounded-br-none'
                        : 'bg-white dark:bg-[#1a1b24] text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-gray-800 rounded-bl-none'
                    }`}
                  >
                    {renderFormattedText(m.text)}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {/* Animación de escribiendo... */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a1b24] w-fit px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#8B0024] dark:bg-pink-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#8B0024] dark:bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-[#8B0024] dark:bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] font-medium">{content.searchingCatalog}</span>
              </div>
            )}

            {/* Preguntas Rápidas sugeridas si es el inicio */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {content.popularQuestions}
                </span>
                {content.quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left text-xs bg-white dark:bg-[#181922] hover:bg-[#fff0ef] dark:hover:bg-pink-950/40 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl transition-all font-medium hover:border-[#8B0024]/40 flex items-center justify-between group shadow-sm"
                  >
                    <span>{q}</span>
                    <span className="text-[#8B0024] dark:text-pink-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer e Input de Mensaje */}
          <div className="p-3 bg-white dark:bg-[#12131a] border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={content.inputPlaceholder}
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm bg-gray-50 dark:bg-[#1c1d28] text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-[#8B0024] dark:focus:border-pink-400 transition-colors placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label={content.ariaSend}
                className="bg-[#8B0024] hover:bg-[#70001d] disabled:opacity-50 text-white p-2.5 rounded-xl transition-all flex items-center justify-center shadow-md hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                <Send size={16} />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1 pt-0.5">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-[#D4AF37]" />
                {content.poweredBy}
              </span>
              <a
                href="https://wa.me/18323911835"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline flex items-center gap-1 font-semibold"
              >
                <PhoneCall size={11} /> WhatsApp
              </a>
            </div>

          </div>

        </div>
      )}
    </>
  );
};
