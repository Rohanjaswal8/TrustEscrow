import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Web3Context } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { FaEnvelope, FaTelegramPlane, FaSignOutAlt, FaUserEdit, FaFileContract, FaCog } from 'react-icons/fa';
import { fetchUserProfile, saveUserProfile, updateProfileSettings } from '../services/api';

const UserProfile = () => {
  const { account, contract, disconnect } = useContext(Web3Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showAgreementsModal, setShowAgreementsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Anonymous',
    bio: '',
    email: '',
    telegram: '',
    preferredCurrency: 'POL',
    settings: {
      darkMode: true,
      notifications: true,
      fontSize: 'medium',
      blockedUsers: [],
      language: 'en'
    },
    securitySettings: {
      requirePasswordForTransactions: true,
      enableLoginNotifications: true,
      lastPasswordChange: new Date().toISOString(),
      backupEmail: ''
    }
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!account) return;
      
      try {
        setLoading(true);
        const profileData = await fetchUserProfile(account);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
      setLoading(false);
      }
    };

    loadProfile();
  }, [account]);

  const handleInputChange = (e, field, section) => {
    e.preventDefault();
    e.stopPropagation();
    if (section) {
      setUserProfile(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }
      }));
    } else {
      setUserProfile(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await disconnect();
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      await saveUserProfile({
        wallet: account,
        ...userProfile
      });
    toast.success('Profile updated successfully!');
    setShowEditModal(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleBlockUser = async (address) => {
    try {
      const updatedSettings = {
        ...userProfile.settings,
        blockedUsers: [...userProfile.settings.blockedUsers, address]
      };
      
      await updateProfileSettings(account, updatedSettings);
    setUserProfile(prev => ({
      ...prev,
        settings: updatedSettings
    }));
    toast.success('User blocked successfully');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (address) => {
    try {
      const updatedSettings = {
        ...userProfile.settings,
        blockedUsers: userProfile.settings.blockedUsers.filter(addr => addr !== address)
      };
      
      await updateProfileSettings(account, updatedSettings);
    setUserProfile(prev => ({
      ...prev,
        settings: updatedSettings
    }));
    toast.success('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-16 w-16 border-4 border-white border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      {/* Banner */}
      <div className="relative max-w-3xl mx-auto mb-16">
        <div className="h-40 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl shadow-lg"></div>
        {/* Avatar - overlaps banner */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-indigo-400 overflow-hidden"
        >
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-5xl font-bold">
            {userProfile?.name?.charAt(0) || '?'}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mt-20"
      >
        {/* Name and Address */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
              {userProfile?.name || 'Anonymous'}
            <button
              onClick={() => setShowEditModal(true)}
              className="ml-2 p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 shadow transition"
              title="Edit Profile"
            >
              <FaUserEdit />
            </button>
          </h1>
          <p className="text-gray-500 mt-2 font-mono">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
          </div>

        {/* Profile Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 flex flex-col gap-4"
          >
            <h2 className="text-xl font-bold text-indigo-700 mb-2 flex items-center gap-2">
              <FaEnvelope className="text-indigo-400" /> Profile Information
                </h2>
            <div>
              <span className="text-gray-500 text-sm">Bio</span>
              <p className="text-gray-900 font-medium">{userProfile?.bio || 'No bio yet'}</p>
                  </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-indigo-400" />
              <span className="text-gray-900">{userProfile?.email || 'Not set'}</span>
                  </div>
            <div className="flex items-center gap-2">
              <FaTelegramPlane className="text-blue-400" />
              <span className="text-gray-900">{userProfile?.telegram || 'Not set'}</span>
              </div>
            </motion.div>

          {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 flex flex-col gap-6 items-center justify-center"
          >
            <h2 className="text-xl font-bold text-indigo-700 mb-2">Quick Actions</h2>
              <button
              onClick={() => setShowAgreementsModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-xl hover:from-green-500 hover:to-blue-500 transition-all duration-200 shadow-lg text-lg font-medium"
              >
              <FaFileContract /> Agreements & Policy
              </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-white rounded-xl hover:from-yellow-500 hover:to-pink-500 transition-all duration-200 shadow-lg text-lg font-medium"
            >
              <FaCog /> Settings
            </button>
                        <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl hover:from-pink-600 hover:to-indigo-600 transition-all duration-200 shadow-lg text-lg font-medium"
                        >
              <FaSignOutAlt /> Logout
                        </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Agreements Modal */}
      {showAgreementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Escrow Agreements</h2>
              <button
                onClick={() => setShowAgreementsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-white/80 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
                <div className="prose prose-sm">
                  <h4 className="font-medium mb-2">1. Escrow Service Agreement</h4>
                  <p className="text-gray-600 mb-4">
                    This agreement outlines the terms and conditions between the buyer, seller, and the escrow service provider.
                  </p>
                  
                  <h4 className="font-medium mb-2">2. Buyer's Obligations</h4>
                  <ul className="list-disc pl-5 text-gray-600 mb-4">
                    <li>Deposit funds in the escrow contract</li>
                    <li>Verify received goods or services</li>
                    <li>Release funds upon satisfaction</li>
                    <li>Raise disputes if necessary</li>
                  </ul>

                  <h4 className="font-medium mb-2">3. Seller's Obligations</h4>
                  <ul className="list-disc pl-5 text-gray-600 mb-4">
                    <li>Provide goods or services as agreed</li>
                    <li>Maintain communication</li>
                    <li>Address buyer concerns</li>
                    <li>Participate in dispute resolution</li>
                  </ul>

                  <h4 className="font-medium mb-2">4. Dispute Resolution</h4>
                  <p className="text-gray-600 mb-4">
                    In case of disputes, both parties agree to participate in the resolution process through the platform's arbitration system.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-white/80 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Password for Transactions</h4>
                      <p className="text-sm text-gray-500">Require password confirmation for all transactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userProfile.securitySettings.requirePasswordForTransactions}
                        onChange={(e) => handleInputChange(e, 'requirePasswordForTransactions', 'securitySettings')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Login Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userProfile.securitySettings.enableLoginNotifications}
                        onChange={(e) => handleInputChange(e, 'enableLoginNotifications', 'securitySettings')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Backup Email</h4>
                    <input
                      type="email"
                      value={userProfile.securitySettings.backupEmail}
                      onChange={(e) => handleInputChange(e, 'backupEmail', 'securitySettings')}
                      placeholder="Enter backup email"
                      className="mt-1 block w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Last Password Change</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(userProfile.securitySettings.lastPasswordChange).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => toast.info('Password change functionality will be implemented soon')}
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-white/80 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
                      <p className="text-sm text-gray-500">Enable dark theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userProfile.settings.darkMode}
                        onChange={(e) => handleInputChange(e, 'darkMode', 'settings')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Font Size</h4>
                    <select
                      value={userProfile.settings.fontSize}
                      onChange={(e) => handleInputChange(e, 'fontSize', 'settings')}
                      className="mt-1 block w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Notifications</h4>
                      <p className="text-sm text-gray-500">Receive alerts for transactions and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userProfile.settings.notifications}
                        onChange={(e) => handleInputChange(e, 'notifications', 'settings')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blocked Users</h3>
                <div className="space-y-4">
                  {userProfile.settings.blockedUsers.length > 0 ? (
                    userProfile.settings.blockedUsers.map((address) => (
                      <div key={address} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                        <button
                          onClick={() => handleUnblockUser(address)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No blocked users</p>
                  )}
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Language</h3>
                <select
                  value={userProfile.settings.language}
                  onChange={(e) => handleInputChange(e, 'language', 'settings')}
                  className="mt-1 block w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={userProfile?.name || ''}
                  onChange={(e) => handleInputChange(e, 'name')}
                  className="mt-1 block w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={userProfile?.bio || ''}
                  onChange={(e) => handleInputChange(e, 'bio')}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={userProfile?.email || ''}
                  onChange={(e) => handleInputChange(e, 'email')}
                  className="mt-1 block w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telegram</label>
                <input
                  type="text"
                  value={userProfile?.telegram || ''}
                  onChange={(e) => handleInputChange(e, 'telegram')}
                  className="mt-1 block w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                  Save Changes
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;