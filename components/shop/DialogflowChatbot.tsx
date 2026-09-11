"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, Bot, PhoneCall, Truck, Package, Heart, RefreshCw, Maximize2, ChevronDown } from "lucide-react";

interface DialogflowChatbotProps {
  siteConfig?: {
    enableChatbot?: boolean;
    dialogflowAgentId?: string;
    dialogflowProjectId?: string;
    dialogflowLocation?: string;
    dialogflowLanguageCode?: string;
    dialogflowChatTitle?: string;
    whatsappUrl?: string;
  };
}

export function DialogflowChatbot({ siteConfig }: DialogflowChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string; options?: Array<{ label: string; action: () => void }> }>>([
    {
      sender: "bot",
      text: "¡Hola! 🌸 Bienvenido a Gabriela's Flowers. Soy tu asistente virtual. ¿Cómo puedo ayudarte hoy?",
      options: [
        { label: "🌹 Ver Ramos Populares", action: () => handleSendOption("Quiero ver los ramos más vendidos") },
        { label: "📦 Rastrear un Pedido", action: () => handleSendOption("¿Cómo puedo rastrear mi pedido?") },
        { label: "🚚 Zonas de Entrega & Horarios", action: () => handleSendOption("¿Cuáles son las zonas y tiempos de entrega?") },
        { label: "💬 Hablar con una Florista", action: () => handleSendOption("Deseo atención personalizada con una florista") },
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const enableChatbot = siteConfig?.enableChatbot !== false;
  const agentId = siteConfig?.dialogflowAgentId;
  const projectId = siteConfig?.dialogflowProjectId;
  const location = siteConfig?.dialogflowLocation || "us-central1";
  const languageCode = siteConfig?.dialogflowLanguageCode || "es";
  const chatTitle = siteConfig?.dialogflowChatTitle || "Gabriela's Flowers Bot 🌸";
  const whatsappUrl = siteConfig?.whatsappUrl || "https://wa.me/18323911835";

  const isRealDialogflowConfigured = Boolean(agentId && projectId && agentId.trim() !== "" && projectId.trim() !== "");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!enableChatbot) return null;

  const handleSendOption = (text: string) => {
    sendMessage(text);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = text.trim();
    const updatedMessages = [...messages, { sender: "user" as const, text: userMsg }];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data && data.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: data.reply,
            options: [
              { label: "🌸 Ver Catálogo", action: () => window.location.href = "/productos" },
              { label: "💬 Hablar por WhatsApp", action: () => window.open(whatsappUrl, "_blank") }
            ]
          }
        ]);
      } else {
        throw new Error("Respuesta inválida");
      }
    } catch (error) {
      console.error("Error al conectar con la API de Chat:", error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "¡Hola! 🌸 Gracias por tu mensaje. Para una atención rápida o personalizar tu pedido al instante, te invitamos a escribirnos directo por WhatsApp.",
          options: [
            { label: "🌸 Ver Catálogo", action: () => window.location.href = "/productos" },
            { label: "💬 Chatear por WhatsApp", action: () => window.open(whatsappUrl, "_blank") }
          ]
        }
      ]);
    }
  };

  return (
    <>
      {/* Si se configuró Dialogflow CX oficial con credenciales en el Admin */}
      {isRealDialogflowConfigured && (
        <>
          <link
            rel="stylesheet"
            href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css"
          />
          <Script
            src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"
            strategy="lazyOnload"
          />
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <df-messenger
                  project-id="${projectId}"
                  agent-id="${agentId}"
                  language-code="${languageCode}"
                  max-query-length="-1">
                  <df-messenger-chat
                    chat-title="${chatTitle}">
                  </df-messenger-chat>
                </df-messenger>
              `,
            }}
          />
        </>
      )}

      {/* Si NO se ha conectado a Google Cloud aún, se muestra el Asistente Boutique Nativo */}
      {!isRealDialogflowConfigured && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          
          {/* Ventana de Chat Abierta */}
          {isOpen && (
            <div className="w-[90vw] sm:w-[380px] h-[520px] max-h-[80vh] bg-white/95 dark:bg-[#12131A]/95 backdrop-blur-2xl rounded-3xl border border-[#D4AF37]/30 dark:border-gray-800 shadow-[0_20px_60px_rgba(42,0,2,0.3)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden mb-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
              
              {/* Encabezado del Chat Expandido */}
              <div className="bg-gradient-to-r from-[#80273B] via-[#982D46] to-[#2B0002] p-4 text-white flex items-center justify-between shadow-md flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#D4AF37]/60 overflow-hidden bg-white p-0.5 shadow-sm flex items-center justify-center">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-sm leading-tight flex items-center gap-1.5">
                      <span>Gabriela's Assistant</span>
                      <Sparkles size={13} className="text-[#D4AF37]" />
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      En línea 24/7
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Botón Minimizar a Mini-Chat */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-all"
                    title="Minimizar Asistente"
                    aria-label="Minimizar Asistente"
                  >
                    <ChevronDown size={18} />
                  </button>
                  {/* Botón Cerrar */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-all"
                    title="Cerrar Chat"
                    aria-label="Cerrar Chat"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs chatbot-messages-area">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed font-medium ${
                        msg.sender === "user"
                          ? "bg-[#80273B] text-white rounded-br-none shadow-sm"
                          : "bg-gray-100 dark:bg-gray-800/90 text-black dark:text-gray-100 rounded-bl-none border border-gray-200/80 dark:border-gray-700 shadow-sm chatbot-bot-bubble"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Botones de Opciones Rápidas */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={opt.action}
                            className="bg-white dark:bg-pink-950/60 text-black dark:text-pink-300 border border-gray-300 dark:border-pink-900/60 hover:bg-[#80273B] hover:text-white dark:hover:bg-[#80273B] dark:hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shadow-xs active:scale-95 text-left chatbot-chip-btn"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Botón Permanente de WhatsApp en cada respuesta del Bot */}
                    {msg.sender === "bot" && (
                      <div className="mt-2.5">
                        <a
                          href={`${whatsappUrl}?text=${encodeURIComponent("¡Hola Gabriela's Flowers! 🌸 Vengo desde el Asistente Virtual y deseo una consulta floral personalizada.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2 rounded-xl text-[11px] font-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
                        >
                          <MessageCircle size={14} fill="white" className="text-transparent" />
                          <span>Preguntar directo al WhatsApp 💬</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl w-16 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barra de Entrada de Texto */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="p-3 border-t border-gray-200/80 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu consulta aquí..."
                  className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-gray-100 text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-[#80273B] dark:focus:border-pink-500 font-medium chatbot-input"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 bg-[#80273B] text-white rounded-xl hover:bg-[#2B0002] transition-all disabled:opacity-40 active:scale-95 shadow-sm"
                  aria-label="Enviar Mensaje"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* ESTADO MINIFICADO: Mini-Tarjeta Chat Flotante (Tipo Reproductor Mini / Thumbnail) */}
          {!isOpen && (
            <div
              onClick={() => setIsOpen(true)}
              className="group w-[280px] sm:w-[310px] bg-white/95 dark:bg-[#12131A]/95 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/40 dark:border-gray-800 shadow-[0_15px_40px_rgba(42,0,2,0.22)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-3.5 cursor-pointer hover:scale-[1.03] active:scale-98 transition-all duration-300 origin-bottom-right relative overflow-hidden"
              role="button"
              aria-label="Abrir y expandir Asistente Virtual"
            >
              {/* Brillo sutil decorativo */}
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-xl pointer-events-none"></div>

              {/* Cabecera del Mini-Chat */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/60 bg-white p-0.5 shadow-xs flex-shrink-0">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
                  </div>
                  <div className="leading-tight">
                    <h5 className="font-serif font-black text-xs text-[#2B0002] dark:text-white flex items-center gap-1">
                      <span>Gabriela's Assistant</span>
                      <Sparkles size={11} className="text-[#D4AF37]" />
                    </h5>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      En línea 24/7 🌸
                    </span>
                  </div>
                </div>

                <div className="p-1.5 bg-[#80273B] text-white rounded-full group-hover:scale-110 transition-transform shadow-sm">
                  <Maximize2 size={13} />
                </div>
              </div>

              {/* Burbuja Preview del Mini-Chat */}
              <div className="py-2.5 text-slate-800 dark:text-gray-200">
                <div className="p-2.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 text-[11px] leading-relaxed font-medium chatbot-mini-preview text-black dark:text-gray-100">
                  {messages.length > 0 && messages[messages.length - 1].sender === "bot"
                    ? messages[messages.length - 1].text.slice(0, 75) + "..."
                    : "¡Hola! 🌸 ¿Cómo puedo ayudarte hoy con tus flores?"}
                </div>
              </div>

              {/* Barra de Acción Rápida para Expandir */}
              <div className="flex items-center justify-between text-[10px] font-extrabold text-[#80273B] dark:text-pink-300 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-150 dark:border-gray-700/60">
                <span>💬 Toca para chatear</span>
                <span className="text-[9px] uppercase tracking-wider opacity-75">Expandir ↗</span>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}
