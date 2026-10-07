import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, RefreshCw } from 'lucide-react';
import { sendMessage } from '../services/chatbot';
import './ChatWidget.css';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Mình có thể giúp bạn tìm việc phù hợp hôm nay.", sender: 'bot', time: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const newMsg = { id: Date.now(), text, sender: 'user', time: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(false);

    try {
      const response = await sendMessage(text, messages);
      setMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'bot', time: new Date() }]);
    } catch (err) {
      setError(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text) => {
    handleSend(text);
  };

  return (
    <>
      {/* Floating Button */}
      <div className={`chat-fab ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
        <MessageSquare size={24} color="white" />
        <span className="chat-badge"></span>
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <Bot size={20} />
              <span className="status-dot"></span>
            </div>
            <div>
              <h4>Trợ lý JobViet</h4>
              <p>Đang hoạt động</p>
            </div>
          </div>
          <button className="chat-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chat-body">
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className="message-bubble">{msg.text}</div>
                <div className="message-time">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="chat-error">
                <p>Xin lỗi, có lỗi xảy ra, vui lòng thử lại</p>
                <button onClick={() => handleSend(messages[messages.length-1].text)}>
                  <RefreshCw size={14} /> Thử lại
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-suggestions">
            <button onClick={() => handleQuickReply('Tìm việc IT')}>Tìm việc IT</button>
            <button onClick={() => handleQuickReply('Cách tạo CV')}>Cách tạo CV</button>
            <button onClick={() => handleQuickReply('Việc làm lương cao')}>Việc làm lương cao</button>
            <button onClick={() => handleQuickReply('Liên hệ nhà tuyển dụng')}>Liên hệ nhà tuyển dụng</button>
          </div>
        </div>

        <div className="chat-footer">
          <input 
            type="text" 
            placeholder="Nhập tin nhắn..." 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend(inputValue)}
          />
          <button onClick={() => handleSend(inputValue)} disabled={!inputValue.trim()}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
};
