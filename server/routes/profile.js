const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Get profile by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const profile = await Profile.findOne({ wallet: req.params.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Save/Update profile
router.post('/save', async (req, res) => {
  try {
    console.log('--- Incoming /save request ---');
    console.log('Request body:', req.body);
    const { wallet, name, email, bio, telegram, preferredCurrency, settings, securitySettings } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { wallet },
      {
        name,
        email,
        bio,
        telegram,
        preferredCurrency,
        settings,
        securitySettings,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Profile saved/updated:', profile);
    res.json(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: 'Error saving profile', error: error.message, stack: error.stack });
  }
});

// Update profile settings
router.put('/settings/:walletAddress', async (req, res) => {
  try {
    const { settings } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { wallet: req.params.walletAddress },
      { 
        settings,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message, stack: error.stack });
  }
});

module.exports = router;