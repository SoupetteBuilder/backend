const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

//Connection to the DB

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

app.use(express.json());

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
