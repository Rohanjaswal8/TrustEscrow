import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useWeb3 } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { FaUser, FaPaperPlane, FaTimes } from 'react-icons/fa';

const ProjectChat = ({ projectId, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const { projectChats, activeProjectChat, sendProjectMessage, loadProjectChat } = useChat();
  const { account, contract } = useWeb3();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectChat(projectId);
    }
  }, [isOpen, projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [projectChats[projectId]]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendProjectMessage(projectId, message);
      setMessage('');
    }
  };

  const getParticipantRole = (address) => {
    if (!contract) return 'Unknown';
    
    // You would typically get this from your contract
    // For now, we'll just return a placeholder
    return address === account ? 'You' : 'Participant';
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col"
    >
      {/* Chat Header */}
      <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaUser className="h-6 w-6" />
          <h3 className="font-semibold">Project Chat #{projectId}</h3>
        </div>
        <button
          onClick={onClose}
          className="hover:text-gray-200 transition-colors"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {projectChats[projectId]?.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === account ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === account
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <FaUser className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {getParticipantRole(msg.sender)}
                </span>
              </div>
              <p>{msg.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPaperPlane className="h-5 w-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProjectChat; 