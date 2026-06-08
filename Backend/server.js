const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');
const app = require('./src/app');
// const authRoutes = require('./routes/authRoutes')

dotenv.config();

// Database Connection
connectDB();

// app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));