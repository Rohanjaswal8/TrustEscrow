import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import { toast } from 'react-toastify';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { account, contract } = useWeb3();
  const [projectChats, setProjectChats] = useState({});
  const [activeProjectChat, setActiveProjectChat] = useState(null);

  // Project chat messages
  const sendProjectMessage = async (projectId, message) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const newMessage = {
        sender: account,
        text: message,
        timestamp: new Date().toISOString(),
        projectId
      };

      // Update local state
      setProjectChats(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newMessage]
      }));

      // Here you would typically store the message in your backend or IPFS
      // For now, we'll just simulate it
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending project message:', error);
      toast.error('Failed to send message');
    }
  };

  // Load project chat history
  const loadProjectChat = async (projectId) => {
    if (!contract || !account) return;

    try {
      // Here you would typically fetch chat history from your backend or IPFS
      // For now, we'll just set an empty array
      setProjectChats(prev => ({
        ...prev,
        [projectId]: []
      }));
      setActiveProjectChat(projectId);
    } catch (error) {
      console.error('Error loading project chat:', error);
      toast.error('Failed to load chat history');
    }
  };

  const value = {
    projectChats,
    activeProjectChat,
    sendProjectMessage,
    loadProjectChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 