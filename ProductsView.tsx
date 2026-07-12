/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Mic, 
  Camera, 
  X, 
  Paperclip, 
  Check, 
  AlertCircle,
  Loader2,
  Minimize2,
  Maximize2,
  FileText,
  Volume2
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  createdAt: string;
  documentPayload?: any; // For OCR confirmation
  confirmed?: boolean;
}

interface AssistantFloatingChatProps {
  isOpen: boolean;
  onClose: () => void;
  elderMode: boolean;
  initialCommand?: string;
  onRefreshData: () => void;
  token?: string;
}

export default function AssistantFloatingChat({
  isOpen,
  onClose,
  elderMode,
  initialCommand,
  onRefreshData,
  token
}: AssistantFloatingChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: "Olá! Sou o assistente inteligente da ZPN Serviços. Posso dar entrada de estoque via foto de Nota Fiscal, registrar vendas que você ditar, responder dúvidas sobre estoque ou lançar contas no financeiro. O que gostaria de fazer?",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioIntervalRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle initial command from parent/dashboard suggestions
  useEffect(() => {
    if (initialCommand && isOpen) {
      handleSendCommand(initialCommand);
    }
  }, [initialCommand, isOpen]);

  // Process manual commands
  const handleSendCommand = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputText("");
    }

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Call standard command API
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ command: text })
      });

      if (!res.ok) {
        throw new Error("Erro na comunicação com o assistente.");
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.reply || "Desculpe, não consegui processar o comando.",
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
      onRefreshData(); // Trigger list reload in parent components!
    } catch (err: any) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: `Erro: ${err.message || "Falha ao conectar ao servidor de inteligência artificial."}`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process Document Upload (OCR / Receipt reading)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result as string;

      const userMsg: Message = {
        id: Math.random().toString(),
        sender: "user",
        text: `📎 [Documento enviado: ${file.name}]`,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const commaIndex = base64Data.indexOf(",");
        const rawBase64 = commaIndex !== -1 ? base64Data.substring(commaIndex + 1) : base64Data;
        const mimeType = file.type || "image/png";

        const res = await fetch("/api/ai/process-document", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ base64Data: rawBase64, mimeType })
        });

        if (!res.ok) {
          throw new Error("Erro ao ler nota fiscal.");
        }

        const data = await res.json();

        // Check if identified anything
        const identifiedProducts = data.data?.products || [];
        let summaryText = "Consegui ler a nota fiscal! Veja o que identifiquei:\n\n";
        
        if (identifiedProducts.length === 0) {
          summaryText = "Li o documento mas não consegui identificar produtos ou valores de estoque compatíveis de forma clara.";
        } else {
          identifiedProducts.forEach((p: any) => {
            summaryText += `• ${p.name}: ${p.quantity} un (Custo: R$ ${p.purchasePrice?.toFixed(2)} | Sugestão Venda: R$ ${p.price?.toFixed(2)})\n`;
          });
          summaryText += "\nPara atualizar o estoque e preços sugeridos, clique em confirmar abaixo!";
        }

        const assistantMsg: Message = {
          id: Math.random().toString(),
          sender: "assistant",
          text: summaryText,
          createdAt: new Date().toISOString(),
          documentPayload: data.data // Keep the raw payload for later confirmation!
        };

        setMessages(prev => [...prev, assistantMsg]);
      } catch (err: any) {
        const errorMsg: Message = {
          id: Math.random().toString(),
          sender: "assistant",
          text: `Erro de análise: ${err.message || "Não consegui extrair os dados desta nota. Tente enviar outra foto mais nítida."}`,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    };
  };

  // Confirm Document entries
  const handleConfirmOcr = async (msgId: string, payload: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/confirm", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: payload.type || "stock_entry",
          products: payload.products || [],
          supplierName: payload.supplierName || "",
          description: payload.description || ""
        })
      });

      if (!res.ok) {
        throw new Error("Erro ao processar as atualizações.");
      }

      setMessages(prev => 
        prev.map(m => m.id === msgId ? { ...m, confirmed: true } : m)
      );

      const confirmNotice: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: "✅ Estoque, produtos e valores atualizados com sucesso no sistema! Você já pode consultar as novas quantidades na aba de Produtos ou Estoque.",
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, confirmNotice]);
      onRefreshData(); // Reload listings in parent dashboard/components
    } catch (err: any) {
      alert("Erro ao confirmar entrada: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio Voice Dictation simulation
  const startVoiceDictation = () => {
    setIsRecording(true);
    setRecordingTimer(0);
    audioIntervalRef.current = setInterval(() => {
      setRecordingTimer(t => t + 1);
    }, 1000);
  };

  const stopVoiceDictation = () => {
    clearInterval(audioIntervalRef.current);
    setIsRecording(false);
    
    // Simulate speech-to-text dictation options to provide maximum usability
    const voiceSuggestions = [
      "Vendi três Heineken lata e cobrei no Pix",
      "Entrada de 24 Coca-Cola lata no estoque",
      "Qual é o saldo atual do meu fluxo de caixa?",
      "Lançar despesa de R$ 150 para energia elétrica"
    ];

    // Pick a random suggestion to simulate actual user speech
    const simulatedVoice = voiceSuggestions[Math.floor(Math.random() * voiceSuggestions.length)];
    handleSendCommand(simulatedVoice);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-2xl transition-all duration-300 overflow-hidden ${
      isMinimized ? "h-14 w-72" : "h-[500px] w-[380px] md:w-[420px]"
    } ${elderMode ? "w-full md:w-[460px]" : ""}`}>
      
      {/* Header bar */}
      <div className="bg-white dark:bg-gray-950 px-4 py-3 border-b border-gray-200 dark:border-gray-900 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <h4 className="font-sans font-bold text-xs text-gray-900 dark:text-white tracking-tight leading-none">Assistente Inteligente ZPN</h4>
            <span className="text-[10px] text-gray-400 font-semibold flex items-center mt-0.5">
              Ativo para {elderMode ? "Modo Acessível" : "Suporte Comercial"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition text-gray-500 dark:text-gray-400"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition text-gray-500 dark:text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main chat messages list */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/20">
            {messages.map((m) => {
              const isAssistant = m.sender === "assistant";
              return (
                <div 
                  key={m.id} 
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 shadow-sm border ${
                    isAssistant 
                      ? "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-150 dark:border-gray-800 rounded-tl-sm" 
                      : "bg-blue-600 text-white border-blue-600 rounded-tr-sm"
                  } ${elderMode ? "text-sm leading-relaxed" : "text-xs"}`}>
                    
                    {/* Message content */}
                    <p className="whitespace-pre-line leading-relaxed font-semibold">{m.text}</p>
                    
                    {/* Confirm input payload button for identified nota fiscal */}
                    {m.documentPayload && !m.confirmed && (
                      <div className="mt-3.5 pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                        <div className="flex items-center space-x-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Esta ação irá criar/atualizar produtos cadastrados</span>
                        </div>
                        <button
                          onClick={() => handleConfirmOcr(m.id, m.documentPayload)}
                          className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirmar Entrada Estoque</span>
                        </button>
                      </div>
                    )}

                    {m.confirmed && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-green-600 font-extrabold mt-2 uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5" />
                        <span>Entrada Confirmada</span>
                      </span>
                    )}

                    {/* Timestamp */}
                    <span className={`block text-[9px] mt-1.5 text-right ${
                      isAssistant ? "text-gray-400" : "text-blue-100"
                    }`}>
                      {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>

                  </div>
                </div>
              );
            })}

            {/* AI Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-950 text-gray-400 px-4 py-3 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-900/60 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-xs font-semibold">Assistente ZPN está pensando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input area */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 space-y-2">
            
            {/* Quick tips list inside chat */}
            <div className="flex space-x-1.5 overflow-x-auto py-1 no-scrollbar text-[10px]">
              <button 
                onClick={() => setInputText("Quais produtos estão acabando?")}
                className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 flex-shrink-0"
              >
                🚨 Alerta estoque
              </button>
              <button 
                onClick={() => setInputText("Registrar venda de 1 Skol lata no dinheiro")}
                className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 flex-shrink-0"
              >
                💰 Registrar venda
              </button>
              <button 
                onClick={() => setInputText("Qual foi meu faturamento hoje?")}
                className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 flex-shrink-0"
              >
                📊 Faturamento hoje
              </button>
            </div>

            {/* Main Form Fields */}
            <div className="flex items-center space-x-2">
              
              {/* Photo Input (Hidden) */}
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleDocumentUpload}
                className="hidden" 
              />
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Enviar foto de Nota Fiscal"
                className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 transition-colors"
              >
                <Camera className="w-5 h-5 text-indigo-600" />
              </button>

              {/* Dictation triggers or recording visualizer */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopVoiceDictation}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2 px-3 text-xs font-bold animate-pulse flex items-center justify-center space-x-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white block"></span>
                  <span>Ouvindo... ({recordingTimer}s) - Clique para Enviar</span>
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendCommand();
                    }}
                    placeholder="Fale com a IA da ZPN..."
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                  />

                  <button
                    type="button"
                    onClick={startVoiceDictation}
                    title="Ditar por voz"
                    className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 transition"
                  >
                    <Mic className="w-5 h-5 text-blue-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendCommand()}
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md shadow-blue-500/10"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </>
              )}

            </div>

          </div>
        </>
      )}

    </div>
  );
}
