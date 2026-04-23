const express = require('express');
const http = require('http');
const cors = require('cors');
const flash = require('connect-flash');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const initializeSocket = require('./config/socket');
require('dotenv').config();
require('./controllers/passport');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to Mongo DB'))
  .catch(err => console.error('Could not connect to Mongo DB', err));

const app = express();
const server = http.createServer(app);

const io = initializeSocket(server);
app.set('io', io);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false, 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax'
  }
}));

app.use(passport.initialize());   
app.use(passport.session());
app.use(flash());

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});