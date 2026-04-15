import { useState, useRef, useEffect } from 'react';
import { askAI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AIMessage } from '../types';
import { Bot, Send, User } from 'lucide-react';
import './AICoachPage.css';

const SUGGESTIONS = [
  '¿Qué ejercicios me recomiendas para hoy?',
  '¿Cómo mejorar mi hidratación?',
  'Dame un plan de entrenamiento semanal',
  '¿Cuántas calorías debería consumir?',
  'Consejos para recuperarme mejor',
];

export function AICoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: `¡Hola ${user?.name?.split(' ')[0] ?? 'campeón'}! 💪 Soy tu coach de fitness con IA. ¿En qué puedo ayudarte hoy? Puedo hablar de entrenamientos, nutrición, hidratación o cualquier aspecto de tu salud.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: AIMessage = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askAI(text.trim());
      const assistantMsg: AIMessage = {
        role: 'assistant',
        content: res.data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Lo siento, hubo un error al conectar con el coach. Por favor, inténtalo de nuevo.';
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: apiMessage,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-page animate-fade-up">
      <div className="ai-header">
        <div className="ai-avatar">
          <Bot size={28} />
        </div>
        <div>
          <h2>AI Coach</h2>
          <p className="header-sub">Potenciado por Gemini · Personalizado para ti</p>
        </div>
      </div>

      <div className="chat-container card">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div className="msg-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="msg-bubble">
                <div className="msg-text">{msg.content}</div>
                <div className="msg-time">
                  {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-msg assistant">
              <div className="msg-avatar"><Bot size={16} /></div>
              <div className="msg-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}

        <form className="chat-input-row" onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
          <input
            id="ai-chat-input"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={isLoading}
          />
          <button id="ai-send-btn" type="submit" className="btn btn-primary send-btn" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
