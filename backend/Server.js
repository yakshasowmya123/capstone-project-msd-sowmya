const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User.model');
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transactions.routes');


dotenv.config();
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(' Missing required environment variables:', missingVars);
  console.error(' Please check your .env file');
  process.exit(1);
}
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/user', async (req, res) => {
  try {
    const users = [
      { name: 'Ayush Singh', email: 'a@gmail.com', password: '123' },
      { name: 'Varshini Allam', email: 'v@gmail.com', password: '123' },
      { name: 'V.Y. Somya', email: 's@gmail.com', password: '123' },
      { name: 'Sindhu Meghana', email: 'm@gmail.com', password: '123' }

    ];
    await User.deleteMany({});
    const result = await User.insertMany(users);
    res.status(200).json({ message: '10 users added successfully!', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding users' });
  }
});

app.get('/trans', async (req, res) => {
  try {

    const user = await User.findOne();
    if (!user) return res.status(400).json({ error: 'No user found to assign transactions' });

    const transactions = [
      { user: user._id, text: 'Salary credited', amount: 50000 },
      { user: user._id, text: 'Grocery shopping', amount: -3200 },
      { user: user._id, text: 'Electricity bill', amount: -1500 },
      { user: user._id, text: 'Freelance project payment', amount: 12000 },
    ];

    await Transaction.deleteMany({});
    const result1 = await Transaction.insertMany(transactions);

    res.status(200).json({ message: '4 transactions added successfully!', result1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding transactions' });
  }
});
app.get('/', (req, res) => res.send('Expense Tracker API Running'));
app.get('/api', (req, res) => res.json({
  status: 'working',
  timestamp: new Date().toISOString(),
  endpoints: {
    signup: '/api/auth/signup',
    login: '/api/auth/login'
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
