const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbRoute = require('../middleware/services/threadDb/routes');
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
app.use(cookieParser());

const PORT = process.env.PORT || 3001;

const http = require('http').createServer(app);

dbRoute(app);

http.listen('3001', () => {
  console.log('Listening on port:', PORT);
});
