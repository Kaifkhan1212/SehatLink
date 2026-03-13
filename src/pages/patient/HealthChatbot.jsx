import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Send, User, Bot, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './PatientHome.css';

const HealthChatbot = () => {
  const { currentUser } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your Health Assistant. Tell me how you are feeling today.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callAI = async (userMessage) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY;

    if (!apiKey) {
      throw new Error('AI Service is not configured properly.');
    }

    const systemPrompt = `You are a rural healthcare assistant. Wait for the patient to describe their symptoms. Explain symptoms in very simple language. Do not give complex medical advice. Keep your response short and easy to read. Strongly encourage consulting a doctor if symptoms sound serious or persist.`;

    // Construct conversation history for Gemini (roles: 'user' and 'model')
    const apiMessages = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    apiMessages.push({ role: 'user', parts: [{ text: userMessage }] });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: apiMessages,
        generationConfig: {
          temperature: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to reach the AI service.');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setError(null);

    // Add user message to UI
    const userMsg = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Get AI Response
      const aiResponseText = await callAI(userText);
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponseText };
      
      // Update UI
      setMessages(prev => [...prev, aiMsg]);

      // Save complete interaction to Firestore
      if (currentUser?.id) {
        await addDoc(collection(db, 'chat_messages'), {
          patientId: currentUser.id,
          message: userText,
          response: aiResponseText,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
      setError('Sorry, I am having trouble connecting right now. Please try again.');
      // Remove the user message if it failed, or let them see the error. Let's keep the message and show error.
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <header className="page-header" style={{ marginBottom: '16px' }}>
        <h1>Health Assistant</h1>
        <p>Chat with our AI to understand your symptoms.</p>
      </header>

      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Chat Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0
                }}
              >
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div 
                style={{ 
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'white',
                  color: msg.role === 'user' ? 'white' : 'var(--text-color)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <Bot size={20} />
               </div>
               <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                 <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Assistant is typing...</span>
               </div>
             </div>
          )}

          {error && (
            <div style={{ display: 'flex', gap: '8px', color: 'var(--danger)', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
              <AlertCircle size={20} /> <span>{error}</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms here..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '14px 16px',
                fontSize: '16px',
                borderRadius: '24px',
                border: '2px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <Button 
              type="submit" 
              disabled={isTyping || !input.trim()} 
              style={{ borderRadius: '50%', width: '52px', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={20} />
            </Button>
          </form>
        </div>

      </Card>
    </div>
  );
};

export default HealthChatbot;
