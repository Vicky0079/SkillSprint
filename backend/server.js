const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/execute', require('./routes/executionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes')); 
app.use('/api/premium', require('./routes/premiumRoutes'));
app.use('/api/earn', require('./routes/earnRoutes'));

// Test Route
app.get('/', (req, res) => {
    res.send('SkillSprint Backend is running! 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});