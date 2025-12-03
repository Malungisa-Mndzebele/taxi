import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './RideChat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RideChat = ({ rideId, currentUser, otherUser, token }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Join ride chat room
    newSocket.emit('join-ride-chat', rideId);

    // Load existing messages
    loadMessages();

    return () => {
      newSocket.emit('leave-ride-chat', rideId);
      newSocket.disconnect();
    };
  }, [rideId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    // Listen for typing indicator
    socket.on('user-typing', ({ userId, isTyping }) => {
      if (userId !== currentUser.id) {
        setIsTyping(isTyping);
      }
    });

    // Listen for read receipts
    socket.on('message-read-receipt', ({ messageId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('message-read-receipt');
    };
  }, [socket, currentUser]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/messages/ride/${rideId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    try {
      await axios.post(
        `${API_URL}/api/messages`,
        {
          rideId,
          message: messageText,
          messageType: 'text'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit('send-message', {
          rideId,
          message: messageText,
          sender: currentUser,
          senderRole: currentUser.role,
          timestamp: new Date()
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageText);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputMessage(text);

    if (!socket) return;

    // Emit typing indicator
    socket.emit('typing', {
      rideId,
      userId: currentUser.id,
      isTyping: text.length > 0
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        rideId,
        userId: currentUser.id,
        isTyping: false
      });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="ride-chat">
      <div className="chat-header">
        <div className="chat-user-info">
          <h3>{otherUser?.firstName} {otherUser?.lastName}</h3>
          <p className="user-role">
            {currentUser.role === 'passenger' ? 'Your Driver' : 'Your Passenger'}
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isMyMessage = msg.sender?._id === currentUser.id || msg.senderRole === currentUser.role;
          
          return (
            <div
              key={msg._id || index}
              className={`message ${isMyMessage ? 'my-message' : 'other-message'}`}
            >
              {!isMyMessage && (
                <div className="message-sender">
                  {msg.sender?.firstName || otherUser?.firstName}
                </div>
              )}
              <div className="message-content">
                <p>{msg.message}</p>
                <div className="message-footer">
                  <span className="message-time">
                    {formatTime(msg.createdAt || msg.timestamp)}
                  </span>
                  {isMyMessage && msg.isRead && (
                    <span className="read-indicator" title="Read">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="typing-indicator">
          <span>{otherUser?.firstName} is typing</span>
          <span className="typing-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      )}

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          maxLength={1000}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="send-button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default RideChat;
