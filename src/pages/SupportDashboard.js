import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaInbox, FaCheck, FaClock, FaReply } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/support-tickets`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to fetch support tickets'
        }));
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error(error.message || 'Failed to fetch support tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      setResponding(true);
      const res = await fetch(`${API_URL}/support-tickets/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: response.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          message: 'Failed to send response'
        }));
        throw new Error(errorData.message);
      }

      const data = await res.json();

      if (data.success) {
        toast.success('Response sent successfully');
        setResponse('');
        setSelectedTicket(null);
        fetchTickets();
      } else {
        throw new Error(data.message || 'Failed to send response');
      }

    } catch (error) {
      console.error('Error sending response:', error);
      toast.error(error.message || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaInbox className="text-yellow-500" />;
      case 'responded':
        return <FaCheck className="text-green-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Support Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Support Tickets</h2>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-gray-500">No support tickets yet.</p>
              ) : (
                tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{ticket.subject}</span>
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>From: {ticket.email}</p>
                      <p>Wallet: {ticket.walletAddress}</p>
                      <p>Date: {new Date(ticket.timestamp).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Details */}
          {selectedTicket && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800">{selectedTicket.subject}</h3>
                  <p className="text-gray-600 mt-2">{selectedTicket.message}</p>
                </div>

                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Responses</h4>
                    <div className="space-y-3">
                      {selectedTicket.responses.map((response) => (
                        <div key={response.id} className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-800">{response.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(response.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleRespond} className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Type your response here..."
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={responding}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                  >
                    {responding ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      <>
                        <FaReply className="mr-2" /> Send Response
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard; 