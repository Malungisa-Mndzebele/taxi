import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_URL = process.env.API_URL || 'http://localhost:5000';

const RideChatScreen = ({ route, navigation }) => {
  const { rideId, otherUser } = route.params;
  const { user, token } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadMessages();
    
    // Join ride chat room
    if (socket) {
      socket.emit('join-ride-chat', rideId);
      
      // Listen for new messages
      socket.on('new-message', handleNewMessage);
      
      // Listen for typing indicator
      socket.on('user-typing', handleTyping);
      
      // Listen for read receipts
      socket.on('message-read-receipt', handleReadReceipt);
    }

    return () => {
      if (socket) {
        socket.emit('leave-ride-chat', rideId);
        socket.off('new-message', handleNewMessage);
        socket.off('user-typing', handleTyping);
        socket.off('message-read-receipt', handleReadReceipt);
      }
    };
  }, [rideId, socket]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/messages/ride/${rideId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    setMessages(prev => [...prev, data]);
    scrollToBottom();
  };

  const handleTyping = ({ userId, isTyping }) => {
    if (userId !== user.id) {
      setIsTyping(isTyping);
    }
  };

  const handleReadReceipt = ({ messageId }) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    const messageText = inputMessage.trim();
    setInputMessage('');

    try {
      const response = await axios.post(
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
          sender: user,
          senderRole: user.role,
          timestamp: new Date()
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (text) => {
    setInputMessage(text);

    // Emit typing indicator
    if (socket) {
      socket.emit('typing', {
        rideId,
        userId: user.id,
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
          userId: user.id,
          isTyping: false
        });
      }, 2000);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender?._id === user.id || item.senderRole === user.role;
    
    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>
            {item.sender?.firstName || otherUser?.firstName}
          </Text>
        )}
        <Text style={styles.messageText}>{item.message}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt || item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          {isMyMessage && item.isRead && (
            <Icon name="done-all" size={16} color="#4CAF50" style={styles.readIcon} />
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {otherUser?.firstName} {otherUser?.lastName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {user.role === 'passenger' ? 'Your Driver' : 'Your Passenger'}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {otherUser?.firstName} is typing...
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerInfo: {
    marginLeft: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4
  },
  messageText: {
    fontSize: 16,
    color: '#000'
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
    marginRight: 4
  },
  readIcon: {
    marginLeft: 4
  },
  typingIndicator: {
    padding: 8,
    paddingLeft: 16,
    backgroundColor: '#fff'
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc'
  }
});

export default RideChatScreen;
