const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Profile API calls
export const fetchUserProfile = async (walletAddress) => {
  try {
    const response = await fetch(`${API_URL}/profile/${walletAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const saveUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/profile/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      throw new Error('Failed to save profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const updateProfileSettings = async (walletAddress, settings) => {
  try {
    const response = await fetch(`${API_URL}/profile/settings/${walletAddress}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}; 