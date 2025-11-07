import React, { useState, useEffect, useRef } from 'react';
import { CryptoService } from '../crypto/CryptoService';
import { ApiService } from '../services/ApiService';

const Chat = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceKeys, setDeviceKeys] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const keys = await CryptoService.getDeviceKeys();
      setDeviceKeys(keys);
      await fetchMessages();
    } catch (error) {
      console.error('Chat initialization error:', error);
    }
  };

  const fetchMessages = async () => {
    if (loading) return; // Prevent concurrent requests
    try {
      const keys = deviceKeys || await CryptoService.getDeviceKeys();
      if (!keys) {
        console.log('Device keys not available yet');
        return;
      }

      const result = await ApiService.getUnreadMessages();
      const decryptedMessages = [];

      for (const msg of result.messages) {
        try {
          const encryptedData = JSON.parse(msg.ciphertext);
          const decryptedText = await CryptoService.decryptMessage(
            encryptedData,
            keys.x25519.privateKey
          );
          
          decryptedMessages.push({
            ...msg,
            decryptedText,
            isOwn: msg.senderId === user.userId
          });

          // Mark as read
          await ApiService.markMessageRead(msg.msgId);
        } catch (decryptError) {
          console.error('Message decryption failed:', decryptError);
        }
      }

      setMessages(prev => {
        const existing = new Set(prev.map(m => m.msgId));
        const newMsgs = decryptedMessages.filter(m => !existing.has(m.msgId));
        return [...prev, ...newMsgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientId.trim()) return;

    setLoading(true);
    try {
      // Get recipient's public keys
      const cleanRecipientId = recipientId.trim();
      const recipientKeys = await ApiService.getPublicKeys(cleanRecipientId);
      if (!recipientKeys.devices.length) {
        throw new Error('Recipient not found or has no active devices');
      }

      // Encrypt message for the first active device (simplified)
      const recipientDevice = recipientKeys.devices[0];
      const encryptedData = await CryptoService.encryptMessage(
        newMessage,
        recipientDevice.publicKey.x25519
      );

      // Send encrypted message
      await ApiService.sendMessage({
        recipientIds: [cleanRecipientId],
        ciphertext: JSON.stringify(encryptedData),
        messageType: 'text'
      });

      // Add to local messages
      const newMsg = {
        msgId: Date.now().toString(),
        senderId: user.userId,
        recipientIds: [cleanRecipientId],
        decryptedText: newMessage,
        createdAt: new Date().toISOString(),
        isOwn: true
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Secure Chat - {user.name}</h2>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, userSelect: 'all' }}>
            ID: {user.userId}
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
              No messages yet. Start a conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.msgId}
                style={{
                  alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.isOwn ? '#007bff' : 'white',
                  color: msg.isOwn ? 'white' : '#333',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  maxWidth: '70%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  wordBreak: 'break-word'
                }}
              >
                <div>{msg.decryptedText}</div>
                <div style={{
                  fontSize: '0.75rem',
                  opacity: 0.7,
                  marginTop: '0.25rem'
                }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'white',
          borderTop: '1px solid #dee2e6'
        }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Recipient User ID"
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                width: '200px'
              }}
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim() || !recipientId.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;