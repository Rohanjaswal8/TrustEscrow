const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Simple CORS configuration
app.use(cors());
app.use(express.json());

// In-memory storage for tickets
let tickets = [];

// Create support ticket
app.post('/api/support-tickets', async (req, res) => {
  try {
    const { email, subject, message, walletAddress } = req.body;

    // Validate required fields
    if (!email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create ticket
    const ticket = {
      id: Date.now().toString(),
      email,
      subject,
      message,
      walletAddress: walletAddress || 'Not provided',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Store ticket
    tickets.push(ticket);

    // Return success
      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        ticketId: ticket.id
      });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating ticket',
      error: error.message
    });
  }
});

// Get all tickets
app.get('/api/support-tickets', (req, res) => {
  res.json(tickets);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      hasApiKey: true // We're setting this to true since we're not using SendGrid
    }
  });
});

// Routes
  const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});