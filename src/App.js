import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateProject from './pages/CreateProject';
import ViewEscrow from './pages/ViewEscrow';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Dispute from './pages/Dispute';
import Documentation from './pages/Documentation';
import DisputeCenter from './pages/DisputeCenter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Create styled alert element
    const alertDiv = document.createElement('div');
    alertDiv.id = 'security-alert';
    alertDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      display: none;
      animation: fadeIn 0.3s ease-in-out;
    `;
    alertDiv.innerHTML = `
      <div style="font-size: 1.5rem; margin-bottom: 1rem; color: #ff4444;">
        <i class="fas fa-shield-alt"></i> Security Alert
      </div>
      <p style="margin-bottom: 1rem;">Screenshots and right-click are prohibited due to security reasons.</p>
      <button onclick="this.parentElement.style.display='none'" 
              style="background: #ff4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">
        Close
      </button>
    `;
    document.body.appendChild(alertDiv);

    // Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      const alert = document.getElementById('security-alert');
      alert.style.display = 'block';
      setTimeout(() => {
        alert.style.display = 'none';
      }, 3000);
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      // Check for Print Screen, Windows + Shift + S, etc.
      if (
        (e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.key === 's' && e.shiftKey && e.metaKey) // Mac screenshot
      ) {
        e.preventDefault();
        const alert = document.getElementById('security-alert');
        alert.style.display = 'block';
        setTimeout(() => {
          alert.style.display = 'none';
        }, 3000);
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Add CSS to prevent text selection and enhance security
    const style = document.createElement('style');
    style.textContent = `
      * {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
      #security-alert {
        backdrop-filter: blur(5px);
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
      document.body.removeChild(alertDiv);
    };
  }, []);

  return (
    <Web3Provider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-gray-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateProject />} />
              <Route path="/escrow/:id" element={<ViewEscrow />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/dispute/:id" element={<Dispute />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/dispute-center" element={<DisputeCenter />} />
            </Routes>
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </ChatProvider>
    </Web3Provider>
  );
}

export default App; 