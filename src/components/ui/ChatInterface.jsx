import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import { Send, User } from 'lucide-react';
import './ChatInterface.css';

const ChatInterface = ({ consultationId, currentUserId }) => {
  const { messages, sendMessage } = useAppContext();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Filter messages for this specific consultation
  const consultationMessages = messages.filter(m => m.consultationId === consultationId);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [consultationMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim()) {
      // In this system, currentUser context varies slightly between patient/doctor pages.
      // We pass currentUserId down to identify sender side.
      sendMessage(consultationId, currentUserId, 'Me', text);
      setText('');
    }
  };

  if (!consultationId) return null;

  return (
    <Card className="chat-interface">
      <div className="chat-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <User size={20} /> Consultation Chat
        </h3>
      </div>
      
      <div className="chat-messages">
        {consultationMessages.length > 0 ? (
          consultationMessages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`chat-message ${isMe ? 'own-message' : 'other-message'}`}>
                <div className="message-bubble">
                  {!isMe && <div className="message-sender">{msg.senderName}</div>}
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="chat-empty">
            <p>No messages yet. Send a message to start the consultation.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="chat-input-field"
        />
        <button type="submit" disabled={!text.trim()} className="chat-send-btn">
          <Send size={18} />
        </button>
      </form>
    </Card>
  );
};

export default ChatInterface;
